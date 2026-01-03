
import React from 'react';

interface HeaderProps {
  profileImage: string;
  userName: string;
}

const Header: React.FC<HeaderProps> = ({ profileImage, userName }) => {
  return (
    <header className="flex items-center justify-between px-6 pt-6 pb-2 sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-40 transition-colors">
      <div className="flex items-center gap-4">
        <div className="relative group">
          <div className="size-12 rounded-full ring-2 ring-primary/20 overflow-hidden bg-slate-200 dark:bg-slate-800">
            <img 
              src={profileImage} 
              alt={userName} 
              className="size-full object-cover transition-transform group-hover:scale-110"
            />
          </div>
          <div className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-white dark:border-background-dark"></div>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">สวัสดีตอนเช้า</p>
          <h1 className="text-xl font-bold leading-tight">{userName}</h1>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="size-10 rounded-full flex items-center justify-center bg-white dark:bg-surface-dark shadow-sm border border-slate-100 dark:border-white/5 transition-all hover:scale-105 active:scale-95 text-slate-500 dark:text-slate-400 relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2.5 right-2.5 size-2 bg-red-500 rounded-full border border-white dark:border-surface-dark"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
