import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: '-translate-x-1/2 -translate-y-full left-1/2 bottom-[calc(100%+5px)]',
    bottom: '-translate-x-1/2 translate-y-1 left-1/2 top-full',
    left: '-translate-x-full -translate-y-1/2 top-1/2 right-[calc(100%+5px)]',
    right: 'translate-x-1 -translate-y-1/2 top-1/2 left-full',
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className={cn(
              "absolute z-50 px-2 py-1 text-sm text-white bg-gray-900 rounded shadow-lg whitespace-nowrap",
              positionClasses[position],
              className
            )}
            role="tooltip"
          >
            {content}
            {/* Arrow */}
            <div
              className={cn(
                "absolute w-2 h-2 bg-gray-900 transform rotate-45",
                {
                  'bottom-[-4px] left-1/2 -translate-x-1/2': position === 'top',
                  'top-[-4px] left-1/2 -translate-x-1/2': position === 'bottom',
                  'right-[-4px] top-1/2 -translate-y-1/2': position === 'left',
                  'left-[-4px] top-1/2 -translate-y-1/2': position === 'right',
                }
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip; 