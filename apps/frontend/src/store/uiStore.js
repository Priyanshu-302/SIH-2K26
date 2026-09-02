import { create } from 'zustand';

const isDesktop = typeof window !== 'undefined' ? window.innerWidth >= 768 : true;

export const useUIStore = create((set) => ({
  isCitationPanelOpen: false,
  isSidebarOpen: isDesktop,
  toasts: [],

  toggleCitationPanel: () => set((state) => ({ isCitationPanelOpen: !state.isCitationPanelOpen })),
  openCitationPanel: () => set({ isCitationPanelOpen: true }),
  closeCitationPanel: () => set({ isCitationPanelOpen: false }),

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),

  addToast: ({ type = 'info', message }) => {
    const id = Date.now();
    set((state) => ({
      toasts: [...state.toasts, { id, type, message }],
    }));

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
