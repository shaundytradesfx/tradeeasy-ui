import React from 'react';
import Link from 'next/link';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';

interface AssetCategory {
  name: string;
  slug: string;
  icon: React.ReactNode;
  assets: string[];
}

const assetCategories: AssetCategory[] = [
  {
    name: 'Equities',
    slug: 'equities',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    assets: ['AAPL', 'MSFT', 'GOOG', 'AMZN', 'TSLA'],
  },
  {
    name: 'Crypto',
    slug: 'crypto',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
      </svg>
    ),
    assets: ['BTC', 'ETH', 'SOL', 'ADA', 'XRP'],
  },
  {
    name: 'FX',
    slug: 'fx',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 4a1 1 0 000 2 1 1 0 011 1v1H7a1 1 0 000 2h1v3a3 3 0 106 0v-1a1 1 0 10-2 0v1a1 1 0 11-2 0v-3h3a1 1 0 100-2h-3V7a3 3 0 00-3-3H7z" clipRule="evenodd" />
      </svg>
    ),
    assets: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CAD', 'AUD/USD'],
  },
  {
    name: 'Commodities',
    slug: 'commodities',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z" clipRule="evenodd" />
      </svg>
    ),
    assets: ['GOLD', 'SILVER', 'OIL', 'NGAS', 'COPPER'],
  },
];

const Sidebar: React.FC = () => {
  return (
    <aside className="fixed left-0 top-16 h-full w-64 bg-primary text-white shadow-lg hidden md:block overflow-y-auto pb-16">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Asset Categories</h2>
        
        <div className="space-y-1">
          {assetCategories.map((category) => (
            <div key={category.slug} className="mb-4">
              <div className="flex items-center space-x-2 text-gray-300 mb-2">
                {category.icon}
                <span className="font-medium">{category.name}</span>
              </div>
              
              <div className="ml-6 space-y-1">
                {category.assets.map((asset) => (
                  <Link href={`/asset/${asset}`} key={asset}>
                    <motion.div 
                      className="px-3 py-2 text-sm rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors cursor-pointer"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      {asset}
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-700">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Quick Links</h3>
          <div className="space-y-2">
            <Link href="/watchlist">
              <div className="flex items-center space-x-2 px-3 py-2 text-sm rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition-colors cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
                <span>My Watchlist</span>
              </div>
            </Link>
            
            <Link href="/alerts">
              <div className="flex items-center space-x-2 px-3 py-2 text-sm rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition-colors cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                <span>My Alerts</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Gradient decoration at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-primary to-transparent pointer-events-none"></div>
    </aside>
  );
};

export default Sidebar; 