import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, AuthenticatedRequest } from '@/lib/middleware';

interface Scene {
  id: string;
  order: number;
  duration: number;
  description: string;
  characterDescription: string;
  cameraMovement: string;
  dialogue: string;
  backgroundMusic: string;
  emotionTag: string;
}

export async function POST(request: AuthenticatedRequest) {
  // Auth check
  const auth = authMiddleware(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { script } = await request.json();

    if (!script) {
      return NextResponse.json({ error: 'Script is required' }, { status: 400 });
    }

    // Parse scenes from script
    const sceneMatches = script.match(/【(\d+)幕】場景：([^【\n]+)/g) || [];
    const scenes: Scene[] = [];
    
    const defaultMusic = ['輕柔鋼琴曲', '浪漫小提琴', '溫馨氛圍', '快節奏流行', '悲傷鋼琴'];
    const defaultEmotion = ['浪漫', '溫馨', '緊張', '開心', '悲傷'];
    const cameraTypes = ['固定鏡頭', '推軌鏡頭', '搖鏡頭', '全景鏡頭', '特寫鏡頭'];

    sceneMatches.forEach((match: string, index: number) => {
      const sceneMatch = match.match(/【(\d+)幕】場景：(.+)/);
      if (sceneMatch) {
        scenes.push({
          id: `scene-${Date.now()}-${index}`,
          order: index + 1,
          duration: 5 + Math.floor(Math.random() * 5),
          description: sceneMatch[2].trim(),
          characterDescription: '主要角色登場',
          cameraMovement: cameraTypes[index % cameraTypes.length],
          dialogue: '',
          backgroundMusic: defaultMusic[index % defaultMusic.length],
          emotionTag: defaultEmotion[index % defaultEmotion.length],
        });
      }
    });

    // If no scenes found, create a default one
    if (scenes.length === 0) {
      scenes.push({
        id: `scene-${Date.now()}`,
        order: 1,
        duration: 5,
        description: '場景 1',
        characterDescription: '角色',
        cameraMovement: '固定鏡頭',
        dialogue: '',
        backgroundMusic: '輕柔鋼琴曲',
        emotionTag: '平靜',
      });
    }

    return NextResponse.json({ scenes });
  } catch (error) {
    console.error('Error generating scenes:', error);
    return NextResponse.json({ error: 'Failed to generate scenes' }, { status: 500 });
  }
}
