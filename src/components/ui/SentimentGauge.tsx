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
  
  // Calculate color based on sentiment score (-1 to 1 range) with improved gradients
  const getColor = () => {
    if (score < -0.5) return "from-red-500 via-red-400 to-red-300";
    if (score < 0) return "from-orange-500 via-orange-400 to-yellow-400";
    if (score === 0) return "from-slate-400 via-slate-300 to-slate-200";
    if (score < 0.5) return "from-emerald-400 via-green-400 to-green-300";
    return "from-green-500 via-emerald-400 to-green-300";
  };

  // Get background glow color
  const getGlowColor = () => {
    if (score < -0.5) return "shadow-red-500/20";
    if (score < 0) return "shadow-orange-500/20";
    if (score === 0) return "shadow-slate-500/20";
    if (score < 0.5) return "shadow-green-500/20";
    return "shadow-emerald-500/20";
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
    <div className={cn("flex flex-col items-center group", className)}>
      <Tooltip 
        content={`${asset} Sentiment Score: ${score.toFixed(2)}`}
        position="top"
      >
        <h3 className="text-lg font-semibold mb-3 text-white/90 group-hover:text-white transition-colors duration-300">{asset}</h3>
      </Tooltip>
      
      <div className={cn("relative rounded-full transition-all duration-300 group-hover:scale-105", dimensions[size], getGlowColor(), "shadow-2xl")}>
        {/* Glassmorphism background with subtle gradient */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-sm border border-white/20 shadow-inner"></div>
        
        {/* Enhanced sentiment gradient track with improved colors */}
        <Tooltip
          content={
            <div className="text-center">
              <p className="font-medium mb-1">{getSentimentDescription()}</p>
              <p className="text-xs opacity-80">Score ranges from -1 (most bearish) to +1 (most bullish)</p>
            </div>
          }
          position="bottom"
        >
          <div className="absolute inset-[6px] rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-400 via-slate-300 to-emerald-500 opacity-80"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent"></div>
          </div>
        </Tooltip>
        
        {/* Modern center circle with glassmorphism */}
        <div className="absolute inset-[18%] rounded-full bg-gradient-to-br from-slate-800/90 via-slate-900/90 to-black/90 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-2xl">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent"></div>
          <Tooltip
            content="Current sentiment score"
            position="right"
          >
            <span className={cn("text-sm font-bold relative z-10 transition-colors duration-300", {
              "text-red-300 drop-shadow-[0_0_8px_rgba(248,113,113,0.6)]": score < 0,
              "text-slate-300 drop-shadow-[0_0_8px_rgba(148,163,184,0.6)]": score === 0,
              "text-emerald-300 drop-shadow-[0_0_8px_rgba(110,231,183,0.6)]": score > 0
            })}>
              {score.toFixed(2)}
            </span>
          </Tooltip>
        </div>
        
        {/* Enhanced needle with glow effect */}
        <motion.div 
          className="absolute top-1/2 left-1/2 h-[42%] w-1 bg-gradient-to-t from-white via-white/90 to-white/80 origin-bottom rounded-full shadow-lg"
          style={{ 
            transform: `translate(-50%, 0) rotate(${rotation}deg)`,
            transformOrigin: "bottom center",
            filter: "drop-shadow(0 0 4px rgba(255,255,255,0.8))"
          }}
          initial={{ rotate: 0 }}
          animate={{ rotate: rotation }}
          transition={{ type: "spring", bounce: 0.3, duration: 1.5 }}
        ></motion.div>
        
        {/* Enhanced pivot point with glow */}
        <div className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full bg-gradient-to-br from-white via-white/90 to-white/80 shadow-lg transform -translate-x-1/2 -translate-y-1/2 border border-white/30" 
             style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.8))" }}></div>
      </div>
      
      {/* Modern sentiment badge */}
      <Tooltip
        content={`Current market sentiment is ${getSentimentDescription().toLowerCase()}`}
        position="bottom"
      >
        <div className="mt-3 transition-all duration-300 group-hover:scale-105">
          <span className={cn("inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-sm transition-all duration-300", {
            "bg-gradient-to-r from-red-500/20 to-red-400/20 text-red-200 border-red-400/30 shadow-lg shadow-red-500/20": score < 0,
            "bg-gradient-to-r from-slate-500/20 to-slate-400/20 text-slate-200 border-slate-400/30 shadow-lg shadow-slate-500/20": score === 0,
            "bg-gradient-to-r from-emerald-500/20 to-green-400/20 text-emerald-200 border-emerald-400/30 shadow-lg shadow-emerald-500/20": score > 0
          })}>
            <div className={cn("w-2 h-2 rounded-full mr-2 animate-pulse", {
              "bg-red-400": score < 0,
              "bg-slate-400": score === 0,
              "bg-emerald-400": score > 0
            })}></div>
            {score > 0 ? "Bullish" : score < 0 ? "Bearish" : "Neutral"}
          </span>
        </div>
      </Tooltip>
    </div>
  );
};

export default SentimentGauge; 