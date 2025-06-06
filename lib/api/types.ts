// API client types and utilities

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: Record<string, any>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface GetTranslationKeysParams extends PaginationParams {
  projectId: string;
  search?: string;
  category?: string;
  languageCode?: string;
  missingTranslations?: boolean;
}

export interface CreateTranslationKeyRequest {
  key: string;
  category: string;
  description?: string;
  projectId: string;
  initialTranslations?: {
    [languageCode: string]: string;
  };
}

export interface UpdateTranslationRequest {
  keyId: string;
  languageCode: string;
  value: string;
}

// Supabase table interfaces (matching database schema)
export interface TranslationKeyRow {
  id: string;
  key: string;
  category: string;
  description?: string;
  project_id: string;
  created_at: string;
  updated_at: string;
}

export interface TranslationRow {
  id: string;
  translation_key_id: string;
  language_code: string;
  value: string;
  updated_at: string;
  updated_by: string;
}

export interface ProjectRow {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface LanguageRow {
  code: string;
  name: string;
  flag?: string;
}
