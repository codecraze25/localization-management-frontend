import type {
  GetTranslationKeysParams,
  CreateTranslationKeyRequest,
  UpdateTranslationRequest,
  ApiResponse,
} from './types';
import type {
  TranslationKey,
  Project,
  GetTranslationKeysResponse,
  AnalyticsResponse,
  BulkUpdateRequest,
} from '@/types';

// API base configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Custom API Error class
class ApiError extends Error {
  code: string;
  status: number;
  details?: Record<string, any>;
  constructor({
    message,
    code,
    status,
    details,
  }: {
    message: string;
    code: string;
    status: number;
    details?: Record<string, any>;
  }) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError({
          message:
            errorData.detail ||
            `HTTP ${response.status}: ${response.statusText}`,
          code: 'HTTP_ERROR',
          status: response.status,
          details: errorData,
        });
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError({
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'NETWORK_ERROR',
        status: 0,
      });
    }
  }

  // Projects API
  async getProjects(): Promise<Project[]> {
    return this.request<Project[]>('/projects');
  }

  // Translation Keys API
  async getTranslationKeys(
    params: GetTranslationKeysParams
  ): Promise<GetTranslationKeysResponse> {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.category) searchParams.append('category', params.category);
    if (params.languageCode)
      searchParams.append('language_code', params.languageCode);
    if (params.missingTranslations !== undefined) {
      searchParams.append(
        'missing_translations',
        params.missingTranslations.toString()
      );
    }

    const query = searchParams.toString();
    const endpoint = `/projects/${params.projectId}/translation-keys${
      query ? `?${query}` : ''
    }`;

    return this.request<GetTranslationKeysResponse>(endpoint);
  }

  async getTranslationKey(keyId: string): Promise<TranslationKey> {
    return this.request<TranslationKey>(`/translation-keys/${keyId}`);
  }

  async createTranslationKey(
    data: CreateTranslationKeyRequest
  ): Promise<TranslationKey> {
    return this.request<TranslationKey>('/translation-keys', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteTranslationKey(
    keyId: string
  ): Promise<{ success: boolean; message: string; key_id: string }> {
    return this.request<{ success: boolean; message: string; key_id: string }>(
      `/translation-keys/${keyId}`,
      {
        method: 'DELETE',
      }
    );
  }

  async updateTranslation(
    keyId: string,
    languageCode: string,
    data: { value: string }
  ): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(
      `/translations/${keyId}/${languageCode}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          key_id: keyId,
          language_code: languageCode,
          value: data.value,
        }),
      }
    );
  }

  async bulkUpdateTranslations(data: BulkUpdateRequest): Promise<{
    success: boolean;
    message: string;
    updated_count: number;
    total_requested: number;
  }> {
    return this.request('/translations/bulk-update', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Analytics API
  async getAnalytics(projectId: string): Promise<AnalyticsResponse> {
    return this.request<AnalyticsResponse>(`/projects/${projectId}/analytics`);
  }

  // Legacy endpoint for getting localizations
  async getLocalizations(
    projectId: string,
    locale: string
  ): Promise<{
    project_id: string;
    locale: string;
    localizations: Record<string, string>;
  }> {
    return this.request(`/localizations/${projectId}/${locale}`);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing
export { ApiClient, ApiError };
