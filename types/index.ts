// Core data interfaces for the localization management system

export interface Translation {
  value: string;
  updatedAt: string;
  updatedBy: string;
}

export interface TranslationKey {
  id: string;
  key: string; // e.g., "button.save"
  category: string; // e.g., "buttons"
  description?: string;
  translations: {
    [languageCode: string]: Translation;
  };
}

export interface Language {
  code: string; // e.g., "en", "es", "fr"
  name: string; // e.g., "English", "Spanish", "French"
  flag?: string; // Optional flag emoji or icon
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  languages: Language[];
  createdAt: string;
  updatedAt: string;
}

// API response types
export interface GetTranslationKeysResponse {
  keys: TranslationKey[];
  total: number;
  page: number;
  limit: number;
}

export interface BulkUpdateRequest {
  updates: {
    keyId: string;
    languageCode: string;
    value: string;
  }[];
}

export interface ValidationError {
  keyId: string;
  languageCode: string;
  error: string;
  suggestion?: string;
}

export interface ValidationResponse {
  isValid: boolean;
  errors: ValidationError[];
}

export interface AnalyticsResponse {
  projectId: string;
  totalKeys: number;
  completionByLanguage: {
    [languageCode: string]: {
      completed: number;
      total: number;
      percentage: number;
    };
  };
  lastUpdated: string;
}

// UI State types
export interface TranslationKeyFilters {
  search?: string;
  category?: string;
  languageCode?: string;
  missingTranslations?: boolean;
}

export interface SortConfig {
  field: 'key' | 'category' | 'updatedAt';
  direction: 'asc' | 'desc';
}

// Zustand store types
export interface LocalizationStore {
  // Current state
  currentProject: Project | null;
  currentLanguage: Language | null;
  translationKeys: TranslationKey[];
  filters: TranslationKeyFilters;
  sortConfig: SortConfig;
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentProject: (project: Project | null) => void;
  setCurrentLanguage: (language: Language | null) => void;
  setTranslationKeys: (keys: TranslationKey[]) => void;
  setFilters: (filters: TranslationKeyFilters) => void;
  setSortConfig: (config: SortConfig) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateTranslation: (
    keyId: string,
    languageCode: string,
    value: string
  ) => void;
  addTranslationKey: (key: TranslationKey) => void;
  removeTranslationKey: (keyId: string) => void;
}

// Component prop types
export interface TranslationKeyManagerProps {
  projectId?: string;
  className?: string;
}

export interface TranslationEditorProps {
  translationKey: TranslationKey;
  languageCode: string;
  onSave: (keyId: string, languageCode: string, value: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface SearchFilterProps {
  filters: TranslationKeyFilters;
  onFiltersChange: (filters: TranslationKeyFilters) => void;
  languages: Language[];
  categories: string[];
}
