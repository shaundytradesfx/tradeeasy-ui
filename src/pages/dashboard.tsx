import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Card, Container, SentimentGauge, PriceChart, NewsCarousel } from '@/components/ui';
import { initRealTimeUpdates, subscribeSentiment, simulateSentimentUpdate, SentimentUpdate, disconnect } from '@/utils/realtime';
import { mockAssetData } from '@/utils/watchlist';
import { motion, AnimatePresence } from 'framer-motion';

// Sample data for charts
const generateChartData = (baseValue: number, volatility: number, length: number = 20) => {
  return Array.from({ length }, (_, i) => ({
    time: `${i}:00`,
    value: baseValue + (Math.random() - 0.5) * volatility
  }));
};

// Sample news data
const newsItems = [
  {
    id: 1,
    title: 'Fed Expected to Maintain Interest Rates at Next Meeting',
    source: 'Financial Times',
    date: '2h ago',
    sentiment: 0.15,
    image: 'https://images.unsplash.com/photo-1638913662295-9630035ef770?q=80&w=320&auto=format'
  },
  {
    id: 2,
    title: 'Tech Stocks Rally on Strong Earnings Reports',
    source: 'Bloomberg',
    date: '4h ago',
    sentiment: 0.72,
    image: 'https://images.unsplash.com/photo-1625798912453-5ada25cffb71?q=80&w=320&auto=format'
  },
  {
    id: 3,
    title: 'Oil Prices Drop Amid Global Demand Concerns',
    source: 'Reuters',
    date: '6h ago',
    sentiment: -0.48,
    image: 'https://images.unsplash.com/photo-1615224571365-ad27bcf0af3a?q=80&w=320&auto=format'
  },
  {
    id: 4,
    title: 'New Trade Agreement Boosts Market Confidence',
    source: 'Wall Street Journal',
    date: '8h ago',
    sentiment: 0.64,
    image: 'https://images.unsplash.com/photo-1638913658211-c999de7fe786?q=80&w=320&auto=format'
  },
];

// Initial market data
const initialMarketData = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 178.72, change: 1.25, sentiment: 0.65, data: generateChartData(175, 10) },
  { symbol: 'EUR/USD', name: 'Euro/US Dollar', price: 1.0982, change: 0.12, sentiment: 0.12, data: generateChartData(1.09, 0.01) },
  { symbol: 'BTC', name: 'Bitcoin', price: 52361.87, change: -1.24, sentiment: -0.24, data: generateChartData(52000, 1000) },
  { symbol: 'GOLD', name: 'Gold', price: 2345.30, change: 0.58, sentiment: 0.48, data: generateChartData(2340, 20) },
  { symbol: 'ETH', name: 'Ethereum', price: 2573.42, change: 0.76, sentiment: 0.52, data: generateChartData(2500, 100) },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 417.88, change: -0.42, sentiment: 0.42, data: generateChartData(420, 15) },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 182.41, change: 0.63, sentiment: 0.28, data: generateChartData(180, 8) },
];

