import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { SentimentChart, Card } from '@/components/ui';

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

const NewsList = ({ news }: { news: NewsItem[] }) => {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-medium mb-4">Recent News</h3>
      <div className="space-y-4">
        {news.map((item) => (
          <div key={item.id} className="p-4 bg-gray-700 rounded-lg">
            <div className="flex justify-between items-start">
              <h4 className="font-medium">{item.title}</h4>
              <span className={`ml-2 px-2 py-1 rounded text-xs ${item.sentiment > 0 ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
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

export default function AssetDetail() {
  const router = useRouter();
  const { symbol } = router.query;
  
  const [assetData, setAssetData] = useState<AssetData | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [sentimentHistory, setSentimentHistory] = useState<SentimentDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!symbol) return;
    
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
        setSentimentHistory(generateSentimentHistory(symbolStr.toUpperCase()));
        
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
          }
        ]);
      }
      
      setLoading(false);
    }, 1000);
  }, [symbol]);
  
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
      </Head>
      
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{assetData.symbol}</h1>
            <p className="text-xl text-gray-400">{assetData.name}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl">${assetData.price.toFixed(2)}</p>
            <p className={`text-lg ${assetData.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {assetData.change > 0 ? '+' : ''}{assetData.change}%
            </p>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-gray-800 rounded-lg inline-block">
          <div className="flex items-center">
            <span className="text-gray-400 mr-2">Current Sentiment:</span>
            <span 
              className={`px-3 py-1 rounded font-medium ${
                assetData.sentiment > 0.5 ? 'bg-green-600' : 
                assetData.sentiment > 0 ? 'bg-green-700' : 
                assetData.sentiment > -0.5 ? 'bg-red-700' : 'bg-red-600'
              }`}
            >
              {assetData.sentiment.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
      
      {/* Sentiment Chart */}
      <div className="mb-6">
        <SentimentChart 
          data={sentimentHistory} 
          assetSymbol={assetData.symbol} 
          height={350}
        />
      </div>
      
      {/* News List */}
      <NewsList news={news} />
    </>
  );
} 