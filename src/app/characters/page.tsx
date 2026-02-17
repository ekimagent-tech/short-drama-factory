'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCharacterStore, Character } from '@/stores/character-store';
import { useAuthStore } from '@/stores/auth-store';

export default function CharactersPage() {
  const router = useRouter();
  const { characters, addCharacter, deleteCharacter } = useCharacterStore();
  const { isAuthenticated } = useAuthStore();
  
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    setLoading(true);

    // Generate mock character
    const newCharacter: Character = {
      id: `char-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      seed: Math.floor(Math.random() * 1000),
      createdAt: new Date().toISOString(),
    };

    // Simulate API call
    setTimeout(() => {
      addCharacter(newCharacter);
      setLoading(false);
      setShowForm(false);
      setName('');
      setDescription('');
    }, 500);
  };

  const handleDelete = (id: string) => {
    if (confirm('確定要刪除這個角色嗎？')) {
      deleteCharacter(id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">角色管理</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          新增角色
        </button>
      </div>

      {/* Add Character Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">新增角色</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    角色名稱
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500"
                    placeholder="例如：林曉晴"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    角色描述
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500"
                    placeholder="描述角色的外型和性格..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={loading || !name.trim() || !description.trim()}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? '建立中...' : '建立角色'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Characters Grid */}
      {characters.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((character) => (
            <div key={character.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                {character.imageUrl ? (
                  <img 
                    src={character.imageUrl} 
                    alt={character.name}
                    className="h-24 w-24 rounded-full border-4 border-white shadow"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-indigo-200 flex items-center justify-center text-3xl font-bold text-indigo-600">
                    {character.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg">{character.name}</h3>
                <p className="text-gray-500 text-sm mt-1 line-clamp-2">{character.description}</p>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => handleDelete(character.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    刪除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow">
          <div className="text-6xl mb-4">👤</div>
          <p className="text-gray-500">尚未建立任何角色</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 text-indigo-600 hover:text-indigo-800"
          >
            建立第一個角色
          </button>
        </div>
      )}
    </div>
  );
}
