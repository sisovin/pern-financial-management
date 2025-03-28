import create from 'zustand';
import { User } from '../types/auth.types';
import authService from '../services/authService';

interface AuthState {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string) => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: async (email: string, password: string) => {
    const loggedInUser = await authService.login(email, password);
    set({ user: loggedInUser });
  },
  logout: () => {
    authService.logout();
    set({ user: null });
  },
  register: async (email: string, password: string) => {
    const registeredUser = await authService.register(email, password);
    set({ user: registeredUser });
  },
}));

export default useAuthStore;
