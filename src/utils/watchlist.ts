/**
 * Utility functions for managing the watchlist
 */

// Type for watchlist items
export interface WatchlistItem {
  id: number;
  symbol: string;
  name: string;
  sentiment: number;
  price: number;
  change: number;
  addedAt: string; // ISO string timestamp
}

// Mock data for assets that can be added to the watchlist
export const mockAssetData: Record<string, Omit<WatchlistItem, 'id' | 'addedAt'>> = {
  'AAPL': { symbol: 'AAPL', name: 'Apple Inc.', price: 178.72, change: 1.25, sentiment: 0.65 },
  'MSFT': { symbol: 'MSFT', name: 'Microsoft Corp.', price: 417.88, change: -0.42, sentiment: 0.42 },
  'GOOG': { symbol: 'GOOG', name: 'Alphabet Inc.', price: 175.53, change: 0.63, sentiment: 0.23 },
  'AMZN': { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 182.41, change: 1.28, sentiment: 0.51 },
  'TSLA': { symbol: 'TSLA', name: 'Tesla Inc.', price: 175.21, change: -2.34, sentiment: -0.32 },
  'BTC': { symbol: 'BTC', name: 'Bitcoin', price: 29453.21, change: -1.07, sentiment: -0.12 },
  'ETH': { symbol: 'ETH', name: 'Ethereum', price: 2573.42, change: 0.76, sentiment: 0.52 },
  'SPY': { symbol: 'SPY', name: 'SPDR S&P 500 ETF', price: 453.82, change: 0.15, sentiment: 0.12 },
  'EUR/USD': { symbol: 'EUR/USD', name: 'Euro/US Dollar', price: 1.0982, change: 0.05, sentiment: -0.08 },
  'GOLD': { symbol: 'GOLD', name: 'Gold', price: 2345.30, change: 0.58, sentiment: 0.48 }
};

// Local storage key
const WATCHLIST_STORAGE_KEY = 'tradeeasy_watchlist';

/**
 * Load watchlist from localStorage
 */
export function loadWatchlist(): WatchlistItem[] {
  if (typeof window === 'undefined') {
    return []; // Return empty array when running on server
  }
  
  try {
    const storedWatchlist = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    return storedWatchlist ? JSON.parse(storedWatchlist) : [];
  } catch (error) {
    console.error('Error loading watchlist from localStorage:', error);
    return [];
  }
}

/**
 * Save watchlist to localStorage
 */
export function saveWatchlist(watchlist: WatchlistItem[]): void {
  if (typeof window === 'undefined') {
    return; // Do nothing when running on server
  }
  
  try {
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlist));
  } catch (error) {
    console.error('Error saving watchlist to localStorage:', error);
  }
}

/**
 * Add an asset to the watchlist
 */
export function addToWatchlist(symbol: string): { success: boolean; message: string; item?: WatchlistItem } {
  const watchlist = loadWatchlist();
  
  // Check if asset already exists in watchlist
  if (watchlist.some(item => item.symbol === symbol)) {
    return { 
      success: false, 
      message: `${symbol} is already in your watchlist` 
    };
  }
  
  // Get asset data from mock data
  const assetData = mockAssetData[symbol];
  if (!assetData) {
    return { 
      success: false, 
      message: `Asset ${symbol} not found` 
    };
  }
  
  // Create new watchlist item
  const newItem: WatchlistItem = {
    id: Date.now(),
    ...assetData,
    addedAt: new Date().toISOString()
  };
  
  // Add to watchlist and save
  const updatedWatchlist = [...watchlist, newItem];
  saveWatchlist(updatedWatchlist);
  
  return { 
    success: true, 
    message: `${symbol} added to watchlist`,
    item: newItem
  };
}

/**
 * Remove an asset from the watchlist
 */
export function removeFromWatchlist(id: number): { success: boolean; message: string } {
  const watchlist = loadWatchlist();
  const itemToRemove = watchlist.find(item => item.id === id);
  
  if (!itemToRemove) {
    return { 
      success: false, 
      message: 'Asset not found in watchlist' 
    };
  }
  
  const updatedWatchlist = watchlist.filter(item => item.id !== id);
  saveWatchlist(updatedWatchlist);
  
  return { 
    success: true, 
    message: `${itemToRemove.symbol} removed from watchlist` 
  };
}

/**
 * Check if an asset is in the watchlist
 */
export function isInWatchlist(symbol: string): boolean {
  const watchlist = loadWatchlist();
  return watchlist.some(item => item.symbol === symbol);
}

/**
 * Get up-to-date watchlist with latest asset data
 * This simulates fetching the latest data for watchlist items
 */
export function getUpdatedWatchlist(): WatchlistItem[] {
  const watchlist = loadWatchlist();
  
  // Update each item with latest mock data
  return watchlist.map(item => {
    const latestData = mockAssetData[item.symbol];
    if (latestData) {
      return {
        ...item,
        ...latestData,
      };
    }
    return item;
  });
} 