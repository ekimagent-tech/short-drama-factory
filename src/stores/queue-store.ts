import { create } from 'zustand';

export interface QueueTask {
  id: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: any;
  error?: string;
  createdAt: string;
}

interface QueueState {
  tasks: QueueTask[];
  isPolling: boolean;
  setTasks: (tasks: QueueTask[]) => void;
  addTask: (task: QueueTask) => void;
  updateTask: (id: string, updates: Partial<QueueTask>) => void;
  removeTask: (id: string) => void;
  setIsPolling: (isPolling: boolean) => void;
}

export const useQueueStore = create<QueueState>((set) => ({
  tasks: [],
  isPolling: false,
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map((t) => t.id === id ? { ...t, ...updates } : t),
  })),
  removeTask: (id) => set((state) => ({
    tasks: state.tasks.filter((t) => t.id !== id),
  })),
  setIsPolling: (isPolling) => set({ isPolling }),
}));
