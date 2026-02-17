import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, AuthenticatedRequest } from '@/lib/middleware';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://host.docker.internal:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen:7b';
const USE_MOCK = process.env.USE_MOCK_AI === 'true';

async function callOllama(prompt: string): Promise<string | null> {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      console.error('Ollama response not ok:', response.status);
      return null;
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Ollama call failed:', error);
    return null;
  }
}

export async function POST(request: AuthenticatedRequest) {
  // Auth check
  const auth = authMiddleware(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { theme } = await request.json();

    if (!theme) {
      return NextResponse.json({ error: 'Theme is required' }, { status: 400 });
    }

    // Use mock if disabled
    if (USE_MOCK) {
      const mockOutlines = [
        {
          id: '1',
          title: '命運的相遇',
          description: `${theme} - 在繁忙的都市中，兩個年輕人意外相遇，展開一段刻骨銘心的愛情故事。`,
          genre: '愛情',
        },
        {
          id: '2',
          title: '愛的考驗',
          description: `${theme} - 面對家庭和事業的雙重考驗，主人公必須做出艱難的抉擇，最終找到真愛。`,
          genre: '劇情',
        },
        {
          id: '3',
          title: '重逢的奇蹟',
          description: `${theme} - 多年後的同學會，舊情人再次相遇，發現彼此仍未忘記對方，展開一段浪漫的重逢。`,
          genre: '浪漫',
        },
      ];
      return NextResponse.json({ outlines: mockOutlines, source: 'mock' });
    }

    // Try Ollama
    const prompt = `You are a creative story writer. Generate 3 creative story outlines based on the theme: "${theme}". 

Return ONLY a JSON array with this exact format (no other text):
[
  {"id": "1", "title": "Title", "description": "Description", "genre": "Genre"}
]

Make each outline creative and different. Write in Traditional Chinese.`;

    const response = await callOllama(prompt);

    if (response) {
      try {
        const outlines = JSON.parse(response);
        return NextResponse.json({ outlines, source: 'ollama' });
      } catch (parseError) {
        console.error('Failed to parse Ollama response:', parseError);
      }
    }

    // Fallback to mock
    const mockOutlines = [
      {
        id: '1',
        title: '命運的相遇',
        description: `${theme} - 在繁忙的都市中，兩個年輕人意外相遇，展開一段刻骨銘心的愛情故事。`,
        genre: '愛情',
      },
      {
        id: '2',
        title: '愛的考驗',
        description: `${theme} - 面對家庭和事業的雙重考驗，主人公必須做出艱難的抉擇，最終找到真愛。`,
        genre: '劇情',
      },
      {
        id: '3',
        title: '重逢的奇蹟',
        description: `${theme} - 多年後的同學會，舊情人再次相遇，發現彼此仍未忘記對方，展開一段浪漫的重逢。`,
        genre: '浪漫',
      },
    ];

    return NextResponse.json({ outlines: mockOutlines, source: 'fallback' });
  } catch (error) {
    console.error('Error generating outlines:', error);
    return NextResponse.json({ error: 'Failed to generate outlines' }, { status: 500 });
  }
}
