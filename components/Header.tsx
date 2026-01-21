
import React from 'react';
import { ViewType } from '../types';

interface HeaderProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  isAdminLoggedIn: boolean;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView, isAdminLoggedIn, onLogout }) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="text-2xl font-bold text-orange-600 cursor-pointer flex items-center gap-2"
          onClick={() => setView('shop')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          Yeasin Ecom
        </div>

        <nav className="flex items-center gap-4">
          <button 
            onClick={() => setView('shop')}
            className={`px-4 py-2 rounded-full transition ${currentView === 'shop' ? 'bg-orange-100 text-orange-600 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            শপ
          </button>
          
          {isAdminLoggedIn ? (
            <>
              <button 
                onClick={() => setView('admin')}
                className={`px-4 py-2 rounded-full transition ${currentView === 'admin' ? 'bg-orange-100 text-orange-600 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                প্রোডাক্ট ম্যানেজমেন্ট
              </button>
              <button 
                onClick={() => setView('admin_orders')}
                className={`px-4 py-2 rounded-full transition ${currentView === 'admin_orders' ? 'bg-orange-100 text-orange-600 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                অর্ডারসমূহ
              </button>
              <button 
                onClick={onLogout}
                className="bg-red-50 text-red-600 px-4 py-2 rounded-full hover:bg-red-100 transition text-sm"
              >
                লগআউট
              </button>
            </>
          ) : (
            <button 
              onClick={() => setView('admin')}
              className="bg-gray-800 text-white px-4 py-2 rounded-full hover:bg-gray-700 transition"
            >
              অ্যাডমিন লগইন
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
