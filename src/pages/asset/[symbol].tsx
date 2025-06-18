import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import { SentimentChart, Card, SentimentGauge } from '@/components/ui';
import { addToWatchlist, isInWatchlist, removeFromWatchlist } from '@/utils/watchlist';
import { initRealTimeUpdates, subscribeSentiment, disconnect, SentimentUpdate } from '@/utils/realtime';

interface AssetData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  sentiment: number;
}

interface NewsItem {
  id: number;
  title: string;
  content: string;
  source: string;
  published_at: string;
  sentiment: number;
}

interface SentimentDataPoint {
  timestamp: string;
  score: number;
}

// Generate mock sentiment history data
const generateSentimentHistory = (symbol: string, days: number = 30) => {
  const data: SentimentDataPoint[] = [];
  const now = new Date();
  
  // Generate daily data for the past 'days'
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Base sentiment with some randomness
    // Different starting points for different symbols to simulate variety
    const symbolSeed = symbol.charCodeAt(0) * 0.01;
    const baseVal = Math.sin(i * 0.2 + symbolSeed) * 0.5;
    
    // Add some random noise
    const noise = (Math.random() - 0.5) * 0.3;
    const sentimentScore = Math.max(-1, Math.min(1, baseVal + noise));
    
    data.push({
      timestamp: date.toISOString(),
      score: sentimentScore
    });
    
    // Add hourly data for the current day
    if (i === 0) {
      for (let hour = 1; hour <= 8; hour++) {
        const hourDate = new Date(now);
        hourDate.setHours(hourDate.getHours() - hour);
        
        const hourNoise = (Math.random() - 0.5) * 0.15;
        // Use the last daily sentiment as a base for hourly variations
        const hourSentiment = Math.max(-1, Math.min(1, sentimentScore + hourNoise));
        
        data.push({
          timestamp: hourDate.toISOString(),
          score: hourSentiment
        });
      }
    }
  }
  
  // Sort by timestamp
  return data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

// Simulate fetching history data from API
const fetchSentimentHistory = async (
  symbol: string,
  range: 'day' | 'week' | 'month' | 'year' = 'month'
): Promise<SentimentDataPoint[]> => {
  // In a real app, this would be a fetch to the backend API
  // GET /api/history?asset={symbol}&range={timespan}
  return new Promise((resolve) => {
    setTimeout(() => {
      // For now, use our mock data generator
      const days = range === 'day' ? 1 : range === 'week' ? 7 : range === 'month' ? 30 : 365;
      resolve(generateSentimentHistory(symbol, days));
    }, 500);
  });
};

