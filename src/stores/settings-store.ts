import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProjectSettings {
  sceneDurationMin: number;
  sceneDurationMax: number;
  aspectRatio: '9:16' | '16:9' | '1:1' | '4:3';
  totalLength: '30s' | '60s' | '90s';
  quality: '360p' | '480p' | '720p';
  frameRate: 24 | 30 | 60;
  stylePreset: string;
  email: string;
  emailNotifications: boolean;
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
  quality: '360p',
  frameRate: 30,
  stylePreset: '寫實',
  email: '',
  emailNotifications: false,
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
