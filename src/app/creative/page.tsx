'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectStore, Project, Scene } from '@/stores/project-store';
import { useAuthStore } from '@/stores/auth-store';

interface Outline {
  id: string;
  title: string;
  description: string;
  genre: string;
}

export default function CreativePage() {
  const router = useRouter();
  const { addProject } = useProjectStore();
  const { isAuthenticated, token } = useAuthStore();
  
  const [step, setStep] = useState(1);
  const [theme, setTheme] = useState('');
  const [loading, setLoading] = useState(false);
  const [outlines, setOutlines] = useState<Outline[]>([]);
  const [selectedOutline, setSelectedOutline] = useState<Outline | null>(null);
  const [script, setScript] = useState('');
  const [scenes, setScenes] = useState<Scene[]>([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Generate outlines using AI (mock for now, can integrate with Ollama)
  const generateOutlines = async () => {
    if (!theme.trim() || !token) return;
    
    setLoading(true);
    
    try {
      // Try to call AI via local API
      const response = await fetch('/api/creative/generate-outlines', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ theme }),
      });

      if (response.ok) {
        const data = await response.json();
        setOutlines(data.outlines);
      } else {
        // Fallback to mock outlines
        const mockOutlines: Outline[] = [
          {
            id: '1',
            title: '命運的相遇',
            description: `${theme} - 在繁忙的都市中，兩個年輕人意外相遇，展開一段刻骨銘心的愛情故事。`,
            genre: '愛情',
          },
          {
            id: '2',
            title: '愛的考驗',
            description: `${theme} - 面對家庭和事業的雙重考驗，主人公必須做出艱難的抉擇。`,
            genre: '劇情',
          },
          {
            id: '3',
            title: '重逢的奇蹟',
            description: `${theme} - 多年後的同學會，舊情人再次相遇，發現彼此仍未忘記對方。`,
            genre: '浪漫',
          },
        ];
        setOutlines(mockOutlines);
      }
      setStep(2);
    } catch (error) {
      console.error('Error generating outlines:', error);
      // Fallback outlines
      const mockOutlines: Outline[] = [
        {
          id: '1',
          title: '命運的相遇',
          description: `${theme} - 在繁忙的都市中，兩個年輕人意外相遇，展開一段刻骨銘心的愛情故事。`,
          genre: '愛情',
        },
        {
          id: '2',
          title: '愛的考驗',
          description: `${theme} - 面對家庭和事業的雙重考驗，主人公必須做出艱難的抉擇。`,
          genre: '劇情',
        },
        {
            id: '3',
            title: '重逢的奇蹟',
            description: `${theme} - 多年後的同學會，舊情人再次相遇，發現彼此仍未忘記對方。`,
            genre: '浪漫',
          },
      ];
      setOutlines(mockOutlines);
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  // Generate script from selected outline
  const generateScript = async () => {
    if (!selectedOutline || !token) return;
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/creative/generate-script', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ outline: selectedOutline }),
      });

      if (response.ok) {
        const data = await response.json();
        setScript(data.script);
      } else {
        // Fallback mock script
        setScript(`【第一幕】場景：咖啡廳

[清晨的陽光透過落地窗灑入，營造溫馨的氛圍]

女主角（林曉晴）：「今天的陽光真好呢...」
[她獨自坐在窗邊，手中捧著一本書]

【第二幕】場景：街道

[突然下雨了，匆忙的行人四處躲避]

男主角（陳宇軒）：「需要傘嗎？」
[他撐著傘出現在女主面前]

【第三幕】場景：咖啡廳（回憶）

[兩人相視而笑，仿佛認識了很久]

林曉晴：「謝謝你，那天如果不是你的傘...」
陳宇軒：「或許這就是命運讓我們相遇吧。」`);
      }
      setStep(3);
    } catch (error) {
      console.error('Error generating script:', error);
      // Fallback mock script
      setScript(`【第一幕】場景：咖啡廳

[清晨的陽光透過落地窗灑入，營造溫馨的氛圍]

女主角（林曉晴）：「今天的陽光真好呢...」
[她獨自坐在窗邊，手中捧著一本書]

【第二幕】場景：街道

[突然下雨了，匆忙的行人四處躲避]

男主角（陳宇軒）：「需要傘嗎？」
[他撐著傘出現在女主面前]

【第三幕】場景：咖啡廳（回憶）

[兩人相視而笑，仿佛認識了很久]

林曉晴：「謝謝你，那天如果不是你的傘...」
陳宇軒：「或許這就是命運讓我們相遇吧。」`);
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  // Generate scenes from script
  const generateScenes = async () => {
    if (!script.trim() || !token) return;
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/creative/generate-scenes', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ script }),
      });

      if (response.ok) {
        const data = await response.json();
        setScenes(data.scenes);
      } else {
        // Fallback: parse script into scenes
        const parsedScenes = parseScriptToScenes(script);
        setScenes(parsedScenes);
      }
      setStep(4);
    } catch (error) {
      console.error('Error generating scenes:', error);
      // Fallback: parse script into scenes
      const parsedScenes = parseScriptToScenes(script);
      setScenes(parsedScenes);
      setStep(4);
    } finally {
      setLoading(false);
    }
  };

  // Parse script text into scenes
  const parseScriptToScenes = (scriptText: string): Scene[] => {
    const sceneMatches = scriptText.match(/【(\d+)幕】場景：([^【]+)/g) || [];
    const scenes: Scene[] = [];
    
    sceneMatches.forEach((match, index) => {
      const sceneMatch = match.match(/【(\d+)幕】場景：(.+)/);
      if (sceneMatch) {
        scenes.push({
          id: `scene-${Date.now()}-${index}`,
          order: index + 1,
          duration: 5,
          description: sceneMatch[2].trim(),
          characterDescription: '',
          cameraMovement: '固定鏡頭',
          dialogue: '',
          backgroundMusic: '輕柔鋼琴曲',
          emotionTag: '平靜',
        });
      }
    });

    // If no scenes parsed, create default
    if (scenes.length === 0) {
      scenes.push({
        id: `scene-${Date.now()}`,
        order: 1,
        duration: 5,
        description: '場景 1',
        characterDescription: '',
        cameraMovement: '固定鏡頭',
        dialogue: '',
        backgroundMusic: '輕柔鋼琴曲',
        emotionTag: '平靜',
      });
    }

    return scenes;
  };

  // Save project
  const saveProject = () => {
    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: selectedOutline?.title || '新項目',
      description: selectedOutline?.description || '',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      theme,
      outline: selectedOutline?.description,
      script,
      scenes,
    };
    
    addProject(newProject);
    router.push('/projects');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">創作流程</h1>
      
      {/* Progress Steps */}
      <div className="flex items-center mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= s ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {s}
            </div>
            {s < 4 && (
              <div className={`w-16 h-1 ${step > s ? 'bg-indigo-600' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>
      
      {/* Step 1: Theme Input */}
      {step === 1 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">輸入你的創意主題</h2>
          <textarea
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="例如：一個關於都市愛情的故事，兩人在雨中等相遇..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md h-32 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={generateOutlines}
            disabled={!theme.trim() || loading}
            className="mt-4 w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'AI 生成中...' : '生成故事大綱'}
          </button>
        </div>
      )}

      {/* Step 2: Outline Selection */}
      {step === 2 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">選擇故事大綱</h2>
          <div className="space-y-4">
            {outlines.map((outline) => (
              <div
                key={outline.id}
                onClick={() => setSelectedOutline(outline)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedOutline?.id === outline.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{outline.title}</h3>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">{outline.genre}</span>
                </div>
                <p className="text-gray-500 text-sm mt-1">{outline.description}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-6">
            <button 
              onClick={() => setStep(1)} 
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              上一步
            </button>
            <button
              onClick={generateScript}
              disabled={!selectedOutline || loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? '生成中...' : '生成劇本'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Script Preview/Edit */}
      {step === 3 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">劇本預覽與編輯</h2>
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md h-80 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
            placeholder="在此編輯劇本..."
          />
          <div className="flex justify-between mt-6">
            <button 
              onClick={() => setStep(2)} 
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              上一步
            </button>
            <button
              onClick={generateScenes}
              disabled={!script.trim() || loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? '生成中...' : '生成場景'}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Scenes */}
      {step === 4 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">場景列表</h2>
          <div className="space-y-4">
            {scenes.map((scene, index) => (
              <div key={scene.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">場景 {index + 1}</span>
                  <span className="text-sm text-gray-500">{scene.duration}秒</span>
                </div>
                <p className="text-gray-600 text-sm">{scene.description}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-6">
            <button 
              onClick={() => setStep(3)} 
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              上一步
            </button>
            <button
              onClick={saveProject}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              保存項目
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
