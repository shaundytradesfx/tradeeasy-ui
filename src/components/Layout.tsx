import React, { ReactNode, useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import ConnectionStatus from './ConnectionStatus';
import { initRealTimeUpdates } from '@/utils/realtime';

type LayoutProps = {
  children: ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  useEffect(() => {
    // Initialize real-time updates when the layout loads
    // This ensures WebSocket connects as soon as possible
    initRealTimeUpdates();
    
    // No cleanup needed here since the Layout component
    // is always mounted for the lifecycle of the app
  }, []);
  
  return (
    <div className="min-h-screen bg-bg text-white">
      <Navbar />
      <Sidebar />
      <main className="pt-16 md:pl-64 min-h-screen">
        <div className="container mx-auto p-4">
          {children}
        </div>
      </main>
      <ConnectionStatus />
    </div>
  );
};

export default Layout; 