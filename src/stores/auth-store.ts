import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserDto } from '@/lib/types';

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserDto | null;
  setSession: (payload: { accessToken: string; refreshToken: string; user: UserDto }) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setSession: (payload) =>
        set({
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
          user: payload.user,
        }),
      clear: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    { name: 'tutienda-auth' },
  ),
);
