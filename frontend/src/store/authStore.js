import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const clearAuthState = () => {
  delete api.defaults.headers.common['Authorization'];
  try {
    localStorage.removeItem('intervuex-auth');
  } catch (_) {}
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        if (import.meta.env.VITE_UI_DEMO_MODE === 'true') {
          try {
            const { demoLoginWithCredentials } = await import('../demo/demoAuth');
            const result = demoLoginWithCredentials(email, password);
            if (result.success) {
              api.defaults.headers.common['Authorization'] = 'Bearer demo-token';
              set({
                user: result.user,
                accessToken: 'demo-token',
                refreshToken: 'demo-refresh',
                isAuthenticated: true,
                isLoading: false,
              });
              return { success: true };
            }
            set({ isLoading: false, error: result.message });
            return { success: false, message: result.message };
          } catch (err) {
            set({ isLoading: false, error: 'Demo login failed.' });
            return { success: false, message: 'Demo login failed.' };
          }
        }
        try {
          const response = await api.post('/auth/login', { email: email.trim().toLowerCase(), password });
          const { user, accessToken, refreshToken } = response.data.data;
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch (err) {
          const message = err.response?.data?.message || 'Login failed.';
          set({ isLoading: false, error: message });
          return { success: false, message };
        }
      },

      register: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/register', payload);
          const { user, accessToken, refreshToken } = data.data;
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch (err) {
          const message = err.response?.data?.message || 'Registration failed.';
          set({ isLoading: false, error: message });
          return { success: false, message };
        }
      },

      logout: async () => {
        clearAuthState();
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, error: null, isLoading: false });
        try { await api.post('/auth/logout'); } catch (_) {}
      },

      demoEnterAs: async (roleKey) => {
        set({ isLoading: true, error: null });
        try {
          const { demoLoginAsRole } = await import('../demo/demoAuth');
          const result = demoLoginAsRole(roleKey);
          if (result.success) {
            api.defaults.headers.common['Authorization'] = 'Bearer demo-token';
            set({
              user: result.user,
              accessToken: 'demo-token',
              refreshToken: 'demo-refresh',
              isAuthenticated: true,
              isLoading: false,
            });
            return { success: true };
          }
          set({ isLoading: false, error: result.message });
          return { success: false, message: result.message };
        } catch (_) {
          set({ isLoading: false, error: 'Demo login failed.' });
          return { success: false, message: 'Demo login failed.' };
        }
      },

      refreshAccessToken: async () => {
        if (import.meta.env.VITE_UI_DEMO_MODE === 'true') return true;
        const { refreshToken } = get();
        if (!refreshToken) return false;
        try {
          const { data } = await api.post('/auth/refresh-token', { refreshToken });
          const { accessToken, refreshToken: newRefresh } = data.data;
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          set({ accessToken, refreshToken: newRefresh });
          return true;
        } catch (_) {
          clearAuthState();
          set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, error: null, isLoading: false });
          return false;
        }
      },

      setSession: ({ user, accessToken, refreshToken }) => {
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false, error: null });
      },

      completeGoogleSignup: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/google/complete', payload);
          const { user, accessToken, refreshToken } = data.data;
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch (err) {
          const message = err.response?.data?.message || 'Signup failed.';
          set({ isLoading: false, error: message });
          return { success: false, message };
        }
      },

      updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),

      setToken: (accessToken) => {
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        set({ accessToken });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'intervuex-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          api.defaults.headers.common['Authorization'] = `Bearer ${state.accessToken}`;
        }
      },
    }
  )
);

export default useAuthStore;
