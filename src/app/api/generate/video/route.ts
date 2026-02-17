import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

interface VideoGenerationRequest {
  prompt?: string;
  images: string[]; // Array of image URLs to use as frames
  duration?: number; // seconds
  fps?: number;
  width?: number;
  height?: number;
  model?: string;
}

// Video generation configuration
const DEFAULT_DURATION = 5;
const DEFAULT_FPS = 24;
const DEFAULT_WIDTH = 512;
const DEFAULT_HEIGHT = 768;

// POST - Generate video
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: VideoGenerationRequest = await request.json();
    const { prompt, images, duration, fps, width, height, model } = body;

    if (!images || images.length === 0) {
      return NextResponse.json({ 
        error: 'Missing images - provide at least one image frame' 
      }, { status: 400 });
    }

    // Check if LTX-Video or other video generation service is available
    const ltxVideoUrl = process.env.LTX_VIDEO_URL;
    
    if (ltxVideoUrl) {
      try {
        // Attempt to call LTX-Video API
        const response = await fetch(`${ltxVideoUrl}/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            images,
            duration: duration || DEFAULT_DURATION,
            fps: fps || DEFAULT_FPS,
            width: width || DEFAULT_WIDTH,
            height: height || DEFAULT_HEIGHT,
            model
          }),
          signal: AbortSignal.timeout(60000) // 60s timeout
        });

        if (response.ok) {
          const result = await response.json();
          return NextResponse.json({
            success: true,
            mock: false,
            videoId: result.video_id,
            message: 'Video generation started',
            settings: { duration, fps, width, height }
          });
        }
      } catch (error) {
        console.log('[VIDEO] LTX-Video API error, falling back to mock');
      }
    }

    // Mock response - simulate video generation
    console.log(`[VIDEO MOCK] Generating video from ${images.length} images`);
    console.log(`[VIDEO MOCK] Prompt: ${prompt || 'Not provided'}`);
    
    const mockVideoId = `video_${Date.now()}`;
    const mockDuration = duration || DEFAULT_DURATION;
    
    // Simulate processing delay (in real implementation, this would be async)
    setTimeout(() => {
      console.log(`[VIDEO MOCK] Video ${mockVideoId} would be ready now`);
    }, 1000);

    return NextResponse.json({
      success: true,
      mock: true,
      videoId: mockVideoId,
      message: 'Video generation started (mock mode)',
      estimatedTime: mockDuration * 2, // rough estimate in seconds
      settings: {
        duration: mockDuration,
        fps: fps || DEFAULT_FPS,
        width: width || DEFAULT_WIDTH,
        height: height || DEFAULT_HEIGHT,
        frameCount: images.length,
        model: model || 'ltx-video-0.9.5'
      },
      note: 'LTX-Video not available. Install and configure LTX_VIDEO_URL for real generation.'
    });

  } catch (error) {
    console.error('Error generating video:', error);
    return NextResponse.json(
      { error: 'Failed to generate video', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// GET - Check video generation service status
export async function GET() {
  const ltxVideoUrl = process.env.LTX_VIDEO_URL;
  
  if (!ltxVideoUrl) {
    return NextResponse.json({
      available: false,
      status: 'unavailable',
      message: 'LTX-Video not configured',
      mockMode: true,
      configuration: {
        required: 'LTX_VIDEO_URL environment variable',
        optional: 'COMFYUI_URL for image generation'
      }
    });
  }

  try {
    const response = await fetch(`${ltxVideoUrl}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      const stats = await response.json();
      return NextResponse.json({
        available: true,
        status: 'ready',
        service: 'ltx-video',
        stats
      });
    }
    
    return NextResponse.json({
      available: false,
      status: 'error',
      message: 'LTX-Video not responding correctly'
    });
  } catch (error) {
    return NextResponse.json({
      available: false,
      status: 'unavailable',
      message: 'LTX-Video not accessible'
    });
  }
}
