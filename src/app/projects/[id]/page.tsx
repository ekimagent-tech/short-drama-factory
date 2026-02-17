'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useProjectStore, Project } from '@/stores/project-store';
import { useAuthStore } from '@/stores/auth-store';

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { projects, updateProject, deleteProject } = useProjectStore();
  const { isAuthenticated } = useAuthStore();
  
  const [project, setProject] = useState<Project | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

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
      // Try to get from localStorage
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
