import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Watchlist from '../pages/watchlist';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock API calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Watchlist Component', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
  });

  describe('Rendering', () => {
    it('should render watchlist with header and add button', () => {
      mockLocalStorage.getItem.mockReturnValue('[]');
      
      render(<Watchlist />);
      
      expect(screen.getByText('My Watchlist')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add Asset' })).toBeInTheDocument();
    });

    it('should display empty state when no assets in watchlist', () => {
      mockLocalStorage.getItem.mockReturnValue('[]');
      
      render(<Watchlist />);
      
      expect(screen.getByText('Your watchlist is empty')).toBeInTheDocument();
      expect(screen.getByText('Add assets to track their sentiment and performance')).toBeInTheDocument();
    });

    it('should display assets from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify([
        { symbol: 'AAPL', name: 'Apple Inc.', sentiment: 0.6, price: 150.25 },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', sentiment: -0.2, price: 2500.00 }
      ]));
      
      render(<Watchlist />);
      
      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
      expect(screen.getByText('GOOGL')).toBeInTheDocument();
      expect(screen.getByText('Alphabet Inc.')).toBeInTheDocument();
    });
  });

  describe('Add Asset Functionality', () => {
    it('should open add asset dialog when add button is clicked', async () => {
      const user = userEvent.setup();
      mockLocalStorage.getItem.mockReturnValue('[]');
      
      render(<Watchlist />);
      
      const addButton = screen.getByRole('button', { name: 'Add Asset' });
      await user.click(addButton);
      
      expect(screen.getByText('Add Asset to Watchlist')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter asset symbol (e.g., AAPL)')).toBeInTheDocument();
    });

    it('should add new asset to watchlist', async () => {
      const user = userEvent.setup();
      mockLocalStorage.getItem.mockReturnValue('[]');
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          symbol: 'TSLA',
          name: 'Tesla Inc.',
          sentiment: 0.8,
          price: 800.50
        })
      });
      
      render(<Watchlist />);
      
      const addButton = screen.getByRole('button', { name: 'Add Asset' });
      await user.click(addButton);
      
      const symbolInput = screen.getByPlaceholderText('Enter asset symbol (e.g., AAPL)');
      await user.type(symbolInput, 'TSLA');
      
      const confirmButton = screen.getByRole('button', { name: 'Add to Watchlist' });
      await user.click(confirmButton);
      
      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'watchlist',
          JSON.stringify([{
            symbol: 'TSLA',
            name: 'Tesla Inc.',
            sentiment: 0.8,
            price: 800.50
          }])
        );
      });
    });

    it('should handle invalid asset symbol', async () => {
      const user = userEvent.setup();
      mockLocalStorage.getItem.mockReturnValue('[]');
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });
      
      render(<Watchlist />);
      
      const addButton = screen.getByRole('button', { name: 'Add Asset' });
      await user.click(addButton);
      
      const symbolInput = screen.getByPlaceholderText('Enter asset symbol (e.g., AAPL)');
      await user.type(symbolInput, 'INVALID');
      
      const confirmButton = screen.getByRole('button', { name: 'Add to Watchlist' });
      await user.click(confirmButton);
      
      await waitFor(() => {
        expect(screen.getByText('Asset not found. Please check the symbol and try again.')).toBeInTheDocument();
      });
    });

    it('should prevent adding duplicate assets', async () => {
      const user = userEvent.setup();
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify([
        { symbol: 'AAPL', name: 'Apple Inc.', sentiment: 0.6, price: 150.25 }
      ]));
      
      render(<Watchlist />);
      
      const addButton = screen.getByRole('button', { name: 'Add Asset' });
      await user.click(addButton);
      
      const symbolInput = screen.getByPlaceholderText('Enter asset symbol (e.g., AAPL)');
      await user.type(symbolInput, 'AAPL');
      
      const confirmButton = screen.getByRole('button', { name: 'Add to Watchlist' });
      await user.click(confirmButton);
      
      await waitFor(() => {
        expect(screen.getByText('Asset is already in your watchlist')).toBeInTheDocument();
      });
    });
  });

  describe('Remove Asset Functionality', () => {
    it('should remove asset from watchlist', async () => {
      const user = userEvent.setup();
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify([
        { symbol: 'AAPL', name: 'Apple Inc.', sentiment: 0.6, price: 150.25 },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', sentiment: -0.2, price: 2500.00 }
      ]));
      
      render(<Watchlist />);
      
      const removeButtons = screen.getAllByRole('button', { name: /Remove/ });
      await user.click(removeButtons[0]);
      
      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'watchlist',
          JSON.stringify([
            { symbol: 'GOOGL', name: 'Alphabet Inc.', sentiment: -0.2, price: 2500.00 }
          ])
        );
      });
    });

    it('should show confirmation dialog before removing asset', async () => {
      const user = userEvent.setup();
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify([
        { symbol: 'AAPL', name: 'Apple Inc.', sentiment: 0.6, price: 150.25 }
      ]));
      
      render(<Watchlist />);
      
      const removeButton = screen.getByRole('button', { name: /Remove/ });
      await user.click(removeButton);
      
      expect(screen.getByText('Remove Asset from Watchlist')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to remove AAPL from your watchlist?')).toBeInTheDocument();
    });
  });

  describe('Real-time Updates', () => {
    it('should update asset data when WebSocket message is received', async () => {
      const mockWebSocket = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        close: jest.fn()
      };
      
      global.WebSocket = jest.fn(() => mockWebSocket) as any;
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify([
        { symbol: 'AAPL', name: 'Apple Inc.', sentiment: 0.6, price: 150.25 }
      ]));
      
      render(<Watchlist />);
      
      expect(screen.getByText('$150.25')).toBeInTheDocument();
      
      // Simulate WebSocket message
      const wsMessageHandler = mockWebSocket.addEventListener.mock.calls
        .find(call => call[0] === 'message')?.[1];
      
      if (wsMessageHandler) {
        wsMessageHandler({
          data: JSON.stringify({
            type: 'price_update',
            data: { symbol: 'AAPL', price: 155.75, sentiment: 0.8 }
          })
        });

        await waitFor(() => {
          expect(screen.getByText('$155.75')).toBeInTheDocument();
        });
      }
    });

    it('should display connection status', () => {
      mockLocalStorage.getItem.mockReturnValue('[]');
      
      render(<Watchlist />);
      
      expect(screen.getByTestId('connection-status')).toBeInTheDocument();
    });
  });

  describe('Sorting and Filtering', () => {
    it('should sort assets by sentiment when column header is clicked', async () => {
      const user = userEvent.setup();
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify([
        { symbol: 'AAPL', name: 'Apple Inc.', sentiment: 0.6, price: 150.25 },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', sentiment: -0.2, price: 2500.00 },
        { symbol: 'TSLA', name: 'Tesla Inc.', sentiment: 0.9, price: 800.50 }
      ]));
      
      render(<Watchlist />);
      
      const sentimentHeader = screen.getByText('Sentiment');
      await user.click(sentimentHeader);
      
      const rows = screen.getAllByTestId(/watchlist-row/);
      expect(rows[0]).toHaveTextContent('TSLA'); // Highest sentiment first
      expect(rows[1]).toHaveTextContent('AAPL');
      expect(rows[2]).toHaveTextContent('GOOGL'); // Lowest sentiment last
    });

    it('should filter assets by search term', async () => {
      const user = userEvent.setup();
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify([
        { symbol: 'AAPL', name: 'Apple Inc.', sentiment: 0.6, price: 150.25 },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', sentiment: -0.2, price: 2500.00 }
      ]));
      
      render(<Watchlist />);
      
      const searchInput = screen.getByPlaceholderText('Search assets...');
      await user.type(searchInput, 'Apple');
      
      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.queryByText('GOOGL')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      render(<Watchlist />);
      
      expect(screen.getByText('Error loading watchlist')).toBeInTheDocument();
    });

    it('should handle malformed localStorage data', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');
      
      render(<Watchlist />);
      
      expect(screen.getByText('Your watchlist is empty')).toBeInTheDocument();
    });

    it('should handle API errors when adding assets', async () => {
      const user = userEvent.setup();
      mockLocalStorage.getItem.mockReturnValue('[]');
      
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      render(<Watchlist />);
      
      const addButton = screen.getByRole('button', { name: 'Add Asset' });
      await user.click(addButton);
      
      const symbolInput = screen.getByPlaceholderText('Enter asset symbol (e.g., AAPL)');
      await user.type(symbolInput, 'AAPL');
      
      const confirmButton = screen.getByRole('button', { name: 'Add to Watchlist' });
      await user.click(confirmButton);
      
      await waitFor(() => {
        expect(screen.getByText('Error adding asset to watchlist')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify([
        { symbol: 'AAPL', name: 'Apple Inc.', sentiment: 0.6, price: 150.25 }
      ]));
      
      render(<Watchlist />);
      
      expect(screen.getByRole('table')).toHaveAttribute('aria-label', 'Watchlist');
      expect(screen.getByRole('columnheader', { name: 'Asset' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Sentiment' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Price' })).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify([
        { symbol: 'AAPL', name: 'Apple Inc.', sentiment: 0.6, price: 150.25 }
      ]));
      
      render(<Watchlist />);
      
      // Tab through interactive elements
      await user.tab(); // Add Asset button
      expect(document.activeElement).toHaveAttribute('type', 'button');
      
      await user.tab(); // First remove button
      expect(document.activeElement).toHaveAttribute('aria-label', 'Remove AAPL from watchlist');
    });
  });
}); 