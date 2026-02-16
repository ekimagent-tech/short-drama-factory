'use client';

import { useState } from 'react';

export default function CreativePage() {
  const [step, setStep] = useState(1);
  const [theme, setTheme] = useState('');
  const [loading, setLoading] = useState(false);

  const generateOutlines = () => {
    setLoading(true);
    setTimeout(() => {
      setStep(2);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">創作流程</h1>
      
      {step === 1 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">輸入你的創意主題</h2>
          <textarea
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="例如：一個關於都市愛情的故事..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md h-32"
          />
          <button
            onClick={generateOutlines}
            disabled={!theme || loading}
            className="mt-4 w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'AI 生成中...' : '生成故事大綱'}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">選擇故事大綱</h2>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg cursor-pointer hover:border-indigo-500">
              <h3 className="font-semibold">命運的相遇</h3>
              <p className="text-gray-500 text-sm mt-1">在繁忙的都市中，兩個年輕人意外相遇...</p>
            </div>
            <div className="p-4 border rounded-lg cursor-pointer hover:border-indigo-500">
              <h3 className="font-semibold">愛的考驗</h3>
              <p className="text-gray-500 text-sm mt-1">面對家庭和事業的抉擇...</p>
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <button onClick={() => setStep(1)} className="px-4 py-2 border rounded">上一步</button>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded">生成劇本</button>
          </div>
        </div>
      )}
    </div>
  );
}
