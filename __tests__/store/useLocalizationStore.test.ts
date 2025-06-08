import { renderHook, act } from '@testing-library/react';
import { useLocalizationStore } from '@/store/useLocalizationStore';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useLocalizationStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state
    useLocalizationStore.setState({
      currentProject: null,
      currentLanguage: null,
      filters: {},
      error: null,
    });
  });

  it('has initial state', () => {
    const { result } = renderHook(() => useLocalizationStore());

    expect(result.current.currentProject).toBeNull();
    expect(result.current.currentLanguage).toBeNull();
    expect(result.current.filters).toEqual({});
    expect(result.current.error).toBeNull();
  });

  it('sets current project', () => {
    const { result } = renderHook(() => useLocalizationStore());
    const project = {
      id: 'project-1',
      name: 'Test Project',
      languages: [{ code: 'en', name: 'English', flag: '🇺🇸' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    act(() => {
      result.current.setCurrentProject(project);
    });

    expect(result.current.currentProject).toEqual(project);
  });

  it('sets current language', () => {
    const { result } = renderHook(() => useLocalizationStore());
    const language = { code: 'en', name: 'English', flag: '🇺🇸' };

    act(() => {
      result.current.setCurrentLanguage(language);
    });

    expect(result.current.currentLanguage).toEqual(language);
  });

  it('updates filters', () => {
    const { result } = renderHook(() => useLocalizationStore());

    act(() => {
      result.current.setFilters({ search: 'button' });
    });

    expect(result.current.filters).toEqual({ search: 'button' });

    // Should merge with existing filters
    act(() => {
      result.current.setFilters({ category: 'buttons' });
    });

    expect(result.current.filters).toEqual({
      search: 'button',
      category: 'buttons',
    });
  });

  it('sets error', () => {
    const { result } = renderHook(() => useLocalizationStore());

    act(() => {
      result.current.setError('Something went wrong');
    });

    expect(result.current.error).toBe('Something went wrong');
  });

  it('clears error', () => {
    const { result } = renderHook(() => useLocalizationStore());

    act(() => {
      result.current.setError('Error message');
    });

    expect(result.current.error).toBe('Error message');

    act(() => {
      result.current.setError(null);
    });

    expect(result.current.error).toBeNull();
  });

  it('provides selector hooks', () => {
    const project = {
      id: 'project-1',
      name: 'Test Project',
      languages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    useLocalizationStore.setState({ currentProject: project });

    const { result: projectResult } = renderHook(() =>
      useLocalizationStore((state) => state.currentProject)
    );

    expect(projectResult.current).toEqual(project);
  });

  it('updates multiple state properties independently', () => {
    const { result } = renderHook(() => useLocalizationStore());

    const project = {
      id: 'p1',
      name: 'Project 1',
      languages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const language = { code: 'en', name: 'English', flag: '🇺🇸' };

    act(() => {
      result.current.setCurrentProject(project);
    });

    act(() => {
      result.current.setCurrentLanguage(language);
    });

    expect(result.current.currentProject).toEqual(project);
    expect(result.current.currentLanguage).toEqual(language);
  });

  it('handles filter updates correctly', () => {
    const { result } = renderHook(() => useLocalizationStore());

    // Set initial filters
    act(() => {
      result.current.setFilters({
        search: 'button',
        category: 'ui',
      });
    });

    // Update one filter
    act(() => {
      result.current.setFilters({ search: 'modal' });
    });

    expect(result.current.filters).toEqual({
      search: 'modal',
      category: 'ui',
    });

    // Clear a filter by setting undefined
    act(() => {
      result.current.setFilters({ category: undefined });
    });

    expect(result.current.filters).toEqual({
      search: 'modal',
      category: undefined,
    });
  });
});
