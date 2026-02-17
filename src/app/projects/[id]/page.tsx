'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useProjectStore, Project } from '@/stores/project-store';
import { useAuthStore } from '@/stores/auth-store';
import { useQueueStore, QueueTask } from '@/stores/queue-store';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { projects, updateProject, deleteProject } = useProjectStore();
  const { isAuthenticated } = useAuthStore();
  const { tasks, setTasks, addTask, updateTask, setIsPolling } = useQueueStore();
  
  const [project, setProject] = useState<Project | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  // Fetch queue status
  const fetchQueue = async () => {
    try {
      const response = await fetch('/api/queue');
      if (response.ok) {
        const data = await response.json();
        setTasks(data.queue);
      }
    } catch (error) {
      console.error('Error fetching queue:', error);
    }
  };

  // Poll queue
  useEffect(() => {
    if (showQueue) {
      setIsPolling(true);
      fetchQueue();
      const interval = setInterval(fetchQueue, 2000);
      return () => {
        clearInterval(interval);
        setIsPolling(false);
      };
    }
  }, [showQueue]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const projectId = params.id as string;
    const found = projects.find(p => p.id === projectId);
    if (found) {
      setProject(found);
      setEditName(found.name);
      setEditDescription(found.description);
    } else {
      const stored = localStorage.getItem('project-store');
      if (stored) {
        const parsed = JSON.parse(stored);
        const storedProject = parsed.state?.projects?.find((p: Project) => p.id === projectId);
        if (storedProject) {
          setProject(storedProject);
          setEditName(storedProject.name);
          setEditDescription(storedProject.description);
        }
      }
    }
  }, [params.id, projects, isAuthenticated, router]);

  const handleSave = () => {
    if (project) {
      updateProject(project.id, {
        name: editName,
        description: editDescription,
        updatedAt: new Date().toISOString(),
      });
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (project && confirm('確定要刪除這個項目嗎？')) {
      deleteProject(project.id);
      router.push('/projects');
    }
  };

  // AI Suggestion for project
  const handleAISuggest = async () => {
    if (!project) return;
    
    setIsAILoading(true);
    try {
      const response = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'project',
          context: { theme: project.theme, description: project.description },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const suggestion = data.suggestion;
        
        if (suggestion.name) {
          setEditName(suggestion.name);
        }
        if (suggestion.description) {
          setEditDescription(suggestion.description);
        }
        setIsEditing(true);
      }
    } catch (error) {
      console.error('AI suggestion error:', error);
    } finally {
      setIsAILoading(false);
    }
  };

  // Download as TXT
  const downloadAsTxt = () => {
    if (!project) return;
    
    let content = `=== ${project.name} ===\n\n`;
    content += `描述: ${project.description || '無'}\n`;
    content += `主題: ${project.theme || '無'}\n`;
    content += `大綱: ${project.outline || '無'}\n\n`;
    
    if (project.script) {
      content += `=== 劇本 ===\n\n${project.script}\n\n`;
    }
    
    if (project.scenes && project.scenes.length > 0) {
      content += `=== 場景 ===\n\n`;
      project.scenes.forEach((scene, index) => {
        content += `場景 ${index + 1} (${scene.duration}秒)\n`;
        content += `描述: ${scene.description}\n`;
        content += `角色: ${scene.characterDescription}\n`;
        content += `鏡頭: ${scene.cameraMovement}\n`;
        content += `對話: ${scene.dialogue}\n`;
        content += `音樂: ${scene.backgroundMusic}\n`;
        content += `情緒: ${scene.emotionTag}\n\n`;
      });
    }
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `${project.name}.txt`);
  };

  // Download as JSON
  const downloadAsJson = () => {
    if (!project) return;
    
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    saveAs(blob, `${project.name}.json`);
  };

  // Download as ZIP
  const downloadAsZip = async () => {
    if (!project) return;
    
    const zip = new JSZip();
    
    // Add project.json
    zip.file('project.json', JSON.stringify(project, null, 2));
    
    // Add script.txt
    if (project.script) {
      zip.file('script.txt', project.script);
    }
    
    // Add scenes.json
    if (project.scenes && project.scenes.length > 0) {
      zip.file('scenes.json', JSON.stringify(project.scenes, null, 2));
    }
    
    // Add readme
    let readme = `# ${project.name}\n\n`;
    readme += `描述: ${project.description || '無'}\n`;
    readme += `主題: ${project.theme || '無'}\n`;
    readme += `創建時間: ${project.createdAt}\n`;
    readme += `最後更新: ${project.updatedAt}\n`;
    zip.file('README.md', readme);
    
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${project.name}.zip`);
  };

  // Cancel queue task
  const cancelTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/queue?id=${taskId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchQueue();
      }
    } catch (error) {
      console.error('Error cancelling task:', error);
    }
  };

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500">項目不存在</p>
          <Link href="/projects" className="text-indigo-600 hover:underline mt-2 inline-block">
            返回項目列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/projects" className="text-indigo-600 hover:underline">
          ← 返回項目列表
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">項目名稱</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">描述</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                保存
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-gray-500 mt-1">{project.description || '暂无描述'}</p>
              <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                <span>建立於：{new Date(project.createdAt).toLocaleDateString('zh-TW')}</span>
                <span>狀態：{project.status === 'draft' ? '草稿' : project.status === 'in_progress' ? '進行中' : '已完成'}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleAISuggest}
                disabled={isAILoading}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {isAILoading ? 'AI 建議中...' : '一鍵AI建議'}
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                編輯
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50"
              >
                刪除
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Download Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3">下載功能</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={downloadAsTxt}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
          >
            📄 下載劇本 (TXT)
          </button>
          <button
            onClick={downloadAsJson}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            📋 下載場景 (JSON)
          </button>
          <button
            onClick={downloadAsZip}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm"
          >
            📦 下載完整項目 (ZIP)
          </button>
          <button
            onClick={() => setShowQueue(!showQueue)}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
          >
            {showQueue ? '隱藏隊列' : '查看隊列'}
          </button>
        </div>
      </div>

      {/* Queue Status */}
      {showQueue && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">生成隊列</h2>
          {tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map((task: QueueTask) => (
                <div key={task.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{task.type}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        task.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status === 'pending' ? '等待中' :
                         task.status === 'processing' ? '處理中' :
                         task.status === 'completed' ? '完成' : '失敗'}
                      </span>
                      {task.status === 'pending' && (
                        <button
                          onClick={() => cancelTask(task.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          取消
                        </button>
                      )}
                    </div>
                  </div>
                  {task.status === 'processing' && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  )}
                  {task.error && (
                    <p className="text-red-500 text-sm mt-1">{task.error}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">隊列為空</p>
          )}
        </div>
      )}

      {/* Project Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Theme */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-3">主題</h2>
          <p className="text-gray-600">{project.theme || '未設定'}</p>
        </div>

        {/* Outline */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-3">大綱</h2>
          <p className="text-gray-600">{project.outline || '未設定'}</p>
        </div>
      </div>

      {/* Script */}
      {project.script && (
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-lg font-semibold mb-3">劇本</h2>
          <pre className="whitespace-pre-wrap text-sm text-gray-600 bg-gray-50 p-4 rounded">
            {project.script}
          </pre>
        </div>
      )}

      {/* Scenes */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">場景列表</h2>
          <Link
            href={`/projects/${project.id}/scenes/new`}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm"
          >
            新增場景
          </Link>
        </div>
        
        {project.scenes && project.scenes.length > 0 ? (
          <div className="space-y-4">
            {project.scenes.map((scene, index) => (
              <Link
                key={scene.id}
                href={`/projects/${project.id}/scenes/${scene.id}`}
                className="block p-4 border rounded-lg hover:border-indigo-500 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">場景 {index + 1}</span>
                    <span className="text-gray-500 ml-2">{scene.duration}秒</span>
                  </div>
                  <span className="text-sm text-gray-500">{scene.description}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">尚未建立場景</p>
        )}
      </div>
    </div>
  );
}
