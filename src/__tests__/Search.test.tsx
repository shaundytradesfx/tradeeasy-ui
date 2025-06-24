import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Search from '../pages/search';
import { fetchSearchResults } from '../utils/api';

// Mock Next.js components
jest.mock('next/head', () => {
  return function Head({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  };
});

jest.mock('next/link', () => {
  return function Link({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

// Mock API utility
jest.mock('../utils/api', () => ({
  fetchSearchResults: jest.fn(),
}));

const mockFetchSearchResults = fetchSearchResults as jest.MockedFunction<typeof fetchSearchResults>;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock window.history
const mockPushState = jest.fn();
Object.defineProperty(window, 'history', {
  value: { pushState: mockPushState },
  writable: true,
});

// Mock window.location
delete (window as any).location;
window.location = {
  ...window.location,
  href: 'http://localhost:3000/search',
  search: '',
} as any;

// Helper function to get the submit button
const getSubmitButton = () => {
  const buttons = screen.getAllByRole('button');
  return buttons.find(button => 
    button.textContent?.includes('Search') || 
    button.textContent?.includes('Searching') ||
    button.getAttribute('type') === 'submit'
  );
};

describe('Search Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    jest.resetAllMocks();
    mockFetchSearchResults.mockResolvedValue([]);
    mockLocalStorage.getItem.mockReturnValue('[]');
    mockPushState.mockClear();
    
    // Reset window.location.search
    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        search: '',
        href: 'http://localhost:3000/search',
      },
      writable: true,
    });
  });

  afterEach(() => {
    // Clean up after each test
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('Rendering', () => {
    it('should render search page with title and description', () => {
      render(<Search />);
      
      expect(screen.getByRole('heading', { level: 1, name: /search/i })).toBeInTheDocument();
      expect(screen.getByText(/find articles, assets, and sentiment data/i)).toBeInTheDocument();
    });

    it('should render search form with input and button', () => {
      render(<Search />);
      
      expect(screen.getByRole('textbox', { name: /search query/i })).toBeInTheDocument();
      expect(getSubmitButton()).toBeInTheDocument();
      expect(screen.getByText(/enter at least 3 characters to search/i)).toBeInTheDocument();
    });

    it('should show search instructions initially', () => {
      render(<Search />);
      
      expect(screen.getByText(/enter at least 3 characters to search/i)).toBeInTheDocument();
    });

    it('should focus search input on mount', () => {
      render(<Search />);
      
      const searchInput = screen.getByRole('textbox', { name: /search query/i });
      expect(searchInput).toHaveFocus();
    });

    it('should render search button', () => {
      render(<Search />);
      
      expect(getSubmitButton()).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should perform search when form is submitted', async () => {
      const user = userEvent.setup();
      const mockResults = [
        {
          id: 1,
          title: 'Apple Stock Analysis',
          content: 'Apple stock is performing well',
          source: 'Example News',
          published_at: '2023-01-01T00:00:00Z',
          sentiment: 0.8,
          asset_mentions: ['AAPL']
        },
      ];
      
      mockFetchSearchResults.mockResolvedValue(mockResults);
      
      render(<Search />);
      
      const searchInput = screen.getByRole('textbox', { name: /search query/i });
      const searchButton = getSubmitButton();
      
      await act(async () => {
        await user.type(searchInput, 'test query');
      });
      
      await act(async () => {
        await user.click(searchButton!);
      });
      
      await waitFor(() => {
        expect(mockFetchSearchResults).toHaveBeenCalledWith('test query');
      });
    });

    it('should handle empty results', async () => {
      const user = userEvent.setup();
      mockFetchSearchResults.mockResolvedValue([]);
      
      render(<Search />);
      
      const searchInput = screen.getByRole('textbox', { name: /search query/i });
      const searchButton = getSubmitButton();
      
      await act(async () => {
        await user.type(searchInput, 'nonexistent');
      });
      
      await act(async () => {
        await user.click(searchButton!);
      });
      
      await waitFor(() => {
        // The component shows the default message when results are empty
        expect(screen.getByText(/enter a search term to find articles and sentiment data/i)).toBeInTheDocument();
      });
    });

    it('should debounce search input', async () => {
      // Completely isolated test for debounce
      jest.clearAllMocks();
      jest.resetAllMocks();
      mockFetchSearchResults.mockResolvedValue([]);
      
      render(<Search />);
      
      const searchInput = screen.getByRole('textbox', { name: /search query/i });
      
      // Simulate rapid typing - only the last value should trigger search
      await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'deb' } });
        fireEvent.change(searchInput, { target: { value: 'debo' } });
        fireEvent.change(searchInput, { target: { value: 'debou' } });
        fireEvent.change(searchInput, { target: { value: 'deboun' } });
        fireEvent.change(searchInput, { target: { value: 'debounce-test' } });
      });
      
      // Wait for debounce to settle (500ms + buffer)
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 700));
      });
      
      // Should only be called once due to debounce
      expect(mockFetchSearchResults).toHaveBeenCalledTimes(1);
      expect(mockFetchSearchResults).toHaveBeenCalledWith('debounce-test');
    });

    it('should not search with less than 3 characters', async () => {
      // Completely isolated test
      jest.clearAllMocks();
      jest.resetAllMocks();
      
      render(<Search />);
      
      const searchInput = screen.getByRole('textbox', { name: /search query/i });
      
      // Type less than 3 characters
      await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'te' } });
      });
      
      // Wait for potential debounce
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 700));
      });
      
      // API should not be called
      expect(mockFetchSearchResults).not.toHaveBeenCalled();
    });
  });

  describe('Results Display', () => {
    it('should display search results', async () => {
      const user = userEvent.setup();
      const mockResults = [
        {
          id: 1,
          title: 'Test Article 1',
          content: 'Content for test article 1',
          source: 'Test Source',
          published_at: '2023-01-01T00:00:00Z',
          sentiment: 0.8,
          asset_mentions: ['AAPL']
        },
        {
          id: 2,
          title: 'Test Article 2',
          content: 'Content for test article 2',
          source: 'Test Source',
          published_at: '2023-01-02T00:00:00Z',
          sentiment: -0.5,
          asset_mentions: ['TSLA']
        }
      ];
      
      mockFetchSearchResults.mockResolvedValue(mockResults);
      
      render(<Search />);
      
      const searchInput = screen.getByRole('textbox', { name: /search query/i });
      const searchButton = getSubmitButton();
      
      await act(async () => {
        await user.type(searchInput, 'test query');
        await user.click(searchButton!);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Test Article 1')).toBeInTheDocument();
        expect(screen.getByText('Test Article 2')).toBeInTheDocument();
      });
    });

    it('should display sentiment badges', async () => {
      const user = userEvent.setup();
      const mockResults = [
        {
          id: 1,
          title: 'Positive Article',
          content: 'Good news content',
          source: 'Test Source',
          published_at: '2023-01-01T00:00:00Z',
          sentiment: 0.8,
          asset_mentions: ['AAPL']
        },
        {
          id: 2,
          title: 'Negative Article',
          content: 'Bad news content',
          source: 'Test Source',
          published_at: '2023-01-02T00:00:00Z',
          sentiment: -0.5,
          asset_mentions: ['TSLA']
        }
      ];
      
      mockFetchSearchResults.mockResolvedValue(mockResults);
      
      render(<Search />);
      
      const searchInput = screen.getByRole('textbox', { name: /search query/i });
      const searchButton = getSubmitButton();
      
      await act(async () => {
        await user.type(searchInput, 'test query');
        await user.click(searchButton!);
      });
      
      await waitFor(() => {
        // Check for sentiment score badges (displayed as numbers)
        expect(screen.getByText('0.80')).toBeInTheDocument();
        expect(screen.getByText('-0.50')).toBeInTheDocument();
      });
    });

    it('should show message when no results found', async () => {
      const user = userEvent.setup();
      mockFetchSearchResults.mockResolvedValue([]);
      
      render(<Search />);
      
      const searchInput = screen.getByRole('textbox', { name: /search query/i });
      const searchButton = getSubmitButton();
      
      await act(async () => {
        await user.type(searchInput, 'nonexistent-query');
        await user.click(searchButton!);
      });
      
      await waitFor(() => {
        expect(mockFetchSearchResults).toHaveBeenCalledWith('nonexistent-query');
      });
      
      // The component shows the default message when no search has been performed or no results
      await waitFor(() => {
        expect(screen.getByText(/enter a search term to find articles and sentiment data/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const user = userEvent.setup();
      mockFetchSearchResults.mockRejectedValue(new Error('API Error'));
      
      render(<Search />);
      
      const searchInput = screen.getByRole('textbox', { name: /search query/i });
      await user.type(searchInput, 'test');
      
      const searchButton = getSubmitButton();
      await user.click(searchButton!);
      
      await waitFor(() => {
        expect(screen.getByText(/search failed/i)).toBeInTheDocument();
      });
    });

    it('should handle malformed API responses', async () => {
      const user = userEvent.setup();
      mockFetchSearchResults.mockRejectedValue(new Error('Malformed response'));
      
      render(<Search />);
      
      const searchInput = screen.getByRole('textbox', { name: /search query/i });
      await user.type(searchInput, 'test');
      
      const searchButton = getSubmitButton();
      await user.click(searchButton!);
      
      await waitFor(() => {
        expect(screen.getByText(/search failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {
    it('should filter results by sentiment', async () => {
      const user = userEvent.setup();
      const mockResults = [
        {
          id: 1,
          title: 'Positive Article',
          content: 'Good news',
          sentiment: 0.8,
          source: 'news.com',
          published_at: '2024-01-15T10:00:00Z',
          asset_mentions: ['AAPL']
        },
        {
          id: 2,
          title: 'Negative Article',
          content: 'Bad news',
          sentiment: -0.6,
          source: 'news.com',
          published_at: '2024-01-15T10:00:00Z',
          asset_mentions: ['AAPL']
        }
      ];
      
      mockFetchSearchResults.mockResolvedValue(mockResults);
      
      render(<Search />);
      
      const searchInput = screen.getByRole('textbox', { name: /search query/i });
      await user.type(searchInput, 'test');
      
      const searchButton = getSubmitButton();
      await user.click(searchButton!);
      
      await waitFor(() => {
        expect(screen.getByText('Positive Article')).toBeInTheDocument();
        expect(screen.getByText('Negative Article')).toBeInTheDocument();
      });
      
      // Filter by positive sentiment
      const positiveFilter = screen.getByLabelText('Filter by Positive');
      await user.click(positiveFilter);
      
      await waitFor(() => {
        expect(screen.getByText('Positive Article')).toBeInTheDocument();
        expect(screen.queryByText('Negative Article')).not.toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading indicator during search', async () => {
      const user = userEvent.setup();
      
      // Create a promise that we can control
      let resolveSearch: (value: any) => void;
      const searchPromise = new Promise<any[]>((resolve) => {
        resolveSearch = resolve;
      });
      
      mockFetchSearchResults.mockReturnValue(searchPromise);
      
      render(<Search />);
      
      const searchInput = screen.getByRole('textbox', { name: /search query/i });
      
      await act(async () => {
        await user.type(searchInput, 'test');
      });
      
      const searchButton = getSubmitButton();
      
      await act(async () => {
        await user.click(searchButton!);
      });
      
      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText(/searching articles and analyzing sentiment/i)).toBeInTheDocument();
      });
      
      // Resolve the search
      await act(async () => {
        resolveSearch!([]);
      });
    });

    it('should disable search button during loading', async () => {
      const user = userEvent.setup();
      
      // Create a promise that we can control
      let resolveSearch: (value: any) => void;
      const searchPromise = new Promise<any[]>((resolve) => {
        resolveSearch = resolve;
      });
      
      mockFetchSearchResults.mockReturnValue(searchPromise);
      
      render(<Search />);
      
      const searchInput = screen.getByRole('textbox', { name: /search query/i });
      
      await act(async () => {
        await user.type(searchInput, 'test');
      });
      
      const searchButton = getSubmitButton();
      
      await act(async () => {
        await user.click(searchButton!);
      });
      
      // Button should be disabled during loading
      await waitFor(() => {
        const loadingButton = screen.getByRole('button', { name: /searching/i });
        expect(loadingButton).toBeDisabled();
      });
      
      // Resolve the search
      await act(async () => {
        resolveSearch!([]);
      });
    });
  });

  describe('Search History', () => {
    it('should display recent searches when no search is active', () => {
      // Set up localStorage to return recent searches
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(['apple', 'bitcoin', 'tesla']));
      
      render(<Search />);
      
      expect(screen.getByText('Recent Searches')).toBeInTheDocument();
      expect(screen.getByText('apple')).toBeInTheDocument();
      expect(screen.getByText('bitcoin')).toBeInTheDocument();
      expect(screen.getByText('tesla')).toBeInTheDocument();
    });

    it('should perform search when clicking history item', async () => {
      const user = userEvent.setup();
      // Set up localStorage to return recent searches
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(['apple', 'bitcoin', 'tesla']));
      
      const mockResults = [
        {
          id: 1,
          title: 'Apple News',
          content: 'Apple content',
          source: 'Example News',
          published_at: '2023-01-01T00:00:00Z',
          sentiment: 0.8,
          asset_mentions: ['AAPL']
        },
      ];
      
      mockFetchSearchResults.mockResolvedValue(mockResults);
      
      render(<Search />);
      
      const appleButton = screen.getByRole('button', { name: /search for apple/i });
      
      await act(async () => {
        await user.click(appleButton);
      });
      
      await waitFor(() => {
        expect(mockFetchSearchResults).toHaveBeenCalledWith('apple');
      });
    });

    it('should have clear search history button', async () => {
      const user = userEvent.setup();
      // Set up localStorage to return recent searches
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(['apple', 'bitcoin', 'tesla']));
      
      render(<Search />);
      
      // Wait for component to load and show search history
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /clear search history/i })).toBeInTheDocument();
      });
      
      const clearButton = screen.getByRole('button', { name: /clear search history/i });
      await user.click(clearButton);
      
      // Verify the localStorage was called to clear the history with correct key
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('searchHistory', '[]');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<Search />);
      
      expect(screen.getByRole('textbox', { name: /search query/i })).toBeInTheDocument();
      // The button label changes to "Searching" when in loading state, so we check for that
      expect(getSubmitButton()).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<Search />);
      
      const searchInput = screen.getByRole('textbox', { name: /search query/i });
      
      // Focus should start on search input
      expect(searchInput).toHaveFocus();
      
      // Tab should move to search button
      await user.tab();
      const searchButton = getSubmitButton();
      expect(searchButton).toHaveFocus();
    });

    it('should announce search results to screen readers', async () => {
      const user = userEvent.setup();
      const mockResults = [
        {
          id: 1,
          title: 'Test Article',
          content: 'Test content',
          source: 'Test Source',
          published_at: '2023-01-01T00:00:00Z',
          sentiment: 0.5,
          asset_mentions: ['AAPL']
        }
      ];
      
      mockFetchSearchResults.mockResolvedValue(mockResults);
      
      render(<Search />);
      
      const searchInput = screen.getByRole('textbox', { name: /search query/i });
      const searchButton = getSubmitButton();
      
      await act(async () => {
        await user.type(searchInput, 'test query');
        await user.click(searchButton!);
      });
      
      await waitFor(() => {
        // Check that results are announced via aria-live region or similar
        expect(screen.getByText(/found.*1.*results/i)).toBeInTheDocument();
      });
    });
  });
}); 