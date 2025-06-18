import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Tooltip } from '@/components/ui';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { 
  WatchlistItem, 
  loadWatchlist, 
  addToWatchlist, 
  removeFromWatchlist, 
  getUpdatedWatchlist,
  mockAssetData
} from '@/utils/watchlist';

const WatchlistTable = ({ items, onRemove }: { 
  items: WatchlistItem[],
  onRemove: (id: number) => void
}) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-800 rounded-lg">
        <p className="text-gray-400">Your watchlist is empty. Add assets to track.</p>
      </div>
    );
  }

  const getSentimentDescription = (score: number) => {
    if (score > 0.3) return "Strongly Bullish";
    if (score > 0) return "Moderately Bullish";
    if (score < -0.3) return "Strongly Bearish";
    if (score < 0) return "Moderately Bearish";
    return "Neutral";
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
        <h2 className="text-xl font-medium">Tracked Assets</h2>
        <Tooltip
          content={
            <div className="max-w-xs">
              <p className="font-medium mb-1">Understanding Asset Metrics</p>
              <ul className="text-sm space-y-1">
                <li>• Sentiment: Score from -1 (bearish) to +1 (bullish)</li>
                <li>• Price: Current market price</li>
                <li>• Change: 24-hour price change percentage</li>
              </ul>
            </div>
          }
          position="left"
        >
          <QuestionMarkCircleIcon className="w-5 h-5 text-gray-400 hover:text-gray-300 cursor-help" />
        </Tooltip>
      </div>
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-900">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Symbol</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              <div className="flex items-center gap-1">
                Sentiment
                <Tooltip content="Market sentiment score based on news and social media analysis" position="top">
                  <QuestionMarkCircleIcon className="w-4 h-4 text-gray-500" />
                </Tooltip>
              </div>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Change</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-gray-700">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Tooltip content="Click to view detailed analysis" position="right">
                  <Link 
                    href={`/asset/${item.symbol}`}
                    className="text-accent hover:text-accent-light hover:underline transition"
                    aria-label={`View details for ${item.symbol}`}
                  >
                    {item.symbol}
                  </Link>
                </Tooltip>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <Tooltip 
                  content={`Current sentiment is ${getSentimentDescription(item.sentiment).toLowerCase()}`}
                  position="top"
                >
                  <span className={`inline-block px-2 py-1 rounded ${
                    item.sentiment > 0.3 ? 'bg-green-900 text-green-200' : 
                    item.sentiment < -0.3 ? 'bg-red-900 text-red-200' : 
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {item.sentiment.toFixed(2)}
                  </span>
                </Tooltip>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                <Tooltip content="Current market price" position="top">
                  <span>{item.symbol.includes('/') ? item.price.toFixed(4) : `$${item.price.toFixed(2)}`}</span>
                </Tooltip>
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm ${item.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                <Tooltip content="24-hour price change" position="top">
                  <span>{item.change > 0 ? '+' : ''}{item.change}%</span>
                </Tooltip>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <Tooltip content="Remove from watchlist" position="left">
                  <button 
                    onClick={() => onRemove(item.id)}
                    className="text-red-400 hover:text-red-300 transition"
                    aria-label={`Remove ${item.symbol} from watchlist`}
                  >
                    Remove
                  </button>
                </Tooltip>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AddAssetForm = ({ onAdd, existingSymbols }: { 
  onAdd: (symbol: string) => void, 
  existingSymbols: string[] 
}) => {
  const [symbol, setSymbol] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  // Filter suggestions based on input
  useEffect(() => {
    if (symbol.trim() === '') {
      setSuggestions([]);
      return;
    }
    
    const availableAssets = Object.keys(mockAssetData)
      .filter(s => !existingSymbols.includes(s))
      .filter(s => s.toLowerCase().includes(symbol.toLowerCase()));
    
    setSuggestions(availableAssets.slice(0, 5)); // Limit to 5 suggestions
  }, [symbol, existingSymbols]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symbol.trim()) {
      onAdd(symbol.trim().toUpperCase());
      setSymbol('');
      setSuggestions([]);
    }
  };
  
  const handleSuggestionClick = (selectedSymbol: string) => {
    onAdd(selectedSymbol);
    setSymbol('');
    setSuggestions([]);
  };
  
  return (
    <div className="mb-6 bg-gray-800 p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-3">Add Asset to Watchlist</h3>
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex">
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Enter asset symbol (e.g., AAPL, BTC, EUR/USD)"
            className="flex-grow px-4 py-2 rounded-l-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Asset symbol"
          />
          <button 
            type="submit"
            className="px-4 py-2 bg-accent text-white rounded-r-md hover:bg-opacity-90 transition"
          >
            Add
          </button>
        </div>
        
        {/* Suggestions dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
            <ul className="py-1">
              {suggestions.map((suggestion) => (
                <li 
                  key={suggestion} 
                  className="px-4 py-2 hover:bg-gray-600 cursor-pointer"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="flex justify-between">
                    <span className="text-accent font-medium">{suggestion}</span>
                    <span className="text-gray-300 text-sm">{mockAssetData[suggestion].name}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>
      
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="text-sm text-gray-400">Popular:</span>
        {['AAPL', 'MSFT', 'BTC', 'TSLA', 'AMZN']
          .filter(s => !existingSymbols.includes(s))
          .slice(0, 3)
          .map(symbol => (
            <button
              key={symbol}
              onClick={() => onAdd(symbol)}
              className="px-2 py-1 text-xs bg-gray-700 rounded hover:bg-gray-600 transition"
            >
              {symbol}
            </button>
          ))}
      </div>
    </div>
  );
};

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load watchlist from localStorage on mount
  useEffect(() => {
    const loadWatchlistData = () => {
      try {
        // Get updated watchlist with latest data
        const updatedWatchlist = getUpdatedWatchlist();
        setWatchlist(updatedWatchlist);
      } catch (error) {
        console.error('Error loading watchlist:', error);
        toast.error('Failed to load your watchlist');
      } finally {
        setLoading(false);
      }
    };
    
    // Simulate a network request to get latest data
    const timerId = setTimeout(loadWatchlistData, 500);
    
    return () => clearTimeout(timerId);
  }, []);
  
  const handleAddAsset = (symbol: string) => {
    const result = addToWatchlist(symbol);
    
    if (result.success && result.item) {
      setWatchlist([...watchlist, result.item]);
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };
  
  const handleRemoveAsset = (id: number) => {
    const result = removeFromWatchlist(id);
    
    if (result.success) {
      setWatchlist(watchlist.filter(item => item.id !== id));
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };
  
  const existingSymbols = watchlist.map(item => item.symbol);
  
  return (
    <>
      <Head>
        <title>Watchlist | TradeEasy</title>
        <meta name="description" content="Track your favorite assets and their sentiment on TradeEasy" />
      </Head>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Watchlist</h1>
        <p className="text-gray-400">Track your favorite assets and their sentiment</p>
      </div>
      
      <AddAssetForm onAdd={handleAddAsset} existingSymbols={existingSymbols} />
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      ) : (
        <WatchlistTable items={watchlist} onRemove={handleRemoveAsset} />
      )}
    </>
  );
} 