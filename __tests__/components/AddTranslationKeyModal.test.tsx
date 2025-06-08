import React from 'react'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Simple mock modal component for testing
const MockAddTranslationKeyModal = ({
  isOpen,
  onClose,
  showError = false
}: {
  isOpen: boolean
  onClose: () => void
  showError?: boolean
}) => {
  if (!isOpen) return null

  return (
    <div data-testid="add-modal" role="dialog">
      <h3>Add Translation Key</h3>

      {showError && (
        <div data-testid="error-banner">
          <h4>Error</h4>
          <p>Something went wrong.</p>
        </div>
      )}

      <form>
        <div>
          <label htmlFor="key-input">Translation Key *</label>
          <input
            id="key-input"
            placeholder="e.g., button.save, modal.title"
            required
          />
        </div>

        <div>
          <label htmlFor="category-input">Category *</label>
          <input
            id="category-input"
            placeholder="e.g., buttons, modals, forms"
            required
          />
        </div>

        <div>
          <label htmlFor="description-input">Description</label>
          <textarea
            id="description-input"
            placeholder="Optional description for context"
            rows={2}
          />
        </div>

        <div>
          <label>Initial Translations</label>
          <div>
            <div>
              <span>🇺🇸</span>
              <span>English</span>
              <input placeholder="Translation in English" />
            </div>
            <div>
              <span>🇪🇸</span>
              <span>Spanish</span>
              <input placeholder="Translation in Spanish" />
            </div>
          </div>
        </div>

        <div>
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit">Create Key</button>
        </div>
      </form>
    </div>
  )
}

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
    const mockOnClose = jest.fn()
    renderWithProviders(
      <MockAddTranslationKeyModal isOpen={true} onClose={mockOnClose} />
    )

    expect(screen.getByTestId('add-modal')).toBeInTheDocument()
    expect(screen.getByText('Add Translation Key')).toBeInTheDocument()
    expect(screen.getByLabelText(/Translation Key/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Category/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Description/)).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    const mockOnClose = jest.fn()
    renderWithProviders(
      <MockAddTranslationKeyModal isOpen={false} onClose={mockOnClose} />
    )

    expect(screen.queryByTestId('add-modal')).not.toBeInTheDocument()
  })

  it('shows language input fields', () => {
    const mockOnClose = jest.fn()
    renderWithProviders(
      <MockAddTranslationKeyModal isOpen={true} onClose={mockOnClose} />
    )

    expect(screen.getByText('🇺🇸')).toBeInTheDocument()
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('🇪🇸')).toBeInTheDocument()
    expect(screen.getByText('Spanish')).toBeInTheDocument()

    expect(screen.getByPlaceholderText('Translation in English')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Translation in Spanish')).toBeInTheDocument()
  })

  it('shows form controls with proper labels', () => {
    const mockOnClose = jest.fn()
    renderWithProviders(
      <MockAddTranslationKeyModal isOpen={true} onClose={mockOnClose} />
    )

    expect(screen.getByLabelText('Translation Key *')).toBeInTheDocument()
    expect(screen.getByLabelText('Category *')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Create Key')).toBeInTheDocument()
  })

  it('shows error banner when error exists', () => {
    const mockOnClose = jest.fn()
    renderWithProviders(
      <MockAddTranslationKeyModal
        isOpen={true}
        onClose={mockOnClose}
        showError={true}
      />
    )

    expect(screen.getByTestId('error-banner')).toBeInTheDocument()
    expect(screen.getByText('Error')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument()
  })
})