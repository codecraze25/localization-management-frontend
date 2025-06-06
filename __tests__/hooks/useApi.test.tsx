import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useProjects } from '@/hooks/useApi';

// Mock the API client
jest.mock('@/lib/api/client', () => ({
  apiClient: {
    getProjects: jest.fn(() => Promise.resolve([
      {
        id: 'project-1',
        name: 'Test Project',
        description: 'Test description',
        languages: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ])),
  }
}));

// Mock the store
jest.mock('@/store/useLocalizationStore', () => ({
  useLocalizationActions: () => ({
    setError: jest.fn(),
    updateTranslation: jest.fn(),
    addTranslationKey: jest.fn(),
  })
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useApi hooks', () => {
  describe('useProjects', () => {
    test('fetches projects successfully', async () => {
      const { result } = renderHook(() => useProjects(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(Array.isArray(result.current.data)).toBe(true);
    });
  });
});