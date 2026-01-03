
import React from 'react';
import { TabType } from '../types';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home', icon: 'home', label: 'หน้าหลัก' },
    { id: 'analytics', icon: 'analytics', label: 'วิเคราะห์' },
    { id: 'history', icon: 'history', label: 'ประวัติ' },
    { id: 'profile', icon: 'person', label: 'โปรไฟล์' },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 px-4 pb-4">
      <div className="bg-surface-light/80 dark:bg-surface-dark/90 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-2xl rounded-3xl flex justify-around items-center h-16 relative">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex flex-col items-center justify-center transition-all duration-300 ${
              activeTab === tab.id ? 'text-primary scale-110' : 'text-slate-400'
            }`}
          >
            <span className={`material-symbols-outlined text-[24px] ${activeTab === tab.id ? 'fill-1' : ''}`}>
              {tab.icon}
            </span>
            <span className="text-[10px] font-medium mt-0.5">{tab.label}</span>
          </button>
        ))}
        
        {/* Floating Add Button logic could be here, but we'll stick to a simple 4-tab layout as per typical SPA patterns if needed */}
      </div>
    </nav>
  );
};

export default Navigation;
