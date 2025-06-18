import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "./";
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

interface NewsItem {
  id: number;
  title: string;
  source: string;
  date: string;
  sentiment: number;
  image?: string;
}

interface NewsCarouselProps {
  items: NewsItem[];
  className?: string;
}

const NewsCarousel: React.FC<NewsCarouselProps> = ({
  items,
  className,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [items.length]);
  
  // Manual scroll
  const handleNext = () => {
    setActiveIndex((current) => (current + 1) % items.length);
  };
  
  const handlePrev = () => {
    setActiveIndex((current) => (current - 1 + items.length) % items.length);
  };
  
  // Function to get sentiment color based on score
  const getSentimentColor = (score: number) => {
    if (score < -0.5) return "bg-red-600 text-red-100";
    if (score < 0) return "bg-red-400 text-red-100";
    if (score === 0) return "bg-gray-400 text-gray-100";
    if (score < 0.5) return "bg-green-400 text-green-100";
    return "bg-green-600 text-green-100";
  };

  // Function to get sentiment description
  const getSentimentDescription = (score: number) => {
    if (score < -0.5) return "Strongly Bearish";
    if (score < 0) return "Moderately Bearish";
    if (score === 0) return "Neutral";
    if (score < 0.5) return "Moderately Bullish";
    return "Strongly Bullish";
  };
  
  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-gray-900 border border-gray-700", className)}>
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-100">Latest News</h3>
          <Tooltip
            content={
              <div className="max-w-xs">
                <p className="font-medium mb-1">Market News & Sentiment</p>
                <ul className="text-sm space-y-1">
                  <li>• Latest news affecting market sentiment</li>
                  <li>• Auto-scrolls every 5 seconds</li>
                  <li>• Sentiment scores range from -1 (bearish) to +1 (bullish)</li>
                </ul>
              </div>
            }
            position="right"
          >
            <QuestionMarkCircleIcon className="w-5 h-5 text-gray-400 hover:text-gray-300 cursor-help" />
          </Tooltip>
        </div>
        
        {/* Navigation buttons */}
        <div className="flex space-x-2">
          <Tooltip content="Previous news" position="top">
            <button 
              onClick={handlePrev}
              className="p-1 rounded-full bg-gray-800 hover:bg-gray-700 transition"
              aria-label="Previous news"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </Tooltip>
          <Tooltip content="Next news" position="top">
            <button 
              onClick={handleNext}
              className="p-1 rounded-full bg-gray-800 hover:bg-gray-700 transition"
              aria-label="Next news"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </Tooltip>
        </div>
      </div>
      
      {/* Carousel container */}
      <div 
        ref={containerRef} 
        className="relative overflow-hidden w-full"
      >
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeIndex}
            className="flex p-4 space-x-4 overflow-x-auto scrollbar-hide"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {items.map((item) => (
              <div
                key={item.id}
                className="flex-shrink-0 w-64 bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-gray-600 transition"
              >
                {item.image && (
                  <div className="h-32 w-full overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <Tooltip content="News source" position="top">
                      <span className="text-xs text-gray-400">{item.source}</span>
                    </Tooltip>
                    <Tooltip 
                      content={`Market sentiment: ${getSentimentDescription(item.sentiment)}`}
                      position="top"
                    >
                      <span className={cn("text-xs px-2 py-0.5 rounded cursor-help", getSentimentColor(item.sentiment))}>
                        {item.sentiment.toFixed(2)}
                      </span>
                    </Tooltip>
                  </div>
                  <Tooltip content="Click to read full article" position="top">
                    <h4 className="text-sm font-medium text-gray-200 line-clamp-2 h-10 hover:text-accent cursor-pointer">
                      {item.title}
                    </h4>
                  </Tooltip>
                  <Tooltip content="Publication date" position="bottom">
                    <div className="mt-2 text-xs text-gray-400">
                      {item.date}
                    </div>
                  </Tooltip>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
        
        {/* Dots indicator */}
        <div className="flex justify-center p-2 space-x-1">
          {items.map((_, index) => (
            <Tooltip key={index} content={`Go to news ${index + 1}`} position="bottom">
              <button
                className={cn("h-1.5 rounded-full transition-all", {
                  "w-4 bg-accent": index === activeIndex,
                  "w-1.5 bg-gray-600": index !== activeIndex,
                })}
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to news ${index + 1}`}
              />
            </Tooltip>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsCarousel; 