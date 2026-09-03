import { create } from 'zustand';

function getStoredToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('ayur_token') || null;
}

function getStoredUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('ayur_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export const useAuthStore = create((set) => ({
  token: getStoredToken(),
  user: getStoredUser(),
  isAuthenticated: !!getStoredToken(),

  login: (token, user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ayur_token', token);
      localStorage.setItem('ayur_user', JSON.stringify(user));
    }
    set({
      token,
      user,
      isAuthenticated: true,
    });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ayur_token');
      localStorage.removeItem('ayur_user');
      localStorage.removeItem('ayur_session_id');
    }
    set({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  },

  updateUser: (updates) => {
    set((state) => {
      const updatedUser = { ...state.user, ...updates };
      if (typeof window !== 'undefined') {
        localStorage.setItem('ayur_user', JSON.stringify(updatedUser));
      }
      return { user: updatedUser };
    });
  },
}));
