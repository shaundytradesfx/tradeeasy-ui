import React, { useState } from 'react';
import Head from 'next/head';

interface Alert {
  id: number;
  asset: string;
  threshold: number;
  direction: 'above' | 'below';
  timestamp: string;
  read: boolean;
}

const AlertForm = ({ onCreateAlert }: { 
  onCreateAlert: (asset: string, threshold: number, direction: 'above' | 'below') => void 
}) => {
  const [asset, setAsset] = useState('');
  const [threshold, setThreshold] = useState('');
  const [direction, setDirection] = useState<'above' | 'below'>('above');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (asset.trim() && !isNaN(Number(threshold))) {
      onCreateAlert(asset.trim().toUpperCase(), Number(threshold), direction);
      setAsset('');
      setThreshold('');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="mb-6 bg-gray-800 p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-3">Create Alert</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Asset Symbol</label>
          <input
            type="text"
            value={asset}
            onChange={(e) => setAsset(e.target.value)}
            placeholder="e.g., AAPL, BTC"
            className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Threshold</label>
          <input
            type="number"
            step="0.01"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            placeholder="Sentiment score (e.g., 0.5)"
            className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Direction</label>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as 'above' | 'below')}
            className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="above">Above</option>
            <option value="below">Below</option>
          </select>
        </div>
      </div>
      
      <button 
        type="submit"
        className="px-4 py-2 bg-accent text-white rounded-md hover:bg-opacity-90 transition"
      >
        Create Alert
      </button>
    </form>
  );
};

const AlertLog = ({ alerts, onMarkAsRead }: { 
  alerts: Alert[], 
  onMarkAsRead: (id: number) => void 
}) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-medium">Alert History</h3>
      </div>
      
      {alerts.length > 0 ? (
        <div className="divide-y divide-gray-700">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`p-4 transition ${alert.read ? 'bg-gray-800' : 'bg-gray-700'}`}
            >
              <div className="flex justify-between">
                <div>
                  <h4 className="font-medium">
                    {alert.asset} sentiment {alert.direction === 'above' ? 'above' : 'below'} {alert.threshold}
                  </h4>
                  <p className="text-sm text-gray-400">
                    Triggered at {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
                
                {!alert.read && (
                  <button
                    onClick={() => onMarkAsRead(alert.id)}
                    className="text-accent hover:text-opacity-80 text-sm"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-gray-400">
          No alerts have been triggered yet.
        </div>
      )}
    </div>
  );
};

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 1,
      asset: 'AAPL',
      threshold: 0.6,
      direction: 'above',
      timestamp: '2023-07-10T14:32:15Z',
      read: false
    },
    {
      id: 2,
      asset: 'TSLA',
      threshold: -0.4,
      direction: 'below',
      timestamp: '2023-07-09T09:17:22Z',
      read: true
    },
    {
      id: 3,
      asset: 'BTC',
      threshold: 0.3,
      direction: 'above',
      timestamp: '2023-07-08T22:05:47Z',
      read: true
    }
  ]);
  
  const handleCreateAlert = (asset: string, threshold: number, direction: 'above' | 'below') => {
    // In a real app, this would send a request to the backend
    alert(`Alert created for ${asset} sentiment ${direction} ${threshold}`);
    
    // For demonstration purposes, we'll simulate a triggered alert
    const newAlert: Alert = {
      id: Date.now(),
      asset,
      threshold,
      direction,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setAlerts(prev => [newAlert, ...prev]);
  };
  
  const handleMarkAsRead = (id: number) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === id ? { ...alert, read: true } : alert
      )
    );
  };
  
  return (
    <>
      <Head>
        <title>Alerts | TradeEasy</title>
      </Head>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Alerts</h1>
        <p className="text-gray-400">Get notified when sentiment crosses your thresholds</p>
      </div>
      
      <AlertForm onCreateAlert={handleCreateAlert} />
      
      <AlertLog alerts={alerts} onMarkAsRead={handleMarkAsRead} />
    </>
  );
} 