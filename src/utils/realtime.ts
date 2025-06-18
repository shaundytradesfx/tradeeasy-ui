/**
 * Real-time updates utility
 * Provides WebSocket connection and polling fallback for sentiment data
 */

import { mockAssetData } from './watchlist';
import { Alert, generateSampleAlert } from './alerts';

// Define the base API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Types for sentiment updates
export interface SentimentUpdate {
  asset: string;
  score: number;
  timestamp: string;
}

// Types for alert updates
export interface AlertUpdate {
  id: number;
  asset: string;
  assetName: string;
  threshold: number;
  direction: 'above' | 'below';
  timestamp: string;
  read: boolean;
}

// Type for callback functions
type SentimentUpdateCallback = (update: SentimentUpdate) => void;
type AlertUpdateCallback = (alert: Alert) => void;

// WebSocket connection state
let socket: WebSocket | null = null;
let isConnected = false;
let reconnectAttempts = 0;
let reconnectTimeout: NodeJS.Timeout | null = null;
let pollingInterval: NodeJS.Timeout | null = null;
const maxReconnectAttempts = 5;
const reconnectBackoff = 1500; // Initial reconnect time in ms

// Subscribers
const sentimentSubscribers: SentimentUpdateCallback[] = [];
const alertSubscribers: AlertUpdateCallback[] = [];
type ConnectionStatusSubscriber = (status: boolean) => void;
const connectionStatusSubscribers: ConnectionStatusSubscriber[] = [];

// Track the last score for each asset to create more realistic changes
const lastScores: Record<string, number> = {};

function getLastScore(asset: string): number {
  if (lastScores[asset] === undefined) {
    // Initialize with a random value
    lastScores[asset] = Math.round((Math.random() * 2 - 1) * 100) / 100;
  }
  return lastScores[asset];
}

/**
 * Initialize the real-time connection
 */
export function initRealTimeUpdates(): void {
  if (socket) {
    return; // Already initialized
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsBase = apiUrl.replace(/^https?:/, wsProtocol).replace('/api', '');
  const wsUrl = `${wsBase}/ws/sentiment`;

  try {
    connectWebSocket(wsUrl);
  } catch (error) {
    console.error('Failed to initialize WebSocket:', error);
    startPolling();
  }

  // Start simulating updates for development purposes
  if (process.env.NODE_ENV === 'development') {
    simulateSentimentUpdates();
    simulateAlertTriggers();
  }
}

/**
 * Connect to WebSocket server
 */
function connectWebSocket(url: string): void {
  try {
    socket = new WebSocket(url);

    socket.onopen = () => {
      console.log('WebSocket connected');
      isConnected = true;
      reconnectAttempts = 0;
      updateConnectionStatus(true);
      
      // Clear polling if it was running as a fallback
      if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
      }
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Process different message types
        if (data.type === 'sentiment') {
          processSentimentUpdate(data.data);
        } else if (data.type === 'alert') {
          processAlertUpdate(data.data);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
      isConnected = false;
      updateConnectionStatus(false);
      
      // Attempt to reconnect with backoff
      if (reconnectAttempts < maxReconnectAttempts) {
        const backoffTime = reconnectBackoff * Math.pow(1.5, reconnectAttempts);
        reconnectTimeout = setTimeout(() => {
          reconnectAttempts++;
          connectWebSocket(url);
        }, backoffTime);
      } else {
        console.log('Max reconnect attempts reached, falling back to polling');
        startPolling();
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      socket?.close();
    };
  } catch (error) {
    console.error('Failed to connect WebSocket:', error);
    updateConnectionStatus(false);
    startPolling();
  }
}

/**
 * Start polling for updates as a fallback
 */
function startPolling(): void {
  if (pollingInterval) {
    return; // Already polling
  }

  console.log('Starting polling fallback');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  
  pollingInterval = setInterval(async () => {
    try {
      const response = await fetch(`${apiUrl}/sentiment/stream?since=${Date.now() - 10000}`);
      if (response.ok) {
        const data = await response.json();
        data.forEach((update: SentimentUpdate) => {
          processSentimentUpdate(update);
        });
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  }, 10000); // Poll every 10 seconds
}

/**
 * Process an update from either WebSocket or polling
 */
function processSentimentUpdate(update: SentimentUpdate): void {
  // Notify all subscribers
  sentimentSubscribers.forEach(callback => callback(update));
}

/**
 * Process an update from either WebSocket or polling
 */
function processAlertUpdate(update: AlertUpdate): void {
  // Notify all subscribers
  alertSubscribers.forEach(callback => callback(update));
}

/**
 * Simulate sentiment updates (for development purposes)
 */
function simulateSentimentUpdates(): void {
  const assets = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'BTC', 'ETH', 'EUR/USD', 'GBP/USD'];
  
  // Check if we're on an asset detail page
  let currentAsset = '';
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    const match = path.match(/\/asset\/([A-Za-z0-9\/]+)/);
    if (match && match[1]) {
      currentAsset = match[1].toUpperCase();
      console.log(`Real-time updates active for asset: ${currentAsset}`);
    }
  }
  
  setInterval(() => {
    // If on asset detail page, increase likelihood of updates for that asset
    let asset;
    if (currentAsset && Math.random() < 0.7) {
      // 70% chance to update the current asset when on an asset detail page
      asset = currentAsset;
    } else {
      // Otherwise pick a random asset
      asset = assets[Math.floor(Math.random() * assets.length)];
    }
    
    // Generate a random sentiment score between -1 and 1
    // Add some trend continuity - smaller changes are more likely
    const prevScore = getLastScore(asset);
    const change = (Math.random() * 0.2 - 0.1); // Change by -0.1 to 0.1
    const score = Math.max(-1, Math.min(1, prevScore + change));
    
    // Create update object
    const update: SentimentUpdate = {
      asset,
      score,
      timestamp: new Date().toISOString()
    };
    
    // Process the update
    processSentimentUpdate(update);
  }, 5000); // Every 5 seconds
}

/**
 * Simulate alert triggers (for development purposes)
 */
function simulateAlertTriggers(): void {
  const assets = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corp.' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'META', name: 'Meta Platforms Inc.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'EUR/USD', name: 'Euro/US Dollar' },
    { symbol: 'GBP/USD', name: 'British Pound/US Dollar' }
  ];
  
  setInterval(() => {
    // Only trigger occasionally (30% chance)
    if (Math.random() > 0.3) return;
    
    // Pick a random asset
    const asset = assets[Math.floor(Math.random() * assets.length)];
    
    // Generate a random threshold between -0.5 and 0.5
    const threshold = Math.round((Math.random() - 0.5) * 100) / 100;
    
    // Create alert object
    const alert: AlertUpdate = {
      id: Date.now(), // Use timestamp as ID
      asset: asset.symbol,
      assetName: asset.name,
      threshold,
      direction: Math.random() > 0.5 ? 'above' : 'below',
      timestamp: new Date().toISOString(),
      read: false
    };
    
    // Process the alert
    processAlertUpdate(alert);
  }, 15000); // Every 15 seconds
}

