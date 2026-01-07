
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { COLORS, ICONS } from '../constants';

interface LayoutProps {
  title: string;
  showBack?: boolean;
  backTo?: string; // Added to allow explicit back targets
  rightAction?: React.ReactNode;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ title, showBack = true, backTo, rightAction, children }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-screen overflow-hidden">
      <header className="px-6 py-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          {showBack ? (
            <button 
              onClick={handleBack} 
              className="p-2 glass rounded-full hover:bg-white/10 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            <div className="w-10" />
          )}
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
        </div>
        <div>
          {rightAction}
        </div>
      </header>
      <main className="flex-1 overflow-y-auto px-6 pb-24 no-scrollbar">
        {children}
      </main>
    </div>
  );
};

export default Layout;
