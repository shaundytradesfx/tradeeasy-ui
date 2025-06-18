import React, { useEffect, useState } from 'react';
import { subscribeConnectionStatus } from '@/utils/realtime';

const ConnectionStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  useEffect(() => {
    // Subscribe to connection status updates from the realtime utility
    const unsubscribe = subscribeConnectionStatus((status) => {
      setIsConnected(status);
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);
  
  return (
    <div 
      className="fixed bottom-4 right-4 z-50 flex items-center bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-full px-3 py-1.5 shadow-lg transition-all duration-200 hover:bg-gray-800"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
      <span className={`text-xs text-gray-300 transition-all duration-200 ${isHovered ? 'w-auto opacity-100' : 'w-0 opacity-0 -mr-3 overflow-hidden'}`}>
        {isConnected ? 'Live updates' : 'Connecting...'}
      </span>
    </div>
  );
};

export default ConnectionStatus; 