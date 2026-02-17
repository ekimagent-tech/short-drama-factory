'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSettingsStore, ProjectSettings } from '@/stores/settings-store';
import { useAuthStore } from '@/stores/auth-store';

const aspectRatios = ['9:16', '16:9', '1:1', '4:3'] as const;
const totalLengths = ['30s', '60s', '90s'] as const;
const qualities = ['360p', '480p', '720p'] as const;
const frameRates = [24, 30, 60] as const;
const stylePresets = ['寫實', '浪漫', '懸疑', '喜劇', '科幻', '古裝'];

export default function SettingsPage() {
  const router = useRouter();
  const { settings, updateSettings } = useSettingsStore();
  const { isAuthenticated, token } = useAuthStore();
  
  const [localSettings, setLocalSettings] = useState<ProjectSettings>(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    updateSettings(localSettings);
    
    // Save email preference to API
    if (localSettings.email && token) {
      fetch('/api/notify', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: localSettings.email }),
      }).catch(console.error);
    }
    
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setLocalSettings({
      sceneDurationMin: 3,
      sceneDurationMax: 10,
      aspectRatio: '9:16',
      totalLength: '60s',
      quality: '360p',
      frameRate: 30,
      stylePreset: '寫實',
      email: '',
      emailNotifications: false,
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">設定參數</h1>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Scene Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            場景時長範圍
          </label>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="text-xs text-gray-500">最短（秒）</label>
              <input
                type="number"
                min="1"
                max="10"
                value={localSettings.sceneDurationMin}
                onChange={(e) => setLocalSettings({ ...localSettings, sceneDurationMin: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <span className="pt-5">-</span>
            <div className="flex-1">
              <label className="text-xs text-gray-500">最長（秒）</label>
              <input
                type="number"
                min="1"
                max="30"
                value={localSettings.sceneDurationMax}
                onChange={(e) => setLocalSettings({ ...localSettings, sceneDurationMax: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Aspect Ratio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            畫面比例
          </label>
          <div className="grid grid-cols-4 gap-3">
            {aspectRatios.map((ratio) => (
              <button
                key={ratio}
                onClick={() => setLocalSettings({ ...localSettings, aspectRatio: ratio })}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  localSettings.aspectRatio === ratio
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>

        {/* Total Length */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            總長度
          </label>
          <div className="grid grid-cols-3 gap-3">
            {totalLengths.map((length) => (
              <button
                key={length}
                onClick={() => setLocalSettings({ ...localSettings, totalLength: length })}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  localSettings.totalLength === length
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {length}
              </button>
            ))}
          </div>
        </div>

        {/* Quality */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            畫質
          </label>
          <div className="grid grid-cols-3 gap-3">
            {qualities.map((quality) => (
              <button
                key={quality}
                onClick={() => setLocalSettings({ ...localSettings, quality })}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  localSettings.quality === quality
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {quality}
              </button>
            ))}
          </div>
        </div>

        {/* Frame Rate */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            幀率
          </label>
          <div className="grid grid-cols-3 gap-3">
            {frameRates.map((fps) => (
              <button
                key={fps}
                onClick={() => setLocalSettings({ ...localSettings, frameRate: fps })}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  localSettings.frameRate === fps
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {fps} FPS
              </button>
            ))}
          </div>
        </div>

        {/* Style Preset */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            風格預設
          </label>
          <select
            value={localSettings.stylePreset}
            onChange={(e) => setLocalSettings({ ...localSettings, stylePreset: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {stylePresets.map((style) => (
              <option key={style} value={style}>{style}</option>
            ))}
          </select>
        </div>

        {/* Email Notifications Section */}
        <div className="pt-4 border-t">
          <h3 className="text-lg font-medium text-gray-900 mb-4">郵件通知</h3>
          
          {/* Email Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              郵件地址
            </label>
            <input
              type="email"
              value={localSettings.email}
              onChange={(e) => setLocalSettings({ ...localSettings, email: e.target.value })}
              placeholder="your@email.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Email Notifications Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              啟用郵件通知
            </label>
            <button
              onClick={() => setLocalSettings({ ...localSettings, emailNotifications: !localSettings.emailNotifications })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                localSettings.emailNotifications ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  localSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            當 AI 生成完成或失敗時發送郵件通知
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            恢復預設
          </button>
          <div className="flex space-x-3">
            {saved && (
              <span className="text-green-600 self-center">已保存！</span>
            )}
            <button
              onClick={handleSave}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
            >
              保存設定
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