const NewsList = ({ news }: { news: NewsItem[] }) => {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-medium mb-4">Recent News</h3>
      <div className="space-y-4">
        {news.map((item) => (
          <div key={item.id} className="p-4 bg-gray-700/50 backdrop-blur-sm rounded-lg transition-all hover:bg-gray-700">
            <div className="flex justify-between items-start">
              <h4 className="font-medium">{item.title}</h4>
              <span className={`ml-2 px-2 py-1 rounded text-xs ${item.sentiment > 0 ? 'bg-green-900/70 text-green-200' : 'bg-red-900/70 text-red-200'}`}>
                {item.sentiment.toFixed(2)}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-2">
              {item.content.substring(0, 100)}...
            </p>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>{item.source}</span>
              <span>{new Date(item.published_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// Watchlist button component
const WatchlistButton = ({ symbol }: { symbol: string }) => {
  const [inWatchlist, setInWatchlist] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if asset is already in watchlist
    if (typeof window !== 'undefined') {
      setInWatchlist(isInWatchlist(symbol));
      setIsLoading(false);
    }
  }, [symbol]);

  const handleToggleWatchlist = () => {
    if (inWatchlist) {
      // Need to find the ID of the asset in the watchlist
      // This is a workaround since we don't have a direct way to remove by symbol
      const watchlist = JSON.parse(localStorage.getItem('tradeeasy_watchlist') || '[]');
      const item = watchlist.find((item: any) => item.symbol === symbol);
      
      if (item) {
        const result = removeFromWatchlist(item.id);
        if (result.success) {
          setInWatchlist(false);
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      }
    } else {
      const result = addToWatchlist(symbol);
      if (result.success) {
        setInWatchlist(true);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    }
  };

  if (isLoading) {
    return (
      <button
        className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md opacity-50 cursor-not-allowed"
        disabled
      >
        Loading...
      </button>
    );
  }

  return (
    <button
      onClick={handleToggleWatchlist}
      className={`px-4 py-2 rounded-md transition-colors flex items-center ${
        inWatchlist 
          ? 'bg-red-600 hover:bg-red-700 text-white' 
          : 'bg-accent hover:bg-accent/90 text-white'
      }`}
      aria-label={inWatchlist ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-4 w-4 mr-2" 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path 
          fillRule="evenodd" 
          d={inWatchlist 
            ? "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            : "M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"
          } 
          clipRule="evenodd" 
        />
      </svg>
      {inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
    </button>
  );
};

export default function AssetDetail() {
  const router = useRouter();
  const { symbol } = router.query;
  
  const [assetData, setAssetData] = useState<AssetData | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [sentimentHistory, setSentimentHistory] = useState<SentimentDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTimespan, setActiveTimespan] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [recentlyUpdated, setRecentlyUpdated] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(false);
  
  useEffect(() => {
    if (!symbol) return;
    
    // Initialize real-time updates
    initRealTimeUpdates();
    
    // Fetch initial data
    fetchAssetData();
    
    // Subscribe to real-time sentiment updates
    const unsubscribe = subscribeSentiment((update: SentimentUpdate) => {
      if (update.asset === symbol) {
        // Update asset data with new sentiment
        setAssetData(prevData => {
          if (!prevData) return null;
          
          // Flash animation for sentiment update
          setRecentlyUpdated(true);
          setTimeout(() => setRecentlyUpdated(false), 2000);
          
          return {
            ...prevData,
            sentiment: update.score
          };
        });
        
        // Add the update to sentiment history
        setSentimentHistory(prev => {
          const newData = [...prev, {
            timestamp: update.timestamp,
            score: update.score
          }];
          
          // Sort by time
          return newData.sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
        });
        
        // Connection is established
        setConnectionStatus(true);
      }
    });
    
    // Clean up on unmount
    return () => {
      unsubscribe();
      disconnect();
    };
  }, [symbol]);
  
  // Effect to load history data when timespan changes
  useEffect(() => {
    if (!symbol) return;
    loadHistoryData();
  }, [symbol, activeTimespan]);
  
  const fetchAssetData = async () => {
    setLoading(true);
    
    // Mock API fetch
    // In real app, this would be a fetch to the backend
    setTimeout(() => {
      const mockAssets: Record<string, AssetData> = {
        'AAPL': { symbol: 'AAPL', name: 'Apple Inc.', price: 178.72, change: 1.25, sentiment: 0.65 },
        'MSFT': { symbol: 'MSFT', name: 'Microsoft Corp.', price: 417.88, change: -0.42, sentiment: 0.42 },
        'GOOG': { symbol: 'GOOG', name: 'Alphabet Inc.', price: 175.53, change: -1.07, sentiment: -0.12 },
        'AMZN': { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 182.41, change: 0.63, sentiment: 0.28 },
        'TSLA': { symbol: 'TSLA', name: 'Tesla Inc.', price: 175.21, change: -2.34, sentiment: -0.56 },
        'BTC': { symbol: 'BTC', name: 'Bitcoin', price: 29453.21, change: 2.15, sentiment: 0.32 },
      };
      
      const symbolStr = symbol as string;
      const data = mockAssets[symbolStr.toUpperCase()];
      
      if (data) {
        setAssetData(data);
        
        // Generate sentiment history data
        loadHistoryData();
        
        // Mock news for this asset
        setNews([
          {
            id: 1,
            title: `${data.name} Reports Quarterly Earnings Above Expectations`,
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisi vel consectetur euismod, nisi nisl consectetur nisi, euismod nisi nisl euismod nisi.',
            source: 'Financial Times',
            published_at: '2023-07-05T15:30:00Z',
            sentiment: 0.78
          },
          {
            id: 2,
            title: `Analysts Upgrade ${data.symbol} Following Strong Performance`,
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisi vel consectetur euismod, nisi nisl consectetur nisi, euismod nisi nisl euismod nisi.',
            source: 'Wall Street Journal',
            published_at: '2023-06-28T09:45:00Z',
            sentiment: 0.65
          },
          {
            id: 3,
            title: `${data.name} Announces New Product Line`,
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisi vel consectetur euismod, nisi nisl consectetur nisi, euismod nisi nisl euismod nisi.',
            source: 'Bloomberg',
            published_at: '2023-06-22T11:20:00Z',
            sentiment: 0.42
          },
          {
            id: 4,
            title: `Market Analysts Discuss ${data.symbol}'s Future Prospects`,
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisi vel consectetur euismod, nisi nisl consectetur nisi, euismod nisi nisl euismod nisi.',
            source: 'Reuters',
            published_at: '2023-06-18T13:15:00Z',
            sentiment: -0.15
          },
          {
            id: 5,
            title: `Industry Trends Impact ${data.name}'s Market Position`,
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisi vel consectetur euismod, nisi nisl consectetur nisi, euismod nisi nisl euismod nisi.',
            source: 'CNBC',
            published_at: '2023-06-10T09:30:00Z',
            sentiment: 0.22
          }
        ]);
      }
      
      setLoading(false);
    }, 1000);
  };
  
  const loadHistoryData = async () => {
    if (!symbol) return;
    
    try {
      const historyData = await fetchSentimentHistory(symbol as string, activeTimespan);
      setSentimentHistory(historyData);
    } catch (error) {
      console.error('Error fetching sentiment history:', error);
      toast.error('Failed to load sentiment history data');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center my-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }
  
  if (!assetData) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Asset Not Found</h1>
        <p className="text-gray-400">The asset symbol "{symbol}" could not be found.</p>
        <button 
          onClick={() => router.push('/dashboard')}
          className="mt-6 px-4 py-2 bg-accent text-white rounded-md hover:bg-opacity-90 transition"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }
  
  return (
    <>
      <Head>
        <title>{assetData.symbol} | TradeEasy</title>
        <meta name="description" content={`${assetData.name} (${assetData.symbol}) sentiment and price data`} />
      </Head>
      
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              {assetData.symbol}
              {connectionStatus && (
                <span className="ml-2 flex items-center text-xs text-gray-400">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  Live
                </span>
              )}
            </h1>
            <p className="text-xl text-gray-400">{assetData.name}</p>
          </div>
          <div className="text-left md:text-right mt-4 md:mt-0">
            <p className="text-2xl">${assetData.price.toFixed(2)}</p>
            <p className={`text-lg ${assetData.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {assetData.change > 0 ? '+' : ''}{assetData.change}%
            </p>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sentiment Gauge */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4 flex flex-col items-center justify-center transition-all duration-300" 
            style={{ 
              boxShadow: recentlyUpdated ? '0 0 15px rgba(74, 222, 128, 0.3)' : 'none',
              borderColor: recentlyUpdated ? 'rgba(74, 222, 128, 0.5)' : ''
            }}
          >
            <h3 className="text-lg font-medium mb-2">Current Sentiment</h3>
            <SentimentGauge 
              asset={assetData.symbol}
              score={assetData.sentiment}
              size="lg"
            />
          </div>
          
          {/* Price Card */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4 flex flex-col">
            <h3 className="text-lg font-medium mb-4">Market Data</h3>
            <div className="space-y-3 flex-grow">
              <div className="flex justify-between">
                <span className="text-gray-400">Price:</span>
                <span className="font-medium">${assetData.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Change:</span>
                <span className={`font-medium ${assetData.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {assetData.change > 0 ? '+' : ''}{assetData.change}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Sentiment:</span>
                <span className={`font-medium ${
                  assetData.sentiment > 0.5 ? 'text-green-400' : 
                  assetData.sentiment > 0 ? 'text-green-500' : 
                  assetData.sentiment > -0.5 ? 'text-red-500' : 'text-red-400'
                }`}>
                  {assetData.sentiment.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="mt-4">
              <WatchlistButton symbol={assetData.symbol} />
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4">
            <h3 className="text-lg font-medium mb-4">Sentiment Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Today's High:</span>
                <span className="font-medium text-green-400">
                  {(Math.max(...sentimentHistory.filter(d => {
                    const date = new Date(d.timestamp);
                    const today = new Date();
                    return date.getDate() === today.getDate() && 
                           date.getMonth() === today.getMonth() && 
                           date.getFullYear() === today.getFullYear();
                  }).map(d => d.score)) || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Today's Low:</span>
                <span className="font-medium text-red-400">
                  {(Math.min(...sentimentHistory.filter(d => {
                    const date = new Date(d.timestamp);
                    const today = new Date();
                    return date.getDate() === today.getDate() && 
                           date.getMonth() === today.getMonth() && 
                           date.getFullYear() === today.getFullYear();
                  }).map(d => d.score)) || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Average ({activeTimespan}):</span>
                <span className="font-medium">
                  {(sentimentHistory.reduce((sum, item) => sum + item.score, 0) / (sentimentHistory.length || 1)).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Volatility:</span>
                <span className="font-medium">
                  {((Math.max(...sentimentHistory.map(d => d.score)) - 
                    Math.min(...sentimentHistory.map(d => d.score))) || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sentiment Chart */}
      <div className="mb-6">
        <SentimentChart 
          data={sentimentHistory} 
          assetSymbol={assetData.symbol} 
          height={350}
          timespan={activeTimespan}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700"
        />
      </div>
      
      {/* News List */}
      <NewsList news={news} />
    </>
  );
} 