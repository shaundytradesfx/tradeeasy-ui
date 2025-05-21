import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { cn } from '@/utils/cn';

// Register required Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface SentimentDataPoint {
  timestamp: string;
  score: number;
}

interface SentimentChartProps {
  data: SentimentDataPoint[];
  assetSymbol: string;
  className?: string;
  height?: number;
  timespan?: 'day' | 'week' | 'month' | 'year';
}

const SentimentChart: React.FC<SentimentChartProps> = ({
  data,
  assetSymbol,
  className,
  height = 300,
  timespan = 'month',
}) => {
  const [activeTimespan, setActiveTimespan] = useState<'day' | 'week' | 'month' | 'year'>(timespan);
  
  // Filter data based on selected timespan
  const getFilteredData = () => {
    const now = new Date();
    let cutoffDate = new Date();
    
    switch(activeTimespan) {
      case 'day':
        cutoffDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return data.filter(item => new Date(item.timestamp) >= cutoffDate);
  };
  
  const filteredData = getFilteredData();
  
  // Format dates for chart labels
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    
    switch(activeTimespan) {
      case 'day':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case 'week':
        return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit' });
      case 'month':
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      case 'year':
        return date.toLocaleDateString([], { month: 'short', year: '2-digit' });
      default:
        return date.toLocaleDateString();
    }
  };
  
  // Calculate gradient color based on overall sentiment trend
  const getGradientColor = (ctx: any) => {
    if (!ctx) return null;
    
    const average = filteredData.reduce((sum, item) => sum + item.score, 0) / filteredData.length;
    let gradient;
    
    if (average > 0) {
      gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.6)');  // Green with alpha
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.1)');
    } else {
      gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.6)');   // Red with alpha
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0.1)');
    }
    
    return gradient;
  };
  
  // Chart.js config
  const chartData = {
    labels: filteredData.map(item => formatDate(item.timestamp)),
    datasets: [
      {
        label: 'Sentiment',
        data: filteredData.map(item => item.score),
        borderColor: filteredData.reduce((sum, item) => sum + item.score, 0) / filteredData.length > 0 
          ? 'rgb(16, 185, 129)' // Green
          : 'rgb(239, 68, 68)',  // Red
        backgroundColor: function(context: any) {
          return getGradientColor(context.chart.ctx);
        },
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'white',
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          callback: function(value: any) {
            return value.toFixed(2);
          }
        },
        suggestedMin: -1,
        suggestedMax: 1,
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(20, 20, 20, 0.9)',
        titleColor: 'rgba(255, 255, 255, 0.9)',
        bodyColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          title: function(tooltipItems: any) {
            const index = tooltipItems[0].dataIndex;
            return new Date(filteredData[index].timestamp).toLocaleString();
          },
          label: function(context: any) {
            return `Sentiment: ${context.raw.toFixed(2)}`;
          }
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    hover: {
      mode: 'nearest',
      intersect: true
    },
  };
  
  return (
    <div className={cn("bg-gray-800 rounded-lg p-4 shadow-lg", className)}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-medium">{assetSymbol} Sentiment History</h3>
        <div className="flex space-x-2 text-sm">
          <button 
            onClick={() => setActiveTimespan('day')}
            className={cn("px-3 py-1 rounded transition", 
              activeTimespan === 'day' 
                ? "bg-accent text-white" 
                : "bg-gray-700 hover:bg-gray-600 text-gray-300"
            )}
          >
            1D
          </button>
          <button 
            onClick={() => setActiveTimespan('week')}
            className={cn("px-3 py-1 rounded transition", 
              activeTimespan === 'week' 
                ? "bg-accent text-white" 
                : "bg-gray-700 hover:bg-gray-600 text-gray-300"
            )}
          >
            1W
          </button>
          <button 
            onClick={() => setActiveTimespan('month')}
            className={cn("px-3 py-1 rounded transition", 
              activeTimespan === 'month' 
                ? "bg-accent text-white" 
                : "bg-gray-700 hover:bg-gray-600 text-gray-300"
            )}
          >
            1M
          </button>
          <button 
            onClick={() => setActiveTimespan('year')}
            className={cn("px-3 py-1 rounded transition", 
              activeTimespan === 'year' 
                ? "bg-accent text-white" 
                : "bg-gray-700 hover:bg-gray-600 text-gray-300"
            )}
          >
            1Y
          </button>
        </div>
      </div>
      
      <div style={{ height: `${height}px` }} className="relative">
        {filteredData.length > 0 ? (
          <Line
            data={chartData}
            options={chartOptions as any}
            height={height}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-400">No sentiment data available for the selected time period</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SentimentChart; 