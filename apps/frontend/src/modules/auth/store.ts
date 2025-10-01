import { create } from 'zustand';

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'EMPLOYEE';
}

interface AuthState {
  user?: UserInfo;
  setUser: (user?: UserInfo) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: undefined,
  setUser: (user) => set({ user })
}));
