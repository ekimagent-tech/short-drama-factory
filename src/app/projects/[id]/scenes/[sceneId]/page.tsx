'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useProjectStore, Scene } from '@/stores/project-store';
import { useAuthStore } from '@/stores/auth-store';

export default function SceneEditorPage() {
  const router = useRouter();
  const params = useParams();
  const { projects, updateProject } = useProjectStore();
  const { isAuthenticated } = useAuthStore();
  
  const [project, setProject] = useState<any>(null);
  const [scene, setScene] = useState<Scene | null>(null);
  const [isNew, setIsNew] = useState(false);
  
  // Form state
  const [duration, setDuration] = useState(5);
  const [description, setDescription] = useState('');
  const [characterDescription, setCharacterDescription] = useState('');
  const [cameraMovement, setCameraMovement] = useState('固定鏡頭');
  const [dialogue, setDialogue] = useState('');
  const [backgroundMusic, setBackgroundMusic] = useState('');
  const [emotionTag, setEmotionTag] = useState('');
  const [saving, setSaving] = useState(false);

  const cameraOptions = ['固定鏡頭', '推軌鏡頭', '搖鏡頭', '全景鏡頭', '特寫鏡頭', '環繞鏡頭', '俯視鏡頭', '仰視鏡頭'];
  const emotionOptions = ['平靜', '浪漫', '緊張', '開心', '悲傷', '憤怒', '驚訝', '溫馨'];
  const musicOptions = ['輕柔鋼琴曲', '浪漫小提琴', '溫馨氛圍', '快節奏流行', '悲傷鋼琴', '懸疑音樂', '歡快音樂', '自然音效'];

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const projectId = params.id as string;
    const sceneId = params.sceneId as string;

    // Get project from store or localStorage
    let foundProject = projects.find(p => p.id === projectId);
    if (!foundProject) {
      const stored = localStorage.getItem('project-store');
      if (stored) {
        const parsed = JSON.parse(stored);
        foundProject = parsed.state?.projects?.find((p: any) => p.id === projectId);
      }
    }

    if (foundProject) {
      setProject(foundProject);
      
      if (sceneId === 'new') {
        setIsNew(true);
        // Initialize with defaults
        setDescription('新場景描述');
        setCharacterDescription('');
        setCameraMovement('固定鏡頭');
        setDialogue('');
        setBackgroundMusic('輕柔鋼琴曲');
        setEmotionTag('平靜');
        setDuration(5);
      } else {
        const foundScene = foundProject.scenes?.find((s: Scene) => s.id === sceneId);
        if (foundScene) {
          setScene(foundScene);
          setDuration(foundScene.duration);
          setDescription(foundScene.description);
          setCharacterDescription(foundScene.characterDescription);
          setCameraMovement(foundScene.cameraMovement);
          setDialogue(foundScene.dialogue);
          setBackgroundMusic(foundScene.backgroundMusic);
          setEmotionTag(foundScene.emotionTag);
        }
      }
    }
  }, [params.id, params.sceneId, projects, isAuthenticated, router]);

  const handleSave = () => {
    if (!project) return;
    
    setSaving(true);

    const sceneData: Scene = {
      id: isNew ? `scene-${Date.now()}` : scene?.id || `scene-${Date.now()}`,
      order: isNew ? (project.scenes?.length || 0) + 1 : scene?.order || 1,
      duration,
      description,
      characterDescription,
      cameraMovement,
      dialogue,
      backgroundMusic,
      emotionTag,
    };

    let updatedScenes: Scene[];
    if (isNew) {
      updatedScenes = [...(project.scenes || []), sceneData];
    } else {
      updatedScenes = (project.scenes || []).map((s: Scene) => 
        s.id === scene?.id ? sceneData : s
      );
    }

    updateProject(project.id, {
      scenes: updatedScenes,
      updatedAt: new Date().toISOString(),
    });

    setTimeout(() => {
      setSaving(false);
      router.push(`/projects/${project.id}`);
    }, 500);
  };

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500">項目不存在</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={`/projects/${project.id}`} className="text-indigo-600 hover:underline">
          ← 返回項目
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isNew ? '新增場景' : '編輯場景'}
        </h1>

        <div className="space-y-6">
          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              場景時長（秒）
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="3"
                max="10"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-lg font-medium w-12">{duration}秒</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              場景描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500"
              placeholder="描述這個場景的視覺內容..."
            />
          </div>

          {/* Character Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              角色描述
            </label>
            <textarea
              value={characterDescription}
              onChange={(e) => setCharacterDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500"
              placeholder="描述場景中的角色..."
            />
          </div>

          {/* Camera Movement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              鏡頭運動
            </label>
            <select
              value={cameraMovement}
              onChange={(e) => setCameraMovement(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500"
            >
              {cameraOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Emotion Tag */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              情緒標籤
            </label>
            <div className="flex flex-wrap gap-2">
              {emotionOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setEmotionTag(opt)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    emotionTag === opt
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Background Music */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              背景音樂
            </label>
            <select
              value={backgroundMusic}
              onChange={(e) => setBackgroundMusic(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500"
            >
              {musicOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Dialogue */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              對話
            </label>
            <textarea
              value={dialogue}
              onChange={(e) => setDialogue(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 font-mono text-sm"
              placeholder="角色對話..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Link
              href={`/projects/${project.id}`}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              取消
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
