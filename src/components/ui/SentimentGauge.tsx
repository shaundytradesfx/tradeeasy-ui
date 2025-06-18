import React from "react";
import { cn } from "@/utils/cn";
import { motion } from "framer-motion";
import { Tooltip } from "./";

interface SentimentGaugeProps {
  asset: string;
  score: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SentimentGauge: React.FC<SentimentGaugeProps> = ({
  asset,
  score,
  size = "md",
  className,
}) => {
  // Normalize score to 0-1 range for display purposes
  const normalizedScore = (score + 1) / 2;
  
  // Set size dimensions
  const dimensions = {
    sm: "w-24 h-24",
    md: "w-32 h-32",
    lg: "w-40 h-40",
  };
  
  // Calculate color based on sentiment score (-1 to 1 range)
  const getColor = () => {
    if (score < -0.5) return "from-red-600 to-red-500";
    if (score < 0) return "from-red-400 to-orange-400";
    if (score === 0) return "from-gray-400 to-gray-300";
    if (score < 0.5) return "from-green-400 to-green-300";
    return "from-green-600 to-green-500";
  };

  // Calculate rotation for gauge needle (from 0 to 180 degrees)
  const rotation = normalizedScore * 180;

  // Get sentiment description
  const getSentimentDescription = () => {
    if (score < -0.5) return "Strongly Bearish";
    if (score < 0) return "Moderately Bearish";
    if (score === 0) return "Neutral";
    if (score < 0.5) return "Moderately Bullish";
    return "Strongly Bullish";
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <Tooltip 
        content={`${asset} Sentiment Score: ${score.toFixed(2)}`}
        position="top"
      >
        <h3 className="text-lg font-medium mb-2 text-gray-100">{asset}</h3>
      </Tooltip>
      
      <div className={cn("relative rounded-full", dimensions[size])}>
        {/* Background circle */}
        <div className="absolute inset-0 rounded-full bg-gray-800 border border-gray-700"></div>
        
        {/* Sentiment gradient track */}
        <Tooltip
          content={
            <div className="text-center">
              <p className="font-medium mb-1">{getSentimentDescription()}</p>
              <p className="text-xs opacity-80">Score ranges from -1 (most bearish) to +1 (most bullish)</p>
            </div>
          }
          position="bottom"
        >
          <div className="absolute inset-[4px] rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-yellow-400 to-green-600"></div>
          </div>
        </Tooltip>
        
        {/* Center circle */}
        <div className="absolute inset-[20%] rounded-full bg-gray-900 flex items-center justify-center border border-gray-700 shadow-inner">
          <Tooltip
            content="Current sentiment score"
            position="right"
          >
            <span className={cn("text-sm font-semibold", {
              "text-red-400": score < 0,
              "text-gray-400": score === 0,
              "text-green-400": score > 0
            })}>
              {score.toFixed(2)}
            </span>
          </Tooltip>
        </div>
        
        {/* Needle */}
        <motion.div 
          className="absolute top-1/2 left-1/2 h-[42%] w-1 bg-white origin-bottom rounded-full"
          style={{ 
            transform: `translate(-50%, 0) rotate(${rotation}deg)`,
            transformOrigin: "bottom center"
          }}
          initial={{ rotate: 0 }}
          animate={{ rotate: rotation }}
          transition={{ type: "spring", bounce: 0.3, duration: 1.5 }}
        ></motion.div>
        
        {/* Pivot point */}
        <div className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full bg-white shadow-md transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
      
      {/* Asset price or additional info */}
      <Tooltip
        content={`Current market sentiment is ${getSentimentDescription().toLowerCase()}`}
        position="bottom"
      >
        <div className="mt-2 text-xs text-gray-300">
          <span className={cn("inline-block px-2 py-1 rounded", {
            "bg-red-900/30 text-red-300": score < 0,
            "bg-gray-700 text-gray-300": score === 0,
            "bg-green-900/30 text-green-300": score > 0
          })}>
            {score > 0 ? "Bullish" : score < 0 ? "Bearish" : "Neutral"}
          </span>
        </div>
      </Tooltip>
    </div>
  );
};

export default SentimentGauge; 