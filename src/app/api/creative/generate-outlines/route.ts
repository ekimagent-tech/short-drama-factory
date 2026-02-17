import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { theme } = await request.json();

    if (!theme) {
      return NextResponse.json({ error: 'Theme is required' }, { status: 400 });
    }

    // Try to call local Ollama API
    try {
      const ollamaResponse = await fetch('http://host.docker.internal:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'glm-4.7-flash',
          prompt: `You are a creative story writer. Generate 3 creative story outlines based on the theme: "${theme}". 

Return ONLY a JSON array with this exact format (no other text):
[
  {"id": "1", "title": "Title", "description": "Description", "genre": "Genre"}
]

Make each outline creative and different. Write in Traditional Chinese.`,
          stream: false,
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (ollamaResponse.ok) {
        const data = await ollamaResponse.json();
        try {
          const outlines = JSON.parse(data.response);
          return NextResponse.json({ outlines });
        } catch {
          // If parsing fails, return mock data
        }
      }
    } catch (ollamaError) {
      console.log('Ollama not available, using fallback');
    }

    // Fallback: return mock outlines
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

    return NextResponse.json({ outlines: mockOutlines });
  } catch (error) {
    console.error('Error generating outlines:', error);
    return NextResponse.json({ error: 'Failed to generate outlines' }, { status: 500 });
  }
}
