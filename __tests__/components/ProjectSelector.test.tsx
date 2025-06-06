import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProjectSelector from '@/components/ProjectSelector';

// Simple mock for API hooks
jest.mock('@/hooks/useApi', () => ({
  useProjects: () => ({
    data: [],
    isLoading: false,
    error: null,
  })
}));

// Simple mock for the store
jest.mock('@/store/useLocalizationStore', () => ({
  useCurrentProject: () => null,
  useLocalizationActions: () => ({
    setCurrentProject: jest.fn(),
    setCurrentLanguage: jest.fn()
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

describe('ProjectSelector', () => {
  test('renders select project button', () => {
    renderWithProviders(<ProjectSelector />);

    expect(screen.getByText('Select a project')).toBeInTheDocument();
  });

  test('renders component without crashing', () => {
    renderWithProviders(<ProjectSelector />);

    // Component should render without throwing
    expect(screen.getByText('Select a project')).toBeInTheDocument();
  });
});
