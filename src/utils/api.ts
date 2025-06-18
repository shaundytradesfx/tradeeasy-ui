/**
 * API utility functions for TradeEasy
 */

/**
 * Generic function to fetch data from the API
 */
export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`API error: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * Interface for search result items
 */
export interface SearchResult {
  id: number;
  title: string;
  content: string;
  source: string;
  published_at: string;
  sentiment: number;
  asset_mentions?: string[]; // Optional array of asset symbols mentioned in the article
}

/**
 * Function to fetch search results from the API
 */
export async function fetchSearchResults(query: string): Promise<SearchResult[]> {
  if (!query || query.trim() === '') {
    return [];
  }
  
  try {
    return await fetchApi<SearchResult[]>(`/search?q=${encodeURIComponent(query)}`);
  } catch (error) {
    console.error('Search request failed:', error);
    
    // Return mock data as fallback during development
    return getMockSearchResults(query);
  }
}

/**
 * Mock search results for development and testing
 * @param query The search query to filter mock results (if needed)
 */
function getMockSearchResults(query?: string): SearchResult[] {
  const allResults = [
    {
      id: 1,
      title: 'Apple Reports Strong Quarterly Earnings',
      content: 'Apple Inc. today announced financial results for its fiscal 2023 third quarter ended July 1, 2023. The Company posted a June quarter revenue record of $81.8 billion and quarterly earnings per diluted share of $1.26.',
      source: 'Financial Times',
      published_at: '2023-07-05T15:30:00Z',
      sentiment: 0.78,
      asset_mentions: ['AAPL']
    },
    {
      id: 2,
      title: 'Market Volatility Rises Amid Banking Concerns',
      content: 'Global markets experienced increased volatility today as concerns about the stability of certain banking institutions prompted a broad sell-off. The S&P 500 index fell by 1.65% as investors moved toward safe-haven assets.',
      source: 'Wall Street Journal',
      published_at: '2023-06-22T09:45:00Z',
      sentiment: -0.52,
      asset_mentions: ['SPY']
    },
    {
      id: 3,
      title: 'Bitcoin Surges Past $30,000 Mark',
      content: 'Bitcoin has surged past the $30,000 mark for the first time in two months, signaling renewed investor confidence in cryptocurrencies. The move comes amid broader adoption by institutional investors and positive regulatory signals.',
      source: 'CoinDesk',
      published_at: '2023-06-30T11:20:00Z',
      sentiment: 0.65,
      asset_mentions: ['BTC']
    },
    {
      id: 4,
      title: 'Federal Reserve Signals Potential Rate Cut',
      content: 'The Federal Reserve today signaled a potential shift in monetary policy, suggesting that interest rate cuts could be on the horizon in the coming months. Markets reacted positively to the news, with major indices closing higher.',
      source: 'Bloomberg',
      published_at: '2023-07-10T13:45:00Z',
      sentiment: 0.45,
      asset_mentions: ['DXY', 'SPY']
    },
    {
      id: 5,
      title: 'Oil Prices Drop on Demand Concerns',
      content: 'Crude oil prices fell sharply today as investors worried about slowing global demand. The International Energy Agency revised its demand growth forecast downward, citing economic headwinds in major economies.',
      source: 'Reuters',
      published_at: '2023-07-08T10:30:00Z',
      sentiment: -0.68,
      asset_mentions: ['CL', 'XOM']
    }
  ];
  
  // If a query is provided, filter results to simulate a search
  if (query && query.trim() !== '') {
    const lowercaseQuery = query.toLowerCase();
    return allResults.filter(result => 
      result.title.toLowerCase().includes(lowercaseQuery) || 
      result.content.toLowerCase().includes(lowercaseQuery) ||
      result.asset_mentions?.some(asset => asset.toLowerCase().includes(lowercaseQuery))
    );
  }
  
  return allResults;
} 