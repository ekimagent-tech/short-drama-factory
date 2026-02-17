import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProjectSettings {
  sceneDurationMin: number;
  sceneDurationMax: number;
  aspectRatio: '9:16' | '16:9' | '1:1' | '4:3';
  totalLength: '30s' | '60s' | '90s';
  quality: '720p' | '1080p' | '4K';
  frameRate: 24 | 30 | 60;
  stylePreset: string;
}

interface SettingsState {
  settings: ProjectSettings;
  updateSettings: (updates: Partial<ProjectSettings>) => void;
}

const defaultSettings: ProjectSettings = {
  sceneDurationMin: 3,
  sceneDurationMax: 10,
  aspectRatio: '9:16',
  totalLength: '60s',
  quality: '1080p',
  frameRate: 30,
  stylePreset: '寫實',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (updates) => set((state) => ({
        settings: { ...state.settings, ...updates },
      })),
    }),
    {
      name: 'settings-storage',
    }
  )
);
