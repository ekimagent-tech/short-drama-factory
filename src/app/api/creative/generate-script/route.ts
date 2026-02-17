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
      signal: AbortSignal.timeout(90000),
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
    const { outline } = await request.json();

    if (!outline) {
      return NextResponse.json({ error: 'Outline is required' }, { status: 400 });
    }

    // Use mock if disabled
    if (USE_MOCK) {
      const mockScript = `【第一幕】場景：咖啡廳

[清晨的陽光透過落地窗灑入，營造溫馨的氛圍]

林曉晴：「今天的陽光真好呢...」
[她獨自坐在窗邊，手中捧著一本書，嘴角帶著淺淺的微笑]

【第二幕】場景：街道

[突然下雨了，匆忙的行人四處躲避，雨滴打在地面上濺起水花]

陳宇軒：「需要傘嗎？」
[他撐著一把黑色雨傘出現在女主面前，雨水順著傘邊滴落]

林曉晴：[抬起頭]「謝謝你...」

【第三幕】場景：咖啡廳（一個月後）

[兩人再次相遇，這次是宇軒主動打招呼]

陳宇軒：「我們又見面了，還記得我嗎？」

林曉晴：「当然記得，謝謝你的傘。」

[相視而笑，陽光般的溫暖在兩人之間流轉]`;

      return NextResponse.json({ script: mockScript, source: 'mock' });
    }

    // Try Ollama
    const prompt = `Write a short drama script (about 3 scenes) based on this outline: "${outline.title} - ${outline.description}"

Format the script as a stage play with:
- Scene headers like 【第一幕】場景：場所
- Character names before dialogue
- Action descriptions in brackets [動作描述]
- Keep it concise but engaging

Write in Traditional Chinese.`;

    const response = await callOllama(prompt);

    if (response) {
      return NextResponse.json({ script: response, source: 'ollama' });
    }

    // Fallback to mock
    const mockScript = `【第一幕】場景：咖啡廳

[清晨的陽光透過落地窗灑入，營造溫馨的氛圍]

林曉晴：「今天的陽光真好呢...」
[她獨自坐在窗邊，手中捧著一本書，嘴角帶著淺淺的微笑]

【第二幕】場景：街道

[突然下雨了，匆忙的行人四處躲避，雨滴打在地面上濺起水花]

陳宇軒：「需要傘嗎？」
[他撐著一把黑色雨傘出現在女主面前，雨水順著傘邊滴落]

林曉晴：[抬起頭]「謝謝你...」

【第三幕】場景：咖啡廳（一個月後）

[兩人再次相遇，這次是宇軒主動打招呼]

陳宇軒：「我們又見面了，還記得我嗎？」

林曉晴：「当然記得，謝謝你的傘。」

[相視而笑，陽光般的溫暖在兩人之間流轉]`;

    return NextResponse.json({ script: mockScript, source: 'fallback' });
  } catch (error) {
    console.error('Error generating script:', error);
    return NextResponse.json({ error: 'Failed to generate script' }, { status: 500 });
  }
}
