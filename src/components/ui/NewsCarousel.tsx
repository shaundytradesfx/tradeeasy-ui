import React, { useState, useEffect } from "react";
import { cn } from "@/utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  ArrowTopRightOnSquareIcon, 
  CalendarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  MinusIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  sentiment: number;
  source: string;
  published_at: string;
  asset_mentions?: string[];
}

interface NewsCarouselProps {
  newsItems: NewsItem[];
  autoPlay?: boolean;
  interval?: number;
  className?: string;
}

const NewsCarousel: React.FC<NewsCarouselProps> = ({
  newsItems,
  autoPlay = true,
  interval = 5000,
  className,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (!isPlaying || newsItems.length <= 1) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prevIndex) => 
        prevIndex === newsItems.length - 1 ? 0 : prevIndex + 1
      );
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, interval, newsItems.length]);

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentIndex(currentIndex === 0 ? newsItems.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex(currentIndex === newsItems.length - 1 ? 0 : currentIndex + 1);
  };

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment > 0.1) return <ArrowTrendingUpIcon className="w-4 h-4" />;
    if (sentiment < -0.1) return <ArrowTrendingDownIcon className="w-4 h-4" />;
    return <MinusIcon className="w-4 h-4" />;
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.1) return "text-emerald-400 bg-emerald-500/20 border-emerald-500/30";
    if (sentiment < -0.1) return "text-red-400 bg-red-500/20 border-red-500/30";
    return "text-slate-400 bg-slate-500/20 border-slate-500/30";
  };

  const getSentimentGlow = (sentiment: number) => {
    if (sentiment > 0.1) return "shadow-emerald-500/20";
    if (sentiment < -0.1) return "shadow-red-500/20";
    return "shadow-slate-500/20";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!newsItems.length) {
    return (
      <div className="flex items-center justify-center h-64 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-white/10 backdrop-blur-sm">
        <p className="text-slate-400">No news items available</p>
      </div>
    );
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
      rotateY: direction > 0 ? 45 : -45,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
      rotateY: direction < 0 ? 45 : -45,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  return (
    <div className={cn("relative w-full", className)}>
      {/* Enhanced Header with modern styling */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-white to-slate-300 bg-clip-text text-transparent">
            Market News
          </h2>
          <div className="flex items-center space-x-1 text-xs text-slate-400">
            <ClockIcon className="w-3 h-3" />
            <span>Live Updates</span>
          </div>
        </div>
        
        {/* Enhanced Play/Pause Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="group relative p-2 rounded-xl bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-white/10 backdrop-blur-sm hover:from-slate-600/50 hover:to-slate-700/50 transition-all duration-300 hover:scale-105 shadow-lg"
        >
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="relative text-xs text-slate-300 font-medium">
            {isPlaying ? "Pause" : "Play"}
          </span>
        </button>
      </div>

      {/* Enhanced Carousel Container */}
      <div className="relative h-80 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/30 to-slate-900/30 border border-white/10 backdrop-blur-md shadow-2xl">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              scale: { duration: 0.3 },
              rotateY: { duration: 0.4 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                goToNext();
              } else if (swipe > swipeConfidenceThreshold) {
                goToPrevious();
              }
            }}
            className="absolute inset-0 p-6 cursor-grab active:cursor-grabbing"
          >
            <div className="h-full flex flex-col">
              {/* Enhanced News Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {/* Modern Sentiment Badge */}
                  <div className={cn(
                    "flex items-center space-x-1.5 px-3 py-1.5 rounded-full border backdrop-blur-sm shadow-lg transition-all duration-300",
                    getSentimentColor(newsItems[currentIndex].sentiment),
                    getSentimentGlow(newsItems[currentIndex].sentiment)
                  )}>
                    {getSentimentIcon(newsItems[currentIndex].sentiment)}
                    <span className="text-xs font-medium">
                      {newsItems[currentIndex].sentiment > 0.1 ? "Bullish" : 
                       newsItems[currentIndex].sentiment < -0.1 ? "Bearish" : "Neutral"}
                    </span>
                    <span className="text-xs opacity-75">
                      {newsItems[currentIndex].sentiment.toFixed(2)}
                    </span>
                  </div>
                  
                  {/* Enhanced Source and Date */}
                  <div className="flex items-center space-x-2 text-xs text-slate-400 min-w-0">
                    <span className="font-medium text-slate-300 truncate">
                      {newsItems[currentIndex].source}
                    </span>
                    <span className="text-slate-500">•</span>
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="w-3 h-3" />
                      <span>{formatDate(newsItems[currentIndex].published_at)}</span>
                    </div>
                  </div>
                </div>
                
                {/* External Link Button */}
                <button className="group p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 hover:scale-105 flex-shrink-0">
                  <ArrowTopRightOnSquareIcon className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors duration-300" />
                </button>
              </div>

              {/* Enhanced Title */}
              <h3 className="text-xl font-bold text-white mb-4 leading-tight line-clamp-2 hover:text-blue-200 transition-colors duration-300">
                {newsItems[currentIndex].title}
              </h3>

              {/* Enhanced Content */}
              <div className="flex-1 overflow-hidden">
                <p className="text-slate-300 text-sm leading-relaxed line-clamp-4 hover:text-slate-200 transition-colors duration-300">
                  {newsItems[currentIndex].content}
                </p>
              </div>

              {/* Enhanced Asset Mentions */}
              {newsItems[currentIndex].asset_mentions && newsItems[currentIndex].asset_mentions!.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs font-medium text-slate-400">Assets Mentioned:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newsItems[currentIndex].asset_mentions!.slice(0, 5).map((asset, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 text-xs font-medium bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-200 rounded-full border border-blue-500/30 backdrop-blur-sm hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300 cursor-pointer"
                      >
                        {asset}
                      </span>
                    ))}
                    {newsItems[currentIndex].asset_mentions!.length > 5 && (
                      <span className="px-2.5 py-1 text-xs text-slate-400 bg-slate-700/50 rounded-full border border-slate-600/50">
                        +{newsItems[currentIndex].asset_mentions!.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Enhanced Navigation Buttons */}
        {newsItems.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="group absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-gradient-to-br from-slate-700/80 to-slate-800/80 border border-white/20 backdrop-blur-sm hover:from-slate-600/80 hover:to-slate-700/80 transition-all duration-300 hover:scale-110 shadow-xl z-10"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <ChevronLeftIcon className="w-5 h-5 text-white relative z-10" />
            </button>
            <button
              onClick={goToNext}
              className="group absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-gradient-to-br from-slate-700/80 to-slate-800/80 border border-white/20 backdrop-blur-sm hover:from-slate-600/80 hover:to-slate-700/80 transition-all duration-300 hover:scale-110 shadow-xl z-10"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <ChevronRightIcon className="w-5 h-5 text-white relative z-10" />
            </button>
          </>
        )}
      </div>

      {/* Enhanced Progress Indicators */}
      {newsItems.length > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {newsItems.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className="group relative"
            >
              <div className={cn(
                "h-2 rounded-full transition-all duration-300 shadow-lg",
                index === currentIndex 
                  ? "w-8 bg-gradient-to-r from-blue-500 to-purple-600 shadow-blue-500/50" 
                  : "w-2 bg-slate-600 hover:bg-slate-500 group-hover:w-4"
              )}>
                {index === currentIndex && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-transparent animate-pulse"></div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsCarousel; 