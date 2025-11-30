import { create } from 'zustand';
import api from '../lib/api';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  register: async (name, email, password, role = 'buyer', extraData = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/register', { name, email, password, role, ...extraData });
      const { user, token } = response.data;

      // Store token in localStorage
      localStorage.setItem('auth_token', token);

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Registration failed. Please try again.';
      set({
        isLoading: false,
        error: errorMessage,
        isAuthenticated: false,
      });
      return { success: false, error: errorMessage };
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/login', { email, password });
      const { user, token } = response.data;

      // Store token in localStorage
      localStorage.setItem('auth_token', token);

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      // Fetch fresh user data to ensure all permissions/roles are loaded
      setTimeout(async () => {
        try {
          const meResponse = await api.get('/me');
          set({ user: meResponse.data });
        } catch (err) {
          console.error('Error refreshing user data:', err);
        }
      }, 100);

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      set({
        isLoading: false,
        error: errorMessage,
        isAuthenticated: false,
      });
      return { success: false, error: errorMessage };
    }
  },

  logout: async () => {
    try {
      await api.post('/logout');
    } catch (e) {
      // Error is expected in some cases
      void e;
    } finally {
      localStorage.removeItem('auth_token');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
      });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }

      const response = await api.get('/me');
      set({
        user: response.data,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (e) {
      // Error during auth check
      void e;
      localStorage.removeItem('auth_token');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),

  setUser: (user) => set({ user }),
}));

export default useAuthStore;
