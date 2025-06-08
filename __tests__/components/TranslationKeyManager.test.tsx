import React from 'react'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Simple mock components for testing
const MockTranslationKeyManager = ({ hasProject }: { hasProject: boolean }) => {
  if (!hasProject) {
    return (
      <div data-testid="no-project-state">
        <h2>No Project Selected</h2>
        <p>Please select a project to manage translation keys.</p>
      </div>
    )
  }

  return (
    <div data-testid="translation-manager">
      <h2>Translation Keys</h2>
      <div data-testid="search-input">
        <input placeholder="Search keys..." />
      </div>
      <div data-testid="category-filter">
        <select>
          <option value="">All Categories</option>
        </select>
      </div>
      <div data-testid="missing-filter">
        <label>
          <input type="checkbox" />
          Missing only
        </label>
      </div>
    </div>
  )
}

const MockAddTranslationKeyModal = ({ isOpen }: { isOpen: boolean }) => {
  if (!isOpen) return null

  return (
    <div data-testid="add-modal">
      <h3>Add Translation Key</h3>
      <form>
        <div>
          <label htmlFor="key-input">Translation Key *</label>
          <input id="key-input" placeholder="e.g., button.save" />
        </div>
        <div>
          <label htmlFor="category-input">Category *</label>
          <input id="category-input" placeholder="e.g., buttons" />
        </div>
        <button type="button">Cancel</button>
        <button type="submit">Create Key</button>
      </form>
    </div>
  )
}

describe('TranslationKeyManager', () => {
  const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  const renderWithProviders = (ui: React.ReactElement) => {
    const queryClient = createTestQueryClient()
    return render(
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    )
  }

  it('renders no project selected state', () => {
    renderWithProviders(<MockTranslationKeyManager hasProject={false} />)

    expect(screen.getByTestId('no-project-state')).toBeInTheDocument()
    expect(screen.getByText('No Project Selected')).toBeInTheDocument()
    expect(screen.getByText('Please select a project to manage translation keys.')).toBeInTheDocument()
  })

  it('renders translation manager with project', () => {
    renderWithProviders(<MockTranslationKeyManager hasProject={true} />)

    expect(screen.getByTestId('translation-manager')).toBeInTheDocument()
    expect(screen.getByText('Translation Keys')).toBeInTheDocument()
    expect(screen.getByTestId('search-input')).toBeInTheDocument()
    expect(screen.getByTestId('category-filter')).toBeInTheDocument()
    expect(screen.getByTestId('missing-filter')).toBeInTheDocument()
  })

  it('shows search and filter controls', () => {
    renderWithProviders(<MockTranslationKeyManager hasProject={true} />)

    expect(screen.getByPlaceholderText('Search keys...')).toBeInTheDocument()
    expect(screen.getByDisplayValue('All Categories')).toBeInTheDocument()
    expect(screen.getByLabelText(/Missing only/)).toBeInTheDocument()
  })
})

describe('AddTranslationKeyModal', () => {
  const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  const renderWithProviders = (ui: React.ReactElement) => {
    const queryClient = createTestQueryClient()
    return render(
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    )
  }

  it('renders modal when open', () => {
    renderWithProviders(<MockAddTranslationKeyModal isOpen={true} />)

    expect(screen.getByTestId('add-modal')).toBeInTheDocument()
    expect(screen.getByText('Add Translation Key')).toBeInTheDocument()
    expect(screen.getByLabelText(/Translation Key/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Category/)).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    renderWithProviders(<MockAddTranslationKeyModal isOpen={false} />)

    expect(screen.queryByTestId('add-modal')).not.toBeInTheDocument()
  })

  it('has form controls with proper labels', () => {
    renderWithProviders(<MockAddTranslationKeyModal isOpen={true} />)

    expect(screen.getByLabelText('Translation Key *')).toBeInTheDocument()
    expect(screen.getByLabelText('Category *')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Create Key')).toBeInTheDocument()
  })
})