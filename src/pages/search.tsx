import React, { useState, useCallback, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { SearchResult, fetchSearchResults } from '../utils/api';

// Filter options for search results
type FilterType = 'all' | 'positive' | 'negative' | 'neutral';

// Search input props with debounce capability
interface SearchBarProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
  initialQuery?: string;
}

// Search history component to show recent searches
const SearchHistory = ({ 
  searches, 
  onSelect, 
  onClear 
}: { 
  searches: string[]; 
  onSelect: (query: string) => void;
  onClear: () => void;
}) => {
  if (searches.length === 0) return null;
  
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-400">Recent Searches</h3>
        <button 
          onClick={onClear}
          className="text-xs text-gray-500 hover:text-accent transition"
          aria-label="Clear search history"
        >
          Clear All
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {searches.map((search, index) => (
          <button
            key={index}
            onClick={() => onSelect(search)}
            className="px-3 py-1 text-xs bg-gray-700 rounded-full hover:bg-gray-600 transition"
            aria-label={`Search for ${search}`}
          >
            {search}
          </button>
        ))}
      </div>
    </div>
  );
};

const SearchBar = ({ onSearch, isSearching, initialQuery = '' }: SearchBarProps) => {
  const [query, setQuery] = useState(initialQuery);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Focus input on mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);
  
  // Debounce search for auto-search as user types
  useEffect(() => {
    if (query.trim() && query.trim().length >= 3) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      searchTimeoutRef.current = setTimeout(() => {
        onSearch(query);
      }, 500); // 500ms debounce
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, onSearch]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isSearching) {
      // Clear timeout to prevent double search
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      onSearch(query);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex flex-col sm:flex-row">
        <div className="relative flex-grow">
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for articles, assets, or topics..."
            className="w-full px-4 py-2 rounded-t-md sm:rounded-t-none sm:rounded-l-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-accent"
            disabled={isSearching}
            aria-label="Search query"
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              aria-label="Clear search input"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        <button 
          type="submit"
          className={`px-4 py-2 bg-accent text-white rounded-b-md sm:rounded-b-none sm:rounded-r-md transition flex items-center justify-center ${isSearching ? 'opacity-70 cursor-not-allowed' : 'hover:bg-opacity-90'}`}
          disabled={isSearching}
          aria-label={isSearching ? 'Searching' : 'Search'}
        >
          {isSearching ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Searching...
            </>
          ) : (
            <>
              <svg className="mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              Search
            </>
          )}
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-1 ml-1">Enter at least 3 characters to search</p>
    </form>
  );
};

// Component to render asset badges with links
const AssetBadges = ({ assets }: { assets?: string[] }) => {
  if (!assets || assets.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {assets.map((asset, index) => (
        <Link 
          href={`/asset/${asset}`} 
          key={index}
          className="inline-block px-2 py-1 text-xs bg-gray-700 text-accent rounded hover:bg-gray-600 transition"
          aria-label={`View details for ${asset}`}
        >
          ${asset}
        </Link>
      ))}
    </div>
  );
};

