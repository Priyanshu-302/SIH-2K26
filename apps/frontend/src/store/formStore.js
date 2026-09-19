import { create } from 'zustand';
import { generateStatutoryFormsAPI } from '../services/apiService';

export const useFormStore = create((set, get) => ({
  isModalOpen: false,
  activeTab: 'IPO_FORM_25', // 'IPO_FORM_25' | 'NBA_FORM_1' | 'NBA_FORM_3' | 'WIPO_GRATK_SDS'
  isLoading: false,
  error: null,
  formsData: null,
  currentSessionId: null,

  openFormModal: async ({ sessionId, conversationText, initialTab = 'IPO_FORM_25', customInputs = {} } = {}) => {
    set({
      isModalOpen: true,
      activeTab: initialTab,
      isLoading: true,
      error: null,
      currentSessionId: sessionId || null,
    });

    try {
      const inputs = { ...customInputs };
      if (!inputs.signatory) {
        inputs.signatory = 'Authorized Signatory (Director of R&D / Applicant)';
      }
      if (!inputs.applicantName) {
        inputs.applicantName = 'AyurVeda BioPharma Innovations Pvt. Ltd.';
      }
      const data = await generateStatutoryFormsAPI({ sessionId, conversationText, customInputs: inputs });
      set({
        formsData: data,
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err.message || 'Failed to generate statutory forms',
        isLoading: false,
      });
    }
  },

  closeFormModal: () => {
    set({ isModalOpen: false });
  },

  setActiveTab: (tab) => {
    set({ activeTab: tab });
  },

  updateFormField: (formKey, fieldKey, value) => {
    set((state) => {
      if (!state.formsData?.forms?.[formKey]) return state;

      // If updating top-level property like standardizedText
      if (fieldKey === 'standardizedText' || fieldKey === 'addressedTo' || fieldKey === 'title') {
        return {
          formsData: {
            ...state.formsData,
            forms: {
              ...state.formsData.forms,
              [formKey]: {
                ...state.formsData.forms[formKey],
                [fieldKey]: value,
              },
            },
          },
        };
      }

      const updatedForm = {
        ...state.formsData.forms[formKey],
        fields: {
          ...state.formsData.forms[formKey].fields,
          [fieldKey]: value,
        },
      };

      return {
        formsData: {
          ...state.formsData,
          forms: {
            ...state.formsData.forms,
            [formKey]: updatedForm,
          },
        },
      };
    });
  },

  updateNestedFormField: (formKey, parentKey, childKey, value) => {
    set((state) => {
      const form = state.formsData?.forms?.[formKey];
      if (!form) return state;

      const parentVal = form.fields?.[parentKey] || {};
      const updatedParent = {
        ...parentVal,
        [childKey]: value,
      };

      return {
        formsData: {
          ...state.formsData,
          forms: {
            ...state.formsData.forms,
            [formKey]: {
              ...form,
              fields: {
                ...form.fields,
                [parentKey]: updatedParent,
              },
            },
          },
        },
      };
    });
  },

  updateArrayItem: (formKey, arrayKey, index, updatedItem) => {
    set((state) => {
      const form = state.formsData?.forms?.[formKey];
      if (!form) return state;

      const arr = Array.isArray(form.fields?.[arrayKey]) ? [...form.fields[arrayKey]] : [];
      arr[index] = { ...arr[index], ...updatedItem };

      return {
        formsData: {
          ...state.formsData,
          forms: {
            ...state.formsData.forms,
            [formKey]: {
              ...form,
              fields: {
                ...form.fields,
                [arrayKey]: arr,
              },
            },
          },
        },
      };
    });
  },

  addArrayItem: (formKey, arrayKey, newItem) => {
    set((state) => {
      const form = state.formsData?.forms?.[formKey];
      if (!form) return state;

      const arr = Array.isArray(form.fields?.[arrayKey]) ? [...form.fields[arrayKey]] : [];
      arr.push(newItem);

      return {
        formsData: {
          ...state.formsData,
          forms: {
            ...state.formsData.forms,
            [formKey]: {
              ...form,
              fields: {
                ...form.fields,
                [arrayKey]: arr,
              },
            },
          },
        },
      };
    });
  },

  removeArrayItem: (formKey, arrayKey, index) => {
    set((state) => {
      const form = state.formsData?.forms?.[formKey];
      if (!form) return state;

      const arr = Array.isArray(form.fields?.[arrayKey]) ? [...form.fields[arrayKey]] : [];
      arr.splice(index, 1);

      return {
        formsData: {
          ...state.formsData,
          forms: {
            ...state.formsData.forms,
            [formKey]: {
              ...form,
              fields: {
                ...form.fields,
                [arrayKey]: arr,
              },
            },
          },
        },
      };
    });
  },
}));
