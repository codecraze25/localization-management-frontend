import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { BulkUpdateRequest } from '@/types';
import type {
  GetTranslationKeysParams,
  CreateTranslationKeyRequest,
} from '@/lib/api/types';
import { useLocalizationActions } from '@/store/useLocalizationStore';

// Query Keys
export const queryKeys = {
  projects: ['projects'] as const,
  translationKeys: (
    projectId: string,
    params?: Partial<GetTranslationKeysParams>
  ) => ['translation-keys', projectId, params] as const,
  translationKey: (keyId: string) => ['translation-key', keyId] as const,
  analytics: (projectId: string) => ['analytics', projectId] as const,
  localizations: (projectId: string, locale: string) =>
    ['localizations', projectId, locale] as const,
};

// Projects
export const useProjects = () => {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: () => apiClient.getProjects(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Translation Keys
export const useTranslationKeys = (
  projectId: string,
  params?: Partial<GetTranslationKeysParams>
) => {
  const { setError } = useLocalizationActions();

  return useQuery({
    queryKey: queryKeys.translationKeys(projectId, params),
    queryFn: () =>
      apiClient.getTranslationKeys({
        projectId,
        page: 1,
        limit: 50,
        ...params,
      }),
    enabled: !!projectId,
    // Use throwOnError or handle errors in component
    select: (data) => {
      // Optional: transform data here
      return data;
    },
  });
};

export const useTranslationKey = (keyId: string) => {
  return useQuery({
    queryKey: queryKeys.translationKey(keyId),
    queryFn: () => apiClient.getTranslationKey(keyId),
    enabled: !!keyId,
  });
};

// Mutations
export const useCreateTranslationKey = () => {
  const queryClient = useQueryClient();
  const { addTranslationKey, setError } = useLocalizationActions();

  return useMutation({
    mutationFn: (data: CreateTranslationKeyRequest) =>
      apiClient.createTranslationKey(data),
    onSuccess: (newKey, variables) => {
      // Invalidate all translation keys queries to ensure the new key appears
      queryClient.invalidateQueries({
        queryKey: ['translation-keys'],
      });

      // Add to local store
      addTranslationKey(newKey);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });
};

export const useUpdateTranslation = () => {
  const queryClient = useQueryClient();
  const { updateTranslation, setError } = useLocalizationActions();

  return useMutation({
    mutationFn: ({
      keyId,
      languageCode,
      value,
    }: {
      keyId: string;
      languageCode: string;
      value: string;
    }) => apiClient.updateTranslation(keyId, languageCode, { value }),
    onMutate: async (variables) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['translation-keys'] });

      // Snapshot the previous value for rollback
      const previousData = queryClient.getQueriesData({
        queryKey: ['translation-keys'],
      });

      // Optimistically update the cache
      queryClient.setQueriesData(
        { queryKey: ['translation-keys'] },
        (old: any) => {
          if (!old?.keys) return old;

          return {
            ...old,
            keys: old.keys.map((key: any) => {
              if (key.id === variables.keyId) {
                return {
                  ...key,
                  translations: {
                    ...key.translations,
                    [variables.languageCode]: {
                      value: variables.value,
                      updatedAt: new Date().toISOString(),
                      updatedBy: 'user',
                    },
                  },
                };
              }
              return key;
            }),
          };
        }
      );

      // Return context for rollback
      return { previousData };
    },
    onSuccess: (_, variables) => {
      // Update local store
      updateTranslation(
        variables.keyId,
        variables.languageCode,
        variables.value
      );

      // Invalidate all translation-related queries to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ['translation-keys'],
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.translationKey(variables.keyId),
      });
    },
    onError: (error: Error, variables, context) => {
      // Rollback optimistic updates on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      setError(error.message);
    },
  });
};

export const useBulkUpdateTranslations = () => {
  const queryClient = useQueryClient();
  const { updateTranslation, setError } = useLocalizationActions();

  return useMutation({
    mutationFn: (data: BulkUpdateRequest) =>
      apiClient.bulkUpdateTranslations(data),
    onSuccess: (result, variables) => {
      // Invalidate all translation key queries
      queryClient.invalidateQueries({
        queryKey: ['translation-keys'],
      });

      // Update local store for successful updates
      variables.updates.forEach((update) => {
        updateTranslation(update.keyId, update.languageCode, update.value);
      });
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });
};

// Analytics
export const useAnalytics = (projectId: string) => {
  return useQuery({
    queryKey: queryKeys.analytics(projectId),
    queryFn: () => apiClient.getAnalytics(projectId),
    enabled: !!projectId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Localizations (Legacy endpoint)
export const useLocalizations = (projectId: string, locale: string) => {
  return useQuery({
    queryKey: queryKeys.localizations(projectId, locale),
    queryFn: () => apiClient.getLocalizations(projectId, locale),
    enabled: !!projectId && !!locale,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Custom hook for invalidating queries
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();

  return {
    invalidateProjects: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.projects }),
    invalidateTranslationKeys: (projectId: string) =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.translationKeys(projectId),
      }),
    invalidateAnalytics: (projectId: string) =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.analytics(projectId),
      }),
    invalidateAll: () => queryClient.invalidateQueries(),
  };
};
