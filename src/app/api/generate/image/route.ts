import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

interface ImageGenerationRequest {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  cfg?: number;
  seed?: number;
  model?: string;
}

// ComfyUI API configuration
const COMFYUI_URL = process.env.COMFYUI_URL || 'http://host.docker.internal:8188';

interface ComfyUIPrompt {
  [nodeId: string]: {
    inputs: Record<string, any>;
    class_type: string;
  };
}

// Build ComfyUI prompt
function buildComfyUIPrompt(options: ImageGenerationRequest): ComfyUIPrompt {
  const seed = options.seed || Math.floor(Math.random() * 1000000000);
  const width = options.width || 512;
  const height = options.height || 768;
  const steps = options.steps || 20;
  const cfg = options.cfg || 8;
  const model = options.model || 'sd15_v1.4.safetensors';
  
  return {
    "3": {
      "inputs": { "text": options.prompt, "seed": seed },
      "class_type": "CLIPTextEncode"
    },
    "4": {
      "inputs": { "width": width, "height": height, "batch_size": 1 },
      "class_type": "EmptyLatentImage"
    },
    "5": {
      "inputs": {
        "cfg": cfg,
        "samples": 1,
        "scheduler": "normal",
        "steps": steps,
        "denoise": 1,
        "model": ["9", 0],
        "positive": ["3", 0],
        "negative": ["6", 0],
        "latent_image": ["4", 0]
      },
      "class_type": "KSampler"
    },
    "6": {
      "inputs": {
        "text": options.negativePrompt || "bad quality, low resolution, blurry, distorted",
        "seed": seed
      },
      "class_type": "CLIPTextEncode"
    },
    "9": {
      "inputs": { "ckpt_name": model },
      "class_type": "CheckpointLoaderSimple"
    },
    "10": {
      "inputs": { "images": ["5", 0] },
      "class_type": "SaveImage"
    }
  };
}

// POST - Generate image using ComfyUI
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ImageGenerationRequest = await request.json();
    const { prompt, negativePrompt, width, height, steps, cfg, seed, model } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    // Check if ComfyUI is available
    let comfyuiAvailable = false;
    try {
      const healthCheck = await fetch(`${COMFYUI_URL}/system_stats`, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      comfyuiAvailable = healthCheck.ok;
    } catch (error) {
      console.log('[IMAGE] ComfyUI not available, using mock');
    }

    if (!comfyuiAvailable) {
      // Mock response when ComfyUI is not available
      console.log(`[IMAGE MOCK] Generating image for prompt: ${prompt}`);
      return NextResponse.json({
        success: true,
        mock: true,
        message: 'ComfyUI not available, using mock response',
        imageUrl: `/api/generate/image/mock-${Date.now()}.png`,
        prompt,
        seed: seed || Math.floor(Math.random() * 1000000000),
        settings: { width, height, steps, cfg }
      });
    }

    // Send prompt to ComfyUI
    const comfyPrompt = buildComfyUIPrompt({
      prompt,
      negativePrompt,
      width,
      height,
      steps,
      cfg,
      seed,
      model
    });

    const response = await fetch(`${COMFYUI_URL}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: comfyPrompt })
    });

    if (!response.ok) {
      throw new Error(`ComfyUI API error: ${response.statusText}`);
    }

    const result = await response.json();
    
    console.log(`[IMAGE] Submitted prompt to ComfyUI: ${result.prompt_id}`);
    
    return NextResponse.json({
      success: true,
      mock: false,
      promptId: result.prompt_id,
      message: 'Image generation started',
      prompt,
      settings: { width, height, steps, cfg }
    });

  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: 'Failed to generate image', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// GET - Check ComfyUI status
export async function GET() {
  try {
    const response = await fetch(`${COMFYUI_URL}/system_stats`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      const stats = await response.json();
      return NextResponse.json({
        available: true,
        status: 'ready',
        stats
      });
    }
    
    return NextResponse.json({
      available: false,
      status: 'error',
      message: 'ComfyUI not responding'
    });
  } catch (error) {
    return NextResponse.json({
      available: false,
      status: 'unavailable',
      message: 'ComfyUI not accessible'
    });
  }
}
