import { create } from 'zustand';

export const useDocumentStore = create((set, get) => ({
  documents: [],
  isLoadingDocuments: false,
  activeJobs: {}, // documentId -> { status, progress, error, filename }
  selectedCategory: 'all',
  isUploadModalOpen: false,

  setDocuments: (documents) => set({ documents }),
  setIsLoadingDocuments: (isLoadingDocuments) => set({ isLoadingDocuments }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setIsUploadModalOpen: (isOpen) => set({ isUploadModalOpen: isOpen }),

  updateJobProgress: (documentId, jobData) => {
    set((state) => ({
      activeJobs: {
        ...state.activeJobs,
        [documentId]: {
          ...(state.activeJobs[documentId] || {}),
          ...jobData,
        },
      },
    }));
  },

  removeJob: (documentId) => {
    set((state) => {
      const activeJobs = { ...state.activeJobs };
      delete activeJobs[documentId];
      return { activeJobs };
    });
  },
}));
