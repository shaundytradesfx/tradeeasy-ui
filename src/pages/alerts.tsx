import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Button, Tooltip } from '@/components/ui';
import { cn } from '@/utils/cn';
import toast, { Toaster } from 'react-hot-toast';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import {
  Alert,
  loadAlerts,
  saveAlerts,
  createAlert,
  markAlertAsRead,
  getAvailableAssets,
  generateSampleAlert
} from '@/utils/alerts';
import { motion, AnimatePresence } from 'framer-motion';
import { initRealTimeUpdates, subscribeAlerts, disconnect } from '@/utils/realtime';

const AlertForm = ({ onCreateAlert }: { 
  onCreateAlert: (asset: string, threshold: number, direction: 'above' | 'below') => void 
}) => {
  const [asset, setAsset] = useState('');
  const [threshold, setThreshold] = useState('');
  const [direction, setDirection] = useState<'above' | 'below'>('above');
  const [availableAssets, setAvailableAssets] = useState<{ symbol: string; name: string }[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  useEffect(() => {
    // Load available assets for the dropdown
    setAvailableAssets(getAvailableAssets());
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (asset && !isNaN(Number(threshold))) {
      onCreateAlert(asset, Number(threshold), direction);
      setAsset('');
      setThreshold('');
      setDirection('above');
    } else {
      toast.error('Please fill in all fields correctly');
    }
  };
  
  return (
    <div className="mb-8 bg-gray-800/50 backdrop-blur-lg border border-gray-700 p-6 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-medium">Create Alert</h3>
        <Tooltip
          content={
            <div className="max-w-xs">
              <p className="font-medium mb-1">Setting Up Sentiment Alerts</p>
              <ul className="text-sm space-y-1">
                <li>• Choose an asset to monitor</li>
                <li>• Set a sentiment threshold (-1 to +1)</li>
                <li>• Select if you want alerts when sentiment goes above or below the threshold</li>
              </ul>
            </div>
          }
          position="left"
        >
          <QuestionMarkCircleIcon className="w-5 h-5 text-gray-400 hover:text-gray-300 cursor-help" />
        </Tooltip>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <label className="block text-sm font-medium text-gray-300">Asset</label>
              <Tooltip content="Select the asset you want to track sentiment for" position="top">
                <QuestionMarkCircleIcon className="w-4 h-4 text-gray-500" />
              </Tooltip>
            </div>
            <div className="relative">
              <div 
                className="w-full px-4 py-2.5 rounded-md bg-gray-900 border border-gray-700 focus:border-accent cursor-pointer flex items-center justify-between"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className={asset ? 'text-white' : 'text-gray-500'}>
                  {asset ? `${asset} - ${availableAssets.find(a => a.symbol === asset)?.name}` : 'Select an asset'}
                </span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              {isDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md bg-gray-900 border border-gray-700 shadow-lg">
                  {availableAssets.map((assetOption) => (
                    <div
                      key={assetOption.symbol}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-800 transition-colors"
                      onClick={() => {
                        setAsset(assetOption.symbol);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <div className="font-medium">{assetOption.symbol}</div>
                      <div className="text-sm text-gray-400">{assetOption.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <label className="block text-sm font-medium text-gray-300">Threshold</label>
              <Tooltip 
                content="Set the sentiment score that will trigger the alert. -1 is extremely bearish, +1 is extremely bullish" 
                position="top"
              >
                <QuestionMarkCircleIcon className="w-4 h-4 text-gray-500" />
              </Tooltip>
            </div>
            <input
              type="number"
              step="0.01"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder="Sentiment score (e.g., 0.5)"
              className="w-full px-4 py-2.5 rounded-md bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent placeholder-gray-500"
            />
            <p className="text-xs text-gray-400">
              Enter a value between -1.0 and 1.0
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <label className="block text-sm font-medium text-gray-300">Direction</label>
              <Tooltip 
                content="Choose whether to be alerted when sentiment rises above or falls below your threshold" 
                position="top"
              >
                <QuestionMarkCircleIcon className="w-4 h-4 text-gray-500" />
              </Tooltip>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Tooltip content="Alert when sentiment exceeds threshold" position="bottom">
                <button
                  type="button"
                  className={cn(
                    "py-2.5 rounded-md transition-colors",
                    direction === 'above'
                      ? "bg-accent text-white"
                      : "bg-gray-900 border border-gray-700 hover:border-accent"
                  )}
                  onClick={() => setDirection('above')}
                >
                  Above
                </button>
              </Tooltip>
              <Tooltip content="Alert when sentiment falls below threshold" position="bottom">
                <button
                  type="button"
                  className={cn(
                    "py-2.5 rounded-md transition-colors",
                    direction === 'below'
                      ? "bg-accent text-white"
                      : "bg-gray-900 border border-gray-700 hover:border-accent"
                  )}
                  onClick={() => setDirection('below')}
                >
                  Below
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
        
        <Button
          type="submit"
          variant="shimmer"
          className="w-full md:w-auto mt-4"
        >
          Create Alert
        </Button>
      </form>
    </div>
  );
};

const AlertLog = ({ alerts, onMarkAsRead }: { 
  alerts: Alert[], 
  onMarkAsRead: (id: number) => void 
}) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl shadow-lg overflow-hidden">
      <div className="p-5 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-medium">Alert History</h3>
          <Tooltip
            content={
              <div className="max-w-xs">
                <p className="font-medium mb-1">Understanding Alert History</p>
                <ul className="text-sm space-y-1">
                  <li>• Unread alerts are highlighted</li>
                  <li>• Click "Mark as read" to acknowledge alerts</li>
                  <li>• Alerts are sorted by most recent first</li>
                </ul>
              </div>
            }
            position="right"
          >
            <QuestionMarkCircleIcon className="w-5 h-5 text-gray-400 hover:text-gray-300 cursor-help" />
          </Tooltip>
        </div>
        <Tooltip content="Number of alerts waiting for your attention" position="left">
          <span className="bg-gray-700 text-xs text-gray-300 px-2 py-1 rounded-full">
            {alerts.filter(a => !a.read).length} unread
          </span>
        </Tooltip>
      </div>
      
      {alerts.length > 0 ? (
        <div className="divide-y divide-gray-700/50">
          <AnimatePresence initial={false}>
            {alerts.map((alert) => (
              <motion.div 
                key={alert.id} 
                className={`p-5 transition ${alert.read ? 'bg-gray-800/30' : 'bg-gray-700/30'}`}
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 120 }}
                layout
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Tooltip content="Click to view asset details" position="top">
                        <h4 className="font-medium text-lg hover:text-accent cursor-pointer">
                          {alert.asset}
                        </h4>
                      </Tooltip>
                      <span className="text-sm text-gray-400">
                        {alert.assetName}
                      </span>
                    </div>
                    <Tooltip 
                      content={`Alert triggered when sentiment went ${alert.direction} ${alert.threshold.toFixed(2)}`} 
                      position="right"
                    >
                      <p className="text-sm text-gray-300">
                        Sentiment {alert.direction === 'above' ? 'above' : 'below'} <span className="font-mono">{alert.threshold.toFixed(2)}</span>
                      </p>
                    </Tooltip>
                    <Tooltip content="Alert trigger time" position="bottom">
                      <p className="text-xs text-gray-400 mt-1">
                        Triggered at {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </Tooltip>
                  </div>
                  
                  {!alert.read && (
                    <Tooltip content="Click to acknowledge this alert" position="left">
                      <Button
                        onClick={() => onMarkAsRead(alert.id)}
                        variant="outline"
                        size="sm"
                        className="self-start md:self-center whitespace-nowrap"
                      >
                        Mark as read
                      </Button>
                    </Tooltip>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="py-12 text-center text-gray-400">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-12 w-12 mx-auto mb-4 text-gray-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
            />
          </svg>
          <p className="text-lg">No alerts have been triggered yet</p>
          <p className="text-sm mt-1">Create an alert above to get started</p>
        </div>
      )}
    </div>
  );
};

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [connectionStatus, setConnectionStatus] = useState(false);
  
  useEffect(() => {
    // Load alerts from localStorage on component mount
    setAlerts(loadAlerts());
    
    // Initialize real-time updates
    initRealTimeUpdates();
    
    // Subscribe to real-time alert updates
    const unsubscribe = subscribeAlerts((newAlert: Alert) => {
      // Check if this alert already exists by ID
      setAlerts(prevAlerts => {
        const exists = prevAlerts.some(alert => alert.id === newAlert.id);
        if (exists) return prevAlerts;
        
        // Add the new alert to the top of the list
        const updatedAlerts = [newAlert, ...prevAlerts];
        
        // Save to localStorage
        saveAlerts(updatedAlerts);
        
        // Show notification
        toast.success(`New alert triggered for ${newAlert.asset}!`, {
          icon: '🔔',
          duration: 5000
        });
        
        return updatedAlerts;
      });
      
      // Update connection status
      setConnectionStatus(true);
    });
    
    // Cleanup function
    return () => {
      unsubscribe();
      disconnect();
    };
  }, []);
  
  const handleCreateAlert = (asset: string, threshold: number, direction: 'above' | 'below') => {
    const result = createAlert(asset, threshold, direction);
    
    if (result.success && result.alert) {
      // Add the new alert to state
      setAlerts(prev => [result.alert!, ...prev]);
      
      // Show success notification
      toast.success(result.message);
      
      // The simulator in the real-time utility will now handle triggering alerts
    } else {
      // Show error notification
      toast.error(result.message);
    }
  };
  
  const handleMarkAsRead = (id: number) => {
    const result = markAlertAsRead(id);
    
    if (result.success) {
      // Update alert in state
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === id ? { ...alert, read: true } : alert
        )
      );
      
      // Show success notification
      toast.success(result.message);
    } else {
      // Show error notification
      toast.error(result.message);
    }
  };
  
  return (
    <>
      <Head>
        <title>Alerts | TradeEasy</title>
      </Head>
      
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Alerts</h1>
        <p className="text-gray-400 mt-1">Get notified when sentiment crosses your thresholds</p>
        <div className="mt-1 text-xs flex items-center">
          <span className={`inline-block w-2 h-2 rounded-full mr-1 ${connectionStatus ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
          <span className="text-gray-400">{connectionStatus ? 'Live updates' : 'Connecting...'}</span>
        </div>
      </div>
      
      <AlertForm onCreateAlert={handleCreateAlert} />
      
      <AlertLog alerts={alerts} onMarkAsRead={handleMarkAsRead} />
    </>
  );
} 