// Enhanced TableCell component with animation
const AnimatedTableCell = ({ 
  children, 
  isUpdated = false,
  className = ""
}: { 
  children: React.ReactNode, 
  isUpdated?: boolean,
  className?: string
}) => {
  return (
    <td className={`px-6 py-4 whitespace-nowrap text-sm ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={isUpdated ? 'updated' : 'normal'}
          initial={isUpdated ? { backgroundColor: 'rgba(74, 222, 128, 0.2)' } : {}}
          animate={{ backgroundColor: 'rgba(74, 222, 128, 0)' }}
          transition={{ duration: 1.5 }}
          className="rounded-sm px-1 -mx-1"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </td>
  );
};

export default function Dashboard() {
  // State for real-time data
  const [marketData, setMarketData] = useState(initialMarketData);
  const [recentUpdates, setRecentUpdates] = useState<Record<string, number>>({});
  const [connectionStatus, setConnectionStatus] = useState(false);
  
  // Initialize real-time updates
  useEffect(() => {
    // Initialize WebSocket connection
    initRealTimeUpdates();
    
    // Subscribe to sentiment updates
    const unsubscribe = subscribeSentiment((update: SentimentUpdate) => {
      setMarketData(prevData => {
        // Update market data with new sentiment score
        const newData = prevData.map(asset => {
          if (asset.symbol === update.asset) {
            // Track this update for animation purposes
            setRecentUpdates(prev => ({
              ...prev,
              [asset.symbol]: Date.now()
            }));
            
            return {
              ...asset,
              sentiment: update.score,
              // Also simulate a small price change
              price: asset.price * (1 + (Math.random() * 0.01 - 0.005)),
              change: asset.change + (Math.random() * 0.1 - 0.05)
            };
          }
          return asset;
        });
        
        return newData;
      });
    });
    
    // For development/demo, simulate updates every few seconds
    let simulationInterval: NodeJS.Timeout;
    if (process.env.NODE_ENV === 'development') {
      simulationInterval = setInterval(() => {
        // Pick a random asset
        const randomAsset = initialMarketData[Math.floor(Math.random() * initialMarketData.length)].symbol;
        simulateSentimentUpdate(randomAsset);
      }, 5000);
      
      // Initial simulation after 1 second
      setTimeout(() => {
        simulateSentimentUpdate('AAPL');
      }, 1000);
    }
    
    // Cleanup function
    return () => {
      unsubscribe();
      if (simulationInterval) clearInterval(simulationInterval);
      disconnect();
    };
  }, []);
  
  // Function to check if an asset was recently updated (for animations)
  const wasRecentlyUpdated = (symbol: string): boolean => {
    const updateTime = recentUpdates[symbol];
    if (!updateTime) return false;
    
    // Consider "recent" as within the last 2 seconds
    return Date.now() - updateTime < 2000;
  };
  
  return (
    <>
      <Head>
        <title>Dashboard | TradeEasy</title>
      </Head>
      
      <div className="relative">
        {/* Dot pattern background */}
        <div className="absolute inset-0 bg-dot-white opacity-10 pointer-events-none"></div>
        
        <Container>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-400">Real-time sentiment analytics for financial markets</p>
            <div className="mt-1 text-xs flex items-center">
              <span className={`inline-block w-2 h-2 rounded-full mr-1 ${connectionStatus ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
              <span className="text-gray-400">{connectionStatus ? 'Live updates' : 'Connecting...'}</span>
            </div>
          </div>
          
          {/* News Carousel */}
          <div className="mb-8">
            <NewsCarousel items={newsItems} />
          </div>
          
          {/* Sentiment Gauges Grid */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Market Sentiment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {marketData.slice(0, 4).map((asset) => (
                <div key={asset.symbol} className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4">
                  <SentimentGauge 
                    asset={asset.symbol} 
                    score={asset.sentiment} 
                    size="md"
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Market Overview */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Market Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {marketData.map((asset) => (
                <PriceChart
                  key={asset.symbol}
                  symbol={asset.symbol}
                  data={asset.data}
                  change={asset.change}
                />
              ))}
            </div>
          </div>
          
          {/* Market Table */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Asset Detail</h2>
            <Card>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-900">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Symbol</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Sentiment</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {marketData.map((asset) => (
                      <motion.tr 
                        key={asset.symbol} 
                        className="hover:bg-gray-700/50 transition-colors"
                        animate={{ opacity: 1 }}
                        initial={{ opacity: 0.8 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-accent">{asset.symbol}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{asset.name}</td>
                        <AnimatedTableCell 
                          isUpdated={wasRecentlyUpdated(asset.symbol)}
                        >
                          <span className={`inline-block px-2 py-1 rounded text-xs ${asset.sentiment > 0 ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'}`}>
                            {asset.sentiment.toFixed(2)}
                          </span>
                        </AnimatedTableCell>
                        <AnimatedTableCell 
                          isUpdated={wasRecentlyUpdated(asset.symbol)}
                          className="text-gray-300"
                        >
                          {asset.symbol.includes('/') ? asset.price.toFixed(4) : '$' + asset.price.toFixed(2)}
                        </AnimatedTableCell>
                        <AnimatedTableCell
                          isUpdated={wasRecentlyUpdated(asset.symbol)}
                          className={asset.change > 0 ? 'text-green-400' : 'text-red-400'}
                        >
                          {asset.change > 0 ? '+' : ''}{asset.change.toFixed(2)}%
                        </AnimatedTableCell>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </Container>
      </div>
    </>
  );
} 