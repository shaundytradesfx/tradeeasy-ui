import { render, screen } from '@testing-library/react';

describe('Example test', () => {
  it('renders correctly', () => {
    render(<div data-testid="test">Test content</div>);
    expect(screen.getByTestId('test')).toBeInTheDocument();
  });
}); 