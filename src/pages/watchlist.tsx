import React, { useState } from 'react';
import Head from 'next/head';

interface WatchlistItem {
  id: number;
  symbol: string;
  name: string;
  sentiment: number;
  price: number;
  change: number;
}

const WatchlistTable = ({ items, onRemove }: { 
  items: WatchlistItem[],
  onRemove: (id: number) => void
}) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-900">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Symbol</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Sentiment</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Change</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-gray-700">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-accent">{item.symbol}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`inline-block px-2 py-1 rounded ${item.sentiment > 0 ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
                  {item.sentiment.toFixed(2)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${item.price}</td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm ${item.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {item.change > 0 ? '+' : ''}{item.change}%
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button 
                  onClick={() => onRemove(item.id)}
                  className="text-red-400 hover:text-red-300 transition"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AddAssetForm = ({ onAdd }: { onAdd: (symbol: string) => void }) => {
  const [symbol, setSymbol] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symbol.trim()) {
      onAdd(symbol.trim().toUpperCase());
      setSymbol('');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="mb-6 bg-gray-800 p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-3">Add Asset to Watchlist</h3>
      <div className="flex">
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Enter asset symbol (e.g., AAPL, BTC, EUR/USD)"
          className="flex-grow px-4 py-2 rounded-l-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button 
          type="submit"
          className="px-4 py-2 bg-accent text-white rounded-r-md hover:bg-opacity-90 transition"
        >
          Add
        </button>
      </div>
    </form>
  );
};

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([
    { id: 1, symbol: 'AAPL', name: 'Apple Inc.', sentiment: 0.65, price: 178.72, change: 1.25 },
    { id: 2, symbol: 'MSFT', name: 'Microsoft Corp.', sentiment: 0.42, price: 417.88, change: -0.42 },
    { id: 3, symbol: 'BTC', name: 'Bitcoin', sentiment: -0.12, price: 29453.21, change: -1.07 }
  ]);
  
  const handleAddAsset = (symbol: string) => {
    // Mock API request to add asset
    // In real app, this would make a backend call
    
    const mockAssets: Record<string, Omit<WatchlistItem, 'id'>> = {
      'GOOG': { symbol: 'GOOG', name: 'Alphabet Inc.', sentiment: 0.23, price: 175.53, change: 0.63 },
      'AMZN': { symbol: 'AMZN', name: 'Amazon.com Inc.', sentiment: 0.51, price: 182.41, change: 1.28 },
      'TSLA': { symbol: 'TSLA', name: 'Tesla Inc.', sentiment: -0.32, price: 175.21, change: -2.34 }
    };
    
    if (mockAssets[symbol]) {
      const newItem = {
        id: Date.now(),
        ...mockAssets[symbol]
      };
      
      setWatchlist(prev => [...prev, newItem]);
    } else {
      alert(`Asset "${symbol}" not found or already in watchlist`);
    }
  };
  
  const handleRemoveAsset = (id: number) => {
    setWatchlist(prev => prev.filter(item => item.id !== id));
  };
  
  return (
    <>
      <Head>
        <title>Watchlist | TradeEasy</title>
      </Head>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Watchlist</h1>
        <p className="text-gray-400">Track your favorite assets and their sentiment</p>
      </div>
      
      <AddAssetForm onAdd={handleAddAsset} />
      
      {watchlist.length > 0 ? (
        <WatchlistTable items={watchlist} onRemove={handleRemoveAsset} />
      ) : (
        <div className="text-center py-12 bg-gray-800 rounded-lg">
          <p className="text-gray-400">Your watchlist is empty. Add assets to track.</p>
        </div>
      )}
    </>
  );
} 