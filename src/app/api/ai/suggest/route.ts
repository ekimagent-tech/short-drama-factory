import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Mock AI suggestion function (fallback)
function generateMockSuggestion(type: string, context: any): any {
  const suggestions: Record<string, any> = {
    project: {
      name: '命運交錯的瞬間',
      description: '在繁華的都市中，兩個年輕人意外相遇，他們的人生從此交織在一起。這個故事探索了命運、愛情和成長的主題。',
    },
    scene: {
      description: '陽光透過落地窗灑進咖啡廳，溫暖的光線照亮了整個空間。客人們悠閒地喝著咖啡，輕鬆的氛圍讓人感到舒適。',
      characterDescription: '主角穿著簡約的白色襯衫，頭髮微卷，表情溫柔而堅定。她的眼神中透露著對未來的期待。',
      cameraMovement: '緩慢推進鏡頭，從全景過渡到主角的特寫，營造親密的氛圍。',
      dialogue: '「今天的陽光真好呢...」她輕聲說道，手中捧著一杯熱咖啡。',
      backgroundMusic: '輕柔的鋼琴曲，帶有浪漫的氛圍',
      emotionTag: '溫暖、舒適、浪漫',
    },
    character: {
      name: '林曉晴',
      description: '28歲的年輕女性，獨立而堅強。她在廣告公司擔任設計師，夢想是開一家自己的咖啡廳。性格開朗但內心脆弱，渴望真正的愛情。',
      role: 'protagonist',
    },
  };
  
  return suggestions[type] || suggestions.scene;
}

// Call Ollama for AI suggestions
async function callOllama(type: string, context: any): Promise<any> {
  try {
    const prompt = type === 'project' 
      ? `根據以下主題生成項目建議：${context.theme || ''}。返回JSON格式：{"name": "項目名稱", "description": "項目描述"}`
      : type === 'scene'
      ? `根據以下場景上下文生成場景建議：${JSON.stringify(context)}。返回JSON格式：{"description": "場景描述", "characterDescription": "角色描述", "cameraMovement": "鏡頭運動", "dialogue": "對話", "backgroundMusic": "背景音樂", "emotionTag": "情緒標籤"}`
      : `根據以下上下文生成角色建議：${JSON.stringify(context)}。返回JSON格式：{"name": "角色名稱", "description": "角色描述", "role": "protagonist/supporting"}`;

    const response = await fetch('http://host.docker.internal:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'glm-4.7-flash',
        prompt,
        stream: false,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      try {
        return JSON.parse(data.response);
      } catch {
        return generateMockSuggestion(type, context);
      }
    }
  } catch (error) {
    console.error('Ollama call failed:', error);
  }
  
  return generateMockSuggestion(type, context);
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, context } = body;

    if (!type || !context) {
      return NextResponse.json({ error: 'Missing type or context' }, { status: 400 });
    }

    // Generate suggestion (try Ollama first, then fallback to mock)
    const suggestion = await callOllama(type, context);

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error('Error generating suggestion:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
