import React, { useState } from 'react';
import Head from 'next/head';

interface SearchResult {
  id: number;
  title: string;
  content: string;
  source: string;
  published_at: string;
  sentiment: number;
}

const SearchBar = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const [query, setQuery] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };
  
  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for articles, assets, or topics..."
          className="flex-grow px-4 py-2 rounded-l-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button 
          type="submit"
          className="px-4 py-2 bg-accent text-white rounded-r-md hover:bg-opacity-90 transition"
        >
          Search
        </button>
      </div>
    </form>
  );
};

const SearchResults = ({ results }: { results: SearchResult[] }) => {
  return (
    <div className="space-y-4">
      {results.map((result) => (
        <div key={result.id} className="bg-gray-800 rounded-lg p-4 shadow hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium text-accent mb-2">{result.title}</h3>
            <span className={`ml-2 px-2 py-1 rounded text-xs ${result.sentiment > 0 ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
              {result.sentiment.toFixed(2)}
            </span>
          </div>
          <p className="text-gray-400 mb-2 text-sm">{result.content.substring(0, 150)}...</p>
          <div className="flex justify-between text-xs text-gray-500">
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
  const [isSearching, setIsSearching] = useState(false);
  
  const handleSearch = (query: string) => {
    setIsSearching(true);
    
    // Mock API request
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          id: 1,
          title: 'Apple Reports Strong Quarterly Earnings',
          content: 'Apple Inc. today announced financial results for its fiscal 2023 third quarter ended July 1, 2023. The Company posted a June quarter revenue record of $81.8 billion and quarterly earnings per diluted share of $1.26.',
          source: 'Financial Times',
          published_at: '2023-07-05T15:30:00Z',
          sentiment: 0.78
        },
        {
          id: 2,
          title: 'Market Volatility Rises Amid Banking Concerns',
          content: 'Global markets experienced increased volatility today as concerns about the stability of certain banking institutions prompted a broad sell-off. The S&P 500 index fell by 1.65% as investors moved toward safe-haven assets.',
          source: 'Wall Street Journal',
          published_at: '2023-06-22T09:45:00Z',
          sentiment: -0.52
        },
        {
          id: 3,
          title: 'Bitcoin Surges Past $30,000 Mark',
          content: 'Bitcoin has surged past the $30,000 mark for the first time in two months, signaling renewed investor confidence in cryptocurrencies. The move comes amid broader adoption by institutional investors and positive regulatory signals.',
          source: 'CoinDesk',
          published_at: '2023-06-30T11:20:00Z',
          sentiment: 0.65
        }
      ];
      
      setResults(mockResults);
      setIsSearching(false);
    }, 1000);
  };
  
  return (
    <>
      <Head>
        <title>Search | TradeEasy</title>
      </Head>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Search</h1>
        <p className="text-gray-400">Find articles, assets, and sentiment data</p>
      </div>
      
      <SearchBar onSearch={handleSearch} />
      
      {isSearching ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      ) : results.length > 0 ? (
        <SearchResults results={results} />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400">Enter a search term to find articles and sentiment data</p>
        </div>
      )}
    </>
  );
} 