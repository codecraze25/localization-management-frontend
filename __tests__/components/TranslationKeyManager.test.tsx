import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TranslationKeyManager from '@/components/TranslationKeyManager';

// Simple mock for the store
jest.mock('@/store/useLocalizationStore', () => ({
  useCurrentProject: () => null,
  useCurrentLanguage: () => null,
  useFilters: () => ({}),
  useLocalizationActions: () => ({
    setFilters: jest.fn(),
    setCurrentProject: jest.fn(),
    setCurrentLanguage: jest.fn()
  })
}));

// Simple mock for API hooks
jest.mock('@/hooks/useApi', () => ({
  useTranslationKeys: () => ({
    data: undefined,
    isLoading: false,
    error: null,
  }),
  useUpdateTranslation: () => ({
    mutateAsync: jest.fn(),
    isPending: false,
  })
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe('TranslationKeyManager', () => {
  test('renders no project selected message when no project', () => {
    renderWithProviders(<TranslationKeyManager />);

    expect(screen.getByText('No Project Selected')).toBeInTheDocument();
    expect(screen.getByText('Please select a project to manage translation keys.')).toBeInTheDocument();
  });

  test('renders component without crashing', () => {
    renderWithProviders(<TranslationKeyManager />);

    // Component should render without throwing
    expect(screen.getByText('No Project Selected')).toBeInTheDocument();
  });
});