// Filter component for search results
const ResultsFilter = ({ activeFilter, onFilterChange, resultCounts }: { 
  activeFilter: FilterType, 
  onFilterChange: (filter: FilterType) => void,
  resultCounts: Record<FilterType, number>
}) => {
  const filters: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Positive', value: 'positive' },
    { label: 'Negative', value: 'negative' },
    { label: 'Neutral', value: 'neutral' },
  ];
  
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`px-3 py-1 text-sm rounded-full transition flex items-center ${
            activeFilter === filter.value
              ? 'bg-accent text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          aria-label={`Filter by ${filter.label}`}
          aria-pressed={activeFilter === filter.value}
        >
          {filter.label}
          {resultCounts[filter.value] > 0 && (
            <span className="ml-1 text-xs bg-gray-800 rounded-full px-1.5 py-0.5">
              {resultCounts[filter.value]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

const SearchResults = ({ results }: { results: SearchResult[] }) => {
  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No results found matching your search criteria</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {results.map((result) => (
        <div key={result.id} className="bg-gray-800 rounded-lg p-4 shadow hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium text-accent mb-2">{result.title}</h3>
            <span 
              className={`
                ml-2 px-2 py-1 rounded text-xs
                ${result.sentiment > 0.3 ? 'bg-green-900 text-green-200' : 
                  result.sentiment < -0.3 ? 'bg-red-900 text-red-200' : 
                  'bg-gray-700 text-gray-300'}
              `}
              title={`Sentiment score: ${result.sentiment.toFixed(2)}`}
            >
              {result.sentiment.toFixed(2)}
            </span>
          </div>
          <p className="text-gray-400 mb-2 text-sm">{result.content.substring(0, 150)}...</p>
          
          {/* Asset mentions with links */}
          <AssetBadges assets={result.asset_mentions} />
          
          <div className="flex justify-between text-xs text-gray-500 mt-3">
            <span>{result.source}</span>
            <span>{new Date(result.published_at).toLocaleDateString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function Search() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [resultCounts, setResultCounts] = useState<Record<FilterType, number>>({
    all: 0,
    positive: 0,
    negative: 0,
    neutral: 0
  });
  const [queryFromUrl, setQueryFromUrl] = useState<string>('');
  
  // Check for query parameter in URL on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      setQueryFromUrl(q);
      handleSearch(q);
    }
  }, []);
  
  // Load search history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Error parsing search history:', e);
        localStorage.removeItem('searchHistory');
      }
    }
  }, []);
  
  // Save search history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);
  
  // Calculate result counts whenever results change
  useEffect(() => {
    if (results.length > 0) {
      setResultCounts({
        all: results.length,
        positive: results.filter(r => r.sentiment > 0.3).length,
        negative: results.filter(r => r.sentiment < -0.3).length,
        neutral: results.filter(r => r.sentiment >= -0.3 && r.sentiment <= 0.3).length
      });
    } else {
      setResultCounts({
        all: 0,
        positive: 0,
        negative: 0,
        neutral: 0
      });
    }
  }, [results]);
  
  // Add a search term to history
  const addToSearchHistory = useCallback((query: string) => {
    setSearchHistory(prev => {
      // Remove if already exists
      const filtered = prev.filter(item => item !== query);
      // Add to beginning and limit to 10 items
      return [query, ...filtered].slice(0, 10);
    });
  }, []);
  
  // Clear search history
  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  }, []);
  
  // Apply filter to results
  const applyFilter = useCallback((filter: FilterType, resultsToFilter: SearchResult[]) => {
    switch (filter) {
      case 'positive':
        return resultsToFilter.filter(r => r.sentiment > 0.3);
      case 'negative':
        return resultsToFilter.filter(r => r.sentiment < -0.3);
      case 'neutral':
        return resultsToFilter.filter(r => r.sentiment >= -0.3 && r.sentiment <= 0.3);
      default:
        return resultsToFilter;
    }
  }, []);
  
  // Handle filter change
  const handleFilterChange = useCallback((filter: FilterType) => {
    setActiveFilter(filter);
    setFilteredResults(applyFilter(filter, results));
  }, [results, applyFilter]);
  
  // Handle search with API call
  const handleSearch = async (query: string) => {
    if (!query.trim() || query.trim().length < 3) return;
    
    // Update URL with search query
    const url = new URL(window.location.href);
    url.searchParams.set('q', query);
    window.history.pushState({}, '', url.toString());
    
    setIsSearching(true);
    setError(null);
    
    try {
      const searchResults = await fetchSearchResults(query);
      setResults(searchResults);
      setFilteredResults(applyFilter(activeFilter, searchResults));
      // Add to search history
      addToSearchHistory(query);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch search results';
      setError(`Search failed: ${errorMessage}. Please try again later.`);
      console.error('Search error:', err);
      setResults([]);
      setFilteredResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  return (
    <>
      <Head>
        <title>Search | TradeEasy</title>
        <meta name="description" content="Search for financial articles, assets, and sentiment data" />
      </Head>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Search</h1>
        <p className="text-gray-400">Find articles, assets, and sentiment data</p>
      </div>
      
      <SearchBar 
        onSearch={handleSearch} 
        isSearching={isSearching} 
        initialQuery={queryFromUrl}
      />
      
      <SearchHistory 
        searches={searchHistory}
        onSelect={handleSearch}
        onClear={clearSearchHistory}
      />
      
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-200 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {isSearching ? (
        <div className="flex flex-col items-center justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
          <p className="mt-4 text-gray-400">Searching articles and analyzing sentiment...</p>
        </div>
      ) : filteredResults.length > 0 ? (
        <>
          <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <p className="text-sm text-gray-400 mb-2 sm:mb-0">Found {results.length} results</p>
            <ResultsFilter 
              activeFilter={activeFilter} 
              onFilterChange={handleFilterChange} 
              resultCounts={resultCounts}
            />
          </div>
          <SearchResults results={filteredResults} />
        </>
      ) : results.length > 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No results match the selected filter. Try another filter.</p>
          <div className="mt-4">
            <ResultsFilter 
              activeFilter={activeFilter} 
              onFilterChange={handleFilterChange} 
              resultCounts={resultCounts}
            />
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400">Enter a search term to find articles and sentiment data</p>
        </div>
      )}
    </>
  );
} 