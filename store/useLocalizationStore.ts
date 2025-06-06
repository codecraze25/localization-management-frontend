import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  LocalizationStore,
  Project,
  Language,
  TranslationKey,
  TranslationKeyFilters,
  SortConfig,
} from '@/types';

const initialFilters: TranslationKeyFilters = {
  search: '',
  category: '',
  languageCode: '',
  missingTranslations: false,
};

const initialSortConfig: SortConfig = {
  field: 'key',
  direction: 'asc',
};

export const useLocalizationStore = create<LocalizationStore>()(
  devtools(
    (set, get) => ({
      // Current state
      currentProject: null,
      currentLanguage: null,
      translationKeys: [],
      filters: initialFilters,
      sortConfig: initialSortConfig,
      isLoading: false,
      error: null,

      // Actions
      setCurrentProject: (project: Project | null) => {
        set(
          (state) => ({
            ...state,
            currentProject: project,
            // Reset translation keys when project changes
            translationKeys: [],
            // Reset filters
            filters: initialFilters,
            error: null,
          }),
          false,
          'setCurrentProject'
        );
      },

      setCurrentLanguage: (language: Language | null) => {
        set(
          (state) => ({
            ...state,
            currentLanguage: language,
            error: null,
          }),
          false,
          'setCurrentLanguage'
        );
      },

      setTranslationKeys: (keys: TranslationKey[]) => {
        set(
          (state) => ({
            ...state,
            translationKeys: keys,
            isLoading: false,
            error: null,
          }),
          false,
          'setTranslationKeys'
        );
      },

      setFilters: (filters: TranslationKeyFilters) => {
        set(
          (state) => ({
            ...state,
            filters: { ...state.filters, ...filters },
          }),
          false,
          'setFilters'
        );
      },

      setSortConfig: (config: SortConfig) => {
        set(
          (state) => ({
            ...state,
            sortConfig: config,
          }),
          false,
          'setSortConfig'
        );
      },

      setLoading: (loading: boolean) => {
        set(
          (state) => ({
            ...state,
            isLoading: loading,
          }),
          false,
          'setLoading'
        );
      },

      setError: (error: string | null) => {
        set(
          (state) => ({
            ...state,
            error,
            isLoading: false,
          }),
          false,
          'setError'
        );
      },

      updateTranslation: (
        keyId: string,
        languageCode: string,
        value: string
      ) => {
        set(
          (state) => ({
            ...state,
            translationKeys: state.translationKeys.map((key) => {
              if (key.id === keyId) {
                return {
                  ...key,
                  translations: {
                    ...key.translations,
                    [languageCode]: {
                      value,
                      updatedAt: new Date().toISOString(),
                      updatedBy: 'user', // This should come from auth context
                    },
                  },
                };
              }
              return key;
            }),
          }),
          false,
          'updateTranslation'
        );
      },

      addTranslationKey: (key: TranslationKey) => {
        set(
          (state) => ({
            ...state,
            translationKeys: [...state.translationKeys, key],
          }),
          false,
          'addTranslationKey'
        );
      },

      removeTranslationKey: (keyId: string) => {
        set(
          (state) => ({
            ...state,
            translationKeys: state.translationKeys.filter(
              (key) => key.id !== keyId
            ),
          }),
          false,
          'removeTranslationKey'
        );
      },
    }),
    {
      name: 'localization-store',
    }
  )
);

// Selector hooks for performance optimization
export const useCurrentProject = () =>
  useLocalizationStore((state) => state.currentProject);
export const useCurrentLanguage = () =>
  useLocalizationStore((state) => state.currentLanguage);
export const useTranslationKeys = () =>
  useLocalizationStore((state) => state.translationKeys);
export const useFilters = () => useLocalizationStore((state) => state.filters);
export const useSortConfig = () =>
  useLocalizationStore((state) => state.sortConfig);
export const useIsLoading = () =>
  useLocalizationStore((state) => state.isLoading);
export const useError = () => useLocalizationStore((state) => state.error);

// Action hooks
export const useLocalizationActions = () => {
  const store = useLocalizationStore();
  return {
    setCurrentProject: store.setCurrentProject,
    setCurrentLanguage: store.setCurrentLanguage,
    setTranslationKeys: store.setTranslationKeys,
    setFilters: store.setFilters,
    setSortConfig: store.setSortConfig,
    setLoading: store.setLoading,
    setError: store.setError,
    updateTranslation: store.updateTranslation,
    addTranslationKey: store.addTranslationKey,
    removeTranslationKey: store.removeTranslationKey,
  };
};
