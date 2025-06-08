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
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  Translation,
} from '@/types';

// API base configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Enhanced auth token management
class AuthTokenManager {
  private static instance: AuthTokenManager;

  static getInstance(): AuthTokenManager {
    if (!AuthTokenManager.instance) {
      AuthTokenManager.instance = new AuthTokenManager();
    }
    return AuthTokenManager.instance;
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;

    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        const token = parsed.state?.token;

        // Log token status for debugging
        if (!token) {
          console.warn('No auth token found in storage');
        }

        return token || null;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return null;
  }

  clearToken(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('auth-storage');
      } catch (error) {
        console.error('Error clearing auth token:', error);
      }
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

// Data transformation utilities
const transformTranslation = (apiTranslation: any): Translation => ({
  value: apiTranslation.value || '',
  updatedAt: apiTranslation.updated_at || new Date().toISOString(),
  updatedBy: apiTranslation.updated_by || 'unknown',
});

const transformTranslationKey = (apiKey: any): TranslationKey => {
  const translations: { [languageCode: string]: Translation } = {};

  if (apiKey.translations) {
    for (const [langCode, trans] of Object.entries(apiKey.translations)) {
      translations[langCode] = transformTranslation(trans);
    }
  }

  return {
    id: apiKey.id,
    key: apiKey.key,
    category: apiKey.category,
    description: apiKey.description,
    translations,
  };
};

const transformGetTranslationKeysResponse = (
  apiResponse: any
): GetTranslationKeysResponse => ({
  keys: apiResponse.keys.map(transformTranslationKey),
  total: apiResponse.total,
  page: apiResponse.page,
  limit: apiResponse.limit,
});

// Enhanced API Error class
class ApiError extends Error {
  code: string;
  status: number;
  details?: Record<string, any>;
  isAuthError: boolean;

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
    this.isAuthError = status === 401 || status === 403;
  }
}

class ApiClient {
  private baseURL: string;
  private authManager: AuthTokenManager;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.authManager = AuthTokenManager.getInstance();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requireAuth: boolean = false
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authentication header if token exists or is required
    const token = this.authManager.getToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    } else if (requireAuth) {
      throw new ApiError({
        message: 'Authentication token not found. Please login again.',
        code: 'NO_AUTH_TOKEN',
        status: 401,
      });
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle auth errors specifically
        if (response.status === 401) {
          this.authManager.clearToken();
          throw new ApiError({
            message: 'Authentication required. Please login again.',
            code: 'AUTH_REQUIRED',
            status: 401,
            details: errorData,
          });
        }

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

    const apiResponse = await this.request<any>(endpoint);
    return transformGetTranslationKeysResponse(apiResponse);
  }

  async getTranslationKey(keyId: string): Promise<TranslationKey> {
    const apiResponse = await this.request<any>(`/translation-keys/${keyId}`);
    return transformTranslationKey(apiResponse);
  }

  async createTranslationKey(
    data: CreateTranslationKeyRequest
  ): Promise<TranslationKey> {
    const apiResponse = await this.request<any>(
      '/translation-keys',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      true
    ); // Require auth
    return transformTranslationKey(apiResponse);
  }

  async deleteTranslationKey(
    keyId: string
  ): Promise<{ success: boolean; message: string; key_id: string }> {
    return this.request<{ success: boolean; message: string; key_id: string }>(
      `/translation-keys/${keyId}`,
      {
        method: 'DELETE',
      },
      true // Require auth
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
      },
      true // Require auth
    );
  }

  async bulkUpdateTranslations(data: BulkUpdateRequest): Promise<{
    success: boolean;
    message: string;
    updated_count: number;
    total_requested: number;
  }> {
    return this.request(
      '/translations/bulk-update',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      true
    ); // Require auth
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

  // Authentication API
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<User> {
    return this.request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    const result = await this.request<{ success: boolean; message: string }>(
      '/auth/logout',
      {
        method: 'POST',
      },
      true
    ); // Require auth

    // Clear token after successful logout
    this.authManager.clearToken();
    return result;
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me', {}, true); // Require auth
  }

  // Utility methods
  isAuthenticated(): boolean {
    return this.authManager.isAuthenticated();
  }

  clearAuthToken(): void {
    this.authManager.clearToken();
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export classes for testing
export { ApiClient, ApiError, AuthTokenManager };
