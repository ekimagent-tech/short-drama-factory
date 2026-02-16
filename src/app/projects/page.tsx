'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useProjectStore, Project } from '@/stores/project-store';

export default function ProjectsPage() {
  const { projects, setProjects, deleteProject } = useProjectStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockProjects: Project[] = [
      {
        id: '1',
        name: '我的第一部短劇',
        description: '一個關於愛情的浪漫故事',
        status: 'in_progress',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    setProjects(mockProjects);
    setLoading(false);
  }, [setProjects]);

  const handleDelete = (id: string) => {
    if (confirm('確定要刪除這個項目嗎？')) {
      deleteProject(id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">載入中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">我的項目</h1>
        <Link href="/projects/new" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
          新建項目
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">還沒有任何項目</p>
          <Link href="/projects/new" className="text-indigo-600 hover:text-indigo-800">
            創建第一個項目
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.name}</h3>
              <p className="text-gray-500 text-sm mb-4">{project.description}</p>
              <div className="flex items-center justify-between">
                <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">
                  進行中
                </span>
                <div className="flex space-x-2">
                  <Link href={'/projects/' + project.id} className="text-indigo-600 hover:text-indigo-800 text-sm">
                    編輯
                  </Link>
                  <button onClick={() => handleDelete(project.id)} className="text-red-600 hover:text-red-800 text-sm">
                    刪除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
