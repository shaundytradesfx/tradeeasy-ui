import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
  gradientBorder?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hoverEffect = false,
  gradientBorder = false 
}) => {
  const baseClasses = "bg-gray-800 rounded-lg overflow-hidden shadow-lg";
  const hoverClasses = hoverEffect ? "transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px]" : "";
  const borderClasses = gradientBorder 
    ? "p-[1px] bg-gradient-to-r from-purple-600 via-accent to-blue-500" 
    : "";
  
  return (
    <div className={`${borderClasses} rounded-lg ${className}`}>
      <div className={`${baseClasses} ${hoverClasses} ${gradientBorder ? 'p-4' : 'p-5'}`}>
        {children}
      </div>
    </div>
  );
};

export default Card; 