/**
 * Subscribe to sentiment updates
 */
export function subscribeSentiment(callback: SentimentUpdateCallback): () => void {
  sentimentSubscribers.push(callback);
  
  // Return unsubscribe function
  return () => {
    const index = sentimentSubscribers.indexOf(callback);
    if (index !== -1) {
      sentimentSubscribers.splice(index, 1);
    }
  };
}

/**
 * Subscribe to alert updates
 */
export function subscribeAlerts(callback: AlertUpdateCallback): () => void {
  alertSubscribers.push(callback);
  
  // Return unsubscribe function
  return () => {
    const index = alertSubscribers.indexOf(callback);
    if (index !== -1) {
      alertSubscribers.splice(index, 1);
    }
  };
}

/**
 * Simulate a sentiment update for testing (only in development)
 */
export function simulateSentimentUpdate(asset: string, score?: number): void {
  if (process.env.NODE_ENV !== 'development') return;
  
  const newScore = score !== undefined ? score : (Math.random() * 2 - 1); // -1 to 1
  
  const update: SentimentUpdate = {
    asset,
    timestamp: new Date().toISOString(),
    score: newScore
  };
  
  processSentimentUpdate(update);
}

/**
 * Subscribe to connection status updates
 */
export function subscribeConnectionStatus(callback: ConnectionStatusSubscriber): () => void {
  connectionStatusSubscribers.push(callback);
  
  // Initialize with current status
  callback(isConnected);
  
  // Return unsubscribe function
  return () => {
    const index = connectionStatusSubscribers.indexOf(callback);
    if (index !== -1) {
      connectionStatusSubscribers.splice(index, 1);
    }
  };
}

/**
 * Update connection status and notify subscribers
 */
function updateConnectionStatus(status: boolean): void {
  isConnected = status;
  connectionStatusSubscribers.forEach(subscriber => subscriber(status));
}

/**
 * Disconnect WebSocket
 */
export function disconnect(): void {
  if (socket) {
    socket.close();
    socket = null;
  }
  
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
  
  isConnected = false;
  updateConnectionStatus(false);
} 