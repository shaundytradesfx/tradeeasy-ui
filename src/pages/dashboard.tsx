import React from 'react';
import Head from 'next/head';
import { Card, Container } from '@/components/ui';

const SentimentGauge = ({ asset, score }: { asset: string; score: number }) => {
  // Calculate color based on sentiment score (-1 to 1 range)
  const getColor = () => {
    if (score < -0.5) return 'bg-red-600';
    if (score < 0) return 'bg-red-400';
    if (score === 0) return 'bg-gray-400';
    if (score < 0.5) return 'bg-green-400';
    return 'bg-green-600';
  };

  // Calculate angle for gauge needle (from -45deg to 45deg)
  const angle = score * 45;

  return (
    <Card hoverEffect>
      <h3 className="text-center text-lg font-medium mb-2">{asset}</h3>
      <div className="relative w-32 h-16 mx-auto">
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gray-700 rounded-t-full overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-r from-red-600 via-yellow-400 to-green-600"></div>
        </div>
        <div 
          className="absolute bottom-0 left-1/2 w-1 h-8 bg-white origin-bottom"
          style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
        ></div>
        <div className="absolute bottom-0 left-1/2 w-3 h-3 rounded-full bg-white transform -translate-x-1/2 translate-y-1/2"></div>
      </div>
      <div className="text-center mt-2">
        <span className={`inline-block px-2 py-1 rounded text-xs ${getColor()}`}>
          {score.toFixed(2)}
        </span>
      </div>
    </Card>
  );
};

const MarketTable = () => {
  const assets = [
    { symbol: 'AAPL', name: 'Apple Inc.', sentiment: 0.65, price: 178.72, change: 1.25 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', sentiment: 0.42, price: 417.88, change: -0.42 },
    { symbol: 'GOOG', name: 'Alphabet Inc.', sentiment: -0.12, price: 175.53, change: -1.07 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', sentiment: 0.28, price: 182.41, change: 0.63 },
    { symbol: 'TSLA', name: 'Tesla Inc.', sentiment: -0.56, price: 175.21, change: -2.34 },
  ];

  return (
    <Card>
      <div className="overflow-hidden">
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
            {assets.map((asset) => (
              <tr key={asset.symbol} className="hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-accent">{asset.symbol}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{asset.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`inline-block px-2 py-1 rounded ${asset.sentiment > 0 ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
                    {asset.sentiment.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${asset.price}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${asset.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {asset.change > 0 ? '+' : ''}{asset.change}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

const NewsCarousel = () => {
  const news = [
    { id: 1, title: 'Fed Expected to Maintain Interest Rates at Next Meeting', sentiment: 0.15 },
    { id: 2, title: 'Tech Stocks Rally on Strong Earnings Reports', sentiment: 0.72 },
    { id: 3, title: 'Oil Prices Drop Amid Global Demand Concerns', sentiment: -0.48 },
    { id: 4, title: 'New Trade Agreement Boosts Market Confidence', sentiment: 0.64 },
  ];

  return (
    <Card>
      <h3 className="text-xl font-semibold mb-4">Latest News</h3>
      <div className="space-y-4">
        {news.map((item) => (
          <div key={item.id} className="p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition">
            <div className="flex justify-between items-center">
              <h4 className="text-sm md:text-base">{item.title}</h4>
              <span className={`ml-2 px-2 py-1 rounded text-xs ${item.sentiment > 0 ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
                {item.sentiment.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default function Dashboard() {
  return (
    <>
      <Head>
        <title>Dashboard | TradeEasy</title>
      </Head>
      
      <Container>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-400">Real-time sentiment analytics for financial markets</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <SentimentGauge asset="AAPL" score={0.65} />
          <SentimentGauge asset="BTC" score={-0.24} />
          <SentimentGauge asset="EUR/USD" score={0.12} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <MarketTable />
          </div>
          <div className="lg:col-span-1">
            <NewsCarousel />
          </div>
        </div>
      </Container>
    </>
  );
} 