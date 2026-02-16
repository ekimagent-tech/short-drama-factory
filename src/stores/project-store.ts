import { create } from 'zustand';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
  theme?: string;
  outline?: string;
  script?: string;
  scenes?: Scene[];
}

export interface Scene {
  id: string;
  order: number;
  duration: number;
  description: string;
  characterDescription: string;
  cameraMovement: string;
  dialogue: string;
  backgroundMusic: string;
  emotionTag: string;
  imagePrompt?: string;
  generatedImages?: string[];
}

export interface Character {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  seed?: number;
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  currentProject: null,
  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project }),
  addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map((p) => p.id === id ? { ...p, ...updates } : p),
    currentProject: state.currentProject?.id === id 
      ? { ...state.currentProject, ...updates } 
      : state.currentProject
  })),
  deleteProject: (id) => set((state) => ({
    projects: state.projects.filter((p) => p.id !== id),
    currentProject: state.currentProject?.id === id ? null : state.currentProject
  })),
}));
