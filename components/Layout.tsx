
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { COLORS, ICONS } from '../constants';

interface LayoutProps {
  title: string;
  showBack?: boolean;
  backTo?: string;
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
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      <header className="px-6 pt-4 pb-6 flex items-center justify-between z-20 sticky top-0 bg-[#102216]/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          {showBack ? (
            <button 
              onClick={handleBack} 
              className="p-3 glass rounded-full active:scale-90 transition-all border-white/10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            <div className="w-11" />
          )}
          <h1 className="text-xl font-extrabold tracking-tight">{title}</h1>
        </div>
        <div className="flex items-center">
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
