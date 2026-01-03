
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Home from './views/Home';
import Analytics from './views/Analytics';
import History from './views/History';
import Settings from './views/Settings';
import { TabType } from './types';
import { getOfflineQueue, clearOfflineQueue } from './services/persistenceService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [profileImage, setProfileImage] = useState<string>("https://picsum.photos/seed/alex/200");
  const [userName, setUserName] = useState<string>("Alex Johnson");
  const [jobTitle, setJobTitle] = useState<string>("Senior UX Researcher");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const savedImg = localStorage.getItem('work_sync_profile_img');
    if (savedImg) setProfileImage(savedImg);

    const savedName = localStorage.getItem('work_sync_user_name');
    if (savedName) setUserName(savedName);

    const savedTitle = localStorage.getItem('work_sync_job_title');
    if (savedTitle) setJobTitle(savedTitle);

    const handleOnline = () => {
      setIsOnline(true);
      processSyncQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const processSyncQueue = async () => {
    const queue = getOfflineQueue();
    if (queue.length === 0) return;

    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Synced offline actions:', queue);
    clearOfflineQueue();
    setIsSyncing(false);
  };

  const handleImageChange = (newImage: string) => {
    setProfileImage(newImage);
    localStorage.setItem('work_sync_profile_img', newImage);
  };

  const handleProfileUpdate = (name: string, title: string) => {
    setUserName(name);
    setJobTitle(title);
    localStorage.setItem('work_sync_user_name', name);
    localStorage.setItem('work_sync_job_title', title);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Home userName={userName} />;
      case 'analytics': return <Analytics />;
      case 'history': return <History />;
      case 'profile': return (
        <Settings 
          profileImage={profileImage} 
          onImageChange={handleImageChange} 
          userName={userName}
          jobTitle={jobTitle}
          onProfileUpdate={handleProfileUpdate}
        />
      );
      default: return <Home userName={userName} />;
    }
  };

  return (
    <div className="min-h-screen max-w-md mx-auto bg-background-light dark:bg-background-dark relative shadow-2xl overflow-hidden flex flex-col transition-colors duration-300 font-sans">
      {!isOnline && (
        <div className="bg-amber-500 text-white text-[10px] font-bold py-1 px-4 flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300">
          <span className="material-symbols-outlined text-[14px]">cloud_off</span>
          คุณกำลังใช้งานแบบออฟไลน์ ข้อมูลจะถูกบันทึกไว้ในเครื่อง
        </div>
      )}
      {isSyncing && (
        <div className="bg-primary text-white text-[10px] font-bold py-1 px-4 flex items-center justify-center gap-2 animate-pulse">
          <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
          กำลังซิงค์ข้อมูลล่าสุด...
        </div>
      )}

      <Header profileImage={profileImage} userName={userName} />
      
      <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth pb-24">
        {renderContent()}
      </main>
      
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60]">
        <button className="size-14 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary/50 border-4 border-background-light dark:border-background-dark hover:scale-110 active:scale-90 transition-all group">
          <span className="material-symbols-outlined text-[28px] transition-transform group-hover:rotate-90">add</span>
        </button>
      </div>
    </div>
  );
};

export default App;
