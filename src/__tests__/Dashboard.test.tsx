import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../pages/dashboard';

// Mock the UI components
jest.mock('@/components/ui', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  Container: ({ children }: { children: React.ReactNode }) => (
    <div className="w-full mx-auto px-4 sm:px-6 max-w-screen-xl">{children}</div>
  ),
  SentimentGauge: ({ asset, score }: { asset: string; score: number }) => (
    <div data-testid={`sentiment-gauge-${asset}`}>
      Score: {score}
    </div>
  ),
  PriceChart: ({ data }: { data: any[] }) => (
    <div data-testid="price-chart">Chart with {data.length} points</div>
  ),
  NewsCarousel: ({ items }: { items: any[] }) => (
    <div data-testid="news-carousel">
      {items.map((item, index) => (
        <div key={item.id} data-testid={`news-item-${index}`}>
          {item.title}
        </div>
      ))}
    </div>
  ),
}));

// Mock the realtime utility
jest.mock('@/utils/realtime', () => ({
  initRealTimeUpdates: jest.fn(),
  subscribeSentiment: jest.fn(() => jest.fn()), // Returns unsubscribe function
  simulateSentimentUpdate: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock the watchlist utility
jest.mock('@/utils/watchlist', () => ({
  mockAssetData: [],
}));

// Mock Next.js Head component
jest.mock('next/head', () => {
  return function Head({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  };
});

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the dashboard title and description', () => {
      render(<Dashboard />);
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Real-time sentiment analytics for financial markets')).toBeInTheDocument();
    });

    it('should render connection status indicator', () => {
      render(<Dashboard />);
      
      expect(screen.getByText('Connecting...')).toBeInTheDocument();
    });

    it('should render news carousel', () => {
      render(<Dashboard />);
      
      expect(screen.getByTestId('news-carousel')).toBeInTheDocument();
    });

    it('should render sentiment gauges for top assets', () => {
      render(<Dashboard />);
      
      expect(screen.getByTestId('sentiment-gauge-AAPL')).toBeInTheDocument();
      expect(screen.getByTestId('sentiment-gauge-EUR/USD')).toBeInTheDocument();
      expect(screen.getByTestId('sentiment-gauge-BTC')).toBeInTheDocument();
      expect(screen.getByTestId('sentiment-gauge-GOLD')).toBeInTheDocument();
    });

    it('should render market overview section', () => {
      render(<Dashboard />);
      
      expect(screen.getByText('Market Overview')).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    it('should display asset information in market overview', () => {
      render(<Dashboard />);
      
      // Check for asset symbols
      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('BTC')).toBeInTheDocument();
      expect(screen.getByText('GOLD')).toBeInTheDocument();
    });

    it('should display news items with correct titles', () => {
      render(<Dashboard />);
      
      expect(screen.getByText('Fed Expected to Maintain Interest Rates at Next Meeting')).toBeInTheDocument();
      expect(screen.getByText('Tech Stocks Rally on Strong Earnings Reports')).toBeInTheDocument();
      expect(screen.getByText('Oil Prices Drop Amid Global Demand Concerns')).toBeInTheDocument();
      expect(screen.getByText('New Trade Agreement Boosts Market Confidence')).toBeInTheDocument();
    });

    it('should display sentiment scores in gauges', () => {
      render(<Dashboard />);
      
      expect(screen.getByText('Score: 0.65')).toBeInTheDocument(); // AAPL
      expect(screen.getByText('Score: 0.12')).toBeInTheDocument(); // EUR/USD
      expect(screen.getByText('Score: -0.24')).toBeInTheDocument(); // BTC
      expect(screen.getByText('Score: 0.48')).toBeInTheDocument(); // GOLD
    });
  });

  describe('Real-time Updates', () => {
    it('should initialize real-time updates on mount', () => {
      const { initRealTimeUpdates, subscribeSentiment } = require('@/utils/realtime');
      
      render(<Dashboard />);
      
      expect(initRealTimeUpdates).toHaveBeenCalled();
      expect(subscribeSentiment).toHaveBeenCalled();
    });

    it('should clean up real-time connections on unmount', () => {
      const { disconnect } = require('@/utils/realtime');
      const unsubscribeMock = jest.fn();
      const { subscribeSentiment } = require('@/utils/realtime');
      subscribeSentiment.mockReturnValue(unsubscribeMock);
      
      const { unmount } = render(<Dashboard />);
      unmount();
      
      expect(unsubscribeMock).toHaveBeenCalled();
      expect(disconnect).toHaveBeenCalled();
    });

    it('should simulate sentiment updates in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      
      // Mock NODE_ENV as development
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
        configurable: true
      });
      
      const { simulateSentimentUpdate } = require('@/utils/realtime');
      
      render(<Dashboard />);
      
      // Fast-forward timers to trigger simulation
      jest.advanceTimersByTime(1000);
      
      expect(simulateSentimentUpdate).toHaveBeenCalledWith('AAPL');
      
      // Restore original NODE_ENV
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
        configurable: true
      });
    });
  });

  describe('Responsive Design', () => {
    it('should render responsive grid layout', () => {
      render(<Dashboard />);
      
      const sentimentSection = screen.getByText('Market Sentiment').parentElement;
      const grid = sentimentSection?.querySelector('.grid');
      
      expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<Dashboard />);
      
      expect(screen.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Market Sentiment' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Market Overview' })).toBeInTheDocument();
    });

    it('should have descriptive text for connection status', () => {
      render(<Dashboard />);
      
      expect(screen.getByText('Connecting...')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render without performance issues', () => {
      const startTime = performance.now();
      render(<Dashboard />);
      const endTime = performance.now();
      
      // Should render within reasonable time (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
}); 