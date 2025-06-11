/**
 * Utility functions for managing alerts
 */

// Import mock asset data from watchlist utils
import { mockAssetData } from './watchlist';

// Type for alert items
export interface Alert {
  id: number;
  asset: string;
  assetName: string;
  threshold: number;
  direction: 'above' | 'below';
  timestamp: string;
  read: boolean;
}

// Local storage key
const ALERTS_STORAGE_KEY = 'tradeeasy_alerts';
const ALERTS_CONFIG_KEY = 'tradeeasy_alerts_config';

// Type for alert configuration
interface AlertConfig {
  alertIds: number[];
}

/**
 * Load alerts from localStorage
 */
export function loadAlerts(): Alert[] {
  if (typeof window === 'undefined') {
    return []; // Return empty array when running on server
  }
  
  try {
    const storedAlerts = localStorage.getItem(ALERTS_STORAGE_KEY);
    return storedAlerts ? JSON.parse(storedAlerts) : [];
  } catch (error) {
    console.error('Error loading alerts from localStorage:', error);
    return [];
  }
}

/**
 * Save alerts to localStorage
 */
export function saveAlerts(alerts: Alert[]): void {
  if (typeof window === 'undefined') {
    return; // Do nothing when running on server
  }
  
  try {
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
  } catch (error) {
    console.error('Error saving alerts to localStorage:', error);
  }
}

/**
 * Load alert configuration from localStorage
 */
export function loadAlertConfig(): AlertConfig {
  if (typeof window === 'undefined') {
    return { alertIds: [] };
  }
  
  try {
    const storedConfig = localStorage.getItem(ALERTS_CONFIG_KEY);
    return storedConfig ? JSON.parse(storedConfig) : { alertIds: [] };
  } catch (error) {
    console.error('Error loading alert config from localStorage:', error);
    return { alertIds: [] };
  }
}

/**
 * Save alert configuration to localStorage
 */
export function saveAlertConfig(config: AlertConfig): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(ALERTS_CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Error saving alert config to localStorage:', error);
  }
}

/**
 * Create a new alert
 */
export function createAlert(asset: string, threshold: number, direction: 'above' | 'below'): { success: boolean; message: string; alert?: Alert } {
  // Get asset data from mock data
  const assetData = mockAssetData[asset];
  if (!assetData) {
    return { 
      success: false, 
      message: `Asset ${asset} not found` 
    };
  }
  
  // Create new alert
  const newAlert: Alert = {
    id: Date.now(),
    asset,
    assetName: assetData.name,
    threshold,
    direction,
    timestamp: new Date().toISOString(),
    read: false
  };
  
  // Save to localStorage
  const alerts = loadAlerts();
  const updatedAlerts = [newAlert, ...alerts];
  saveAlerts(updatedAlerts);
  
  return { 
    success: true, 
    message: `Alert created for ${asset}`,
    alert: newAlert
  };
}

/**
 * Mark an alert as read
 */
export function markAlertAsRead(id: number): { success: boolean; message: string } {
  const alerts = loadAlerts();
  const alertToUpdate = alerts.find(alert => alert.id === id);
  
  if (!alertToUpdate) {
    return { 
      success: false, 
      message: 'Alert not found' 
    };
  }
  
  const updatedAlerts = alerts.map(alert => 
    alert.id === id ? { ...alert, read: true } : alert
  );
  
  saveAlerts(updatedAlerts);
  
  return { 
    success: true, 
    message: `Alert for ${alertToUpdate.asset} marked as read` 
  };
}

/**
 * Get all available assets for the dropdown
 * Returns an array of { symbol, name } objects
 */
export function getAvailableAssets(): { symbol: string; name: string }[] {
  return Object.entries(mockAssetData).map(([symbol, data]) => ({
    symbol,
    name: data.name
  }));
}

/**
 * Check if an alert would be triggered based on current sentiment
 * This is a simulation for demonstration purposes
 */
export function checkAlertTrigger(asset: string, threshold: number, direction: 'above' | 'below'): boolean {
  const assetData = mockAssetData[asset];
  if (!assetData) return false;
  
  const currentSentiment = assetData.sentiment;
  
  if (direction === 'above') {
    return currentSentiment > threshold;
  } else {
    return currentSentiment < threshold;
  }
}

/**
 * Generate a sample triggered alert for demonstration
 */
export function generateSampleAlert(asset: string, threshold: number, direction: 'above' | 'below'): Alert {
  const assetData = mockAssetData[asset];
  
  return {
    id: Date.now(),
    asset,
    assetName: assetData?.name || asset,
    threshold,
    direction,
    timestamp: new Date().toISOString(),
    read: false
  };
} 