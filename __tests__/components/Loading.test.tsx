import { render } from '@testing-library/react';
import Loading from '@/components/Loading';

describe('Loading Component', () => {
  test('renders with default size', () => {
    render(<Loading />);

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('h-8', 'w-8');
  });

  test('renders with small size', () => {
    render(<Loading size="sm" />);

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('h-4', 'w-4');
  });

  test('renders with large size', () => {
    render(<Loading size="lg" />);

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('h-12', 'w-12');
  });

  test('applies custom className', () => {
    render(<Loading className="custom-class" />);

    const container = document.querySelector('.custom-class');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('flex', 'items-center', 'justify-center');
  });

  test('renders with blue border', () => {
    render(<Loading />);

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toHaveClass('border-blue-600');
  });
});