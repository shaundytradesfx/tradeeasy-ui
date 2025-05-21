import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

type LayoutProps = {
  children: ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-bg text-white">
      <Navbar />
      <Sidebar />
      <main className="pt-16 md:pl-64 min-h-screen">
        <div className="container mx-auto p-4">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout; 