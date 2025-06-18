import React, { useEffect, useState } from 'react';
import Card from './Card';
import { Tooltip } from './';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

interface PriceChartProps {
  symbol: string;
  data: { time: string; value: number }[];
  change: number;
}

const PriceChart: React.FC<PriceChartProps> = ({ symbol, data, change }) => {
  // Find min and max values for scaling the chart
  const values = data.map(item => item.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue;
  
  // Scale chart to available height (100px)
  const getYPosition = (value: number): number => {
    if (range === 0) return 50; // Default middle position
    return 100 - ((value - minValue) / range * 80) - 10; // 10px padding top/bottom
  };
  
  // Generate path for the chart line
  const pathData = data.map((point, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = getYPosition(point.value);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
  
  // Generate path for the filled area
  const areaPath = `${pathData} L 100 100 L 0 100 Z`;
  
  // Determine color based on price change
  const color = change >= 0 ? '#10b981' : '#ef4444';
  const gradientId = `gradient-${symbol.replace('/', '-')}`;
  
  return (
    <Card>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div>
              <Tooltip content="Trading symbol" position="top">
                <h3 className="text-lg font-medium cursor-help">{symbol}</h3>
              </Tooltip>
              <Tooltip content="Current price" position="bottom">
                <p className="text-sm text-gray-400">
                  {data[data.length - 1]?.value.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: symbol.includes('/') ? 4 : 2,
                    maximumFractionDigits: symbol.includes('/') ? 4 : 2,
                  })}
                </p>
              </Tooltip>
            </div>
            <Tooltip
              content={
                <div className="max-w-xs">
                  <p className="font-medium mb-1">Price Chart</p>
                  <ul className="text-sm space-y-1">
                    <li>• Shows price movement over time</li>
                    <li>• Green indicates upward trend</li>
                    <li>• Red indicates downward trend</li>
                    <li>• Filled area shows price range</li>
                  </ul>
                </div>
              }
              position="right"
            >
              <QuestionMarkCircleIcon className="w-5 h-5 text-gray-400 hover:text-gray-300 cursor-help" />
            </Tooltip>
          </div>
          <Tooltip content={`Price change: ${change >= 0 ? 'Up' : 'Down'} ${Math.abs(change)}%`} position="left">
            <span className={`px-2 py-1 rounded text-sm cursor-help ${change >= 0 ? 'bg-green-900/40 text-green-300' : 'bg-red-900/40 text-red-300'}`}>
              {change >= 0 ? '+' : ''}{change}%
            </span>
          </Tooltip>
        </div>
        
        <div className="relative h-[100px] w-full">
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="0.5" />
                <stop offset="100%" stopColor={color} stopOpacity="0.1" />
              </linearGradient>
            </defs>
            
            {/* Area under the curve */}
            <path d={areaPath} fill={`url(#${gradientId})`} />
            
            {/* Line chart */}
            <path
              d={pathData}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Latest data point */}
            <circle
              cx="100"
              cy={getYPosition(data[data.length - 1]?.value)}
              r="3"
              fill={color}
            />
          </svg>
        </div>
      </div>
    </Card>
  );
};

export default PriceChart;