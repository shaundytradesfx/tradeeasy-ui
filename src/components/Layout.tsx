import React, { ReactNode } from 'react';

type LayoutProps = {
  children: ReactNode;
};

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full bg-primary text-white z-50 h-16 shadow-md">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-xl font-bold text-accent">TradeEasy</span>
        </div>
        <div className="hidden md:flex space-x-8">
          <a href="/dashboard" className="hover:text-accent transition">Dashboard</a>
          <a href="/search" className="hover:text-accent transition">Search</a>
          <a href="/watchlist" className="hover:text-accent transition">Watchlist</a>
          <a href="/alerts" className="hover:text-accent transition">Alerts</a>
        </div>
        <div className="md:hidden">
          <button className="text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-16 h-full w-64 bg-primary text-white shadow-lg hidden md:block">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Asset Categories</h2>
        <ul className="space-y-2">
          <li className="p-2 hover:bg-gray-700 rounded transition">
            <a href="#equities" className="block">Equities</a>
          </li>
          <li className="p-2 hover:bg-gray-700 rounded transition">
            <a href="#fx" className="block">FX</a>
          </li>
          <li className="p-2 hover:bg-gray-700 rounded transition">
            <a href="#crypto" className="block">Crypto</a>
          </li>
          <li className="p-2 hover:bg-gray-700 rounded transition">
            <a href="#commodities" className="block">Commodities</a>
          </li>
        </ul>
      </div>
    </aside>
  );
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