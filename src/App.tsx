import React from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { DailyStocks } from './components/DailyStocks';
import { Audit } from './components/Audit';
import { Settings } from './components/Settings';
import { Home } from './components/Home';
import { Members } from './components/Members';
import { useStore } from './store';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Lock, Menu } from 'lucide-react';
import { cn } from './lib/utils';
import { Auth } from './components/Auth';
import { Background3D } from './components/Background3D';

// Lazy load for performance
const Billing = React.lazy(() => import('./components/Billing.tsx'));
const Products = React.lazy(() => import('./components/Products.tsx'));
const Purchases = React.lazy(() => import('./components/Purchases.tsx'));
const Storage = React.lazy(() => import('./components/Storage.tsx'));
const Expenses = React.lazy(() => import('./components/Expenses.tsx'));

// Role based tab restrictions
const rolePermissions: Record<string, string[]> = {
  'Super Admin': ['dashboard', 'billing', 'products', 'purchases', 'storage', 'expenses', 'members', 'dailystocks', 'audit', 'settings'],
  'Admin': ['dashboard', 'billing', 'products', 'purchases', 'storage', 'expenses', 'members', 'dailystocks', 'settings'],
  'Sales': ['dashboard', 'billing', 'dailystocks', 'settings'],
  'Inventory Manager': ['dashboard', 'products', 'purchases', 'storage', 'dailystocks', 'settings']
};

export default function App() {
  const { currentUser, dailyStocks, settings, initAuth, isLoading, activeTab, setActiveTab } = useStore();
  const theme = settings?.theme || 'dark';

  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // Listen for changeTab event from components
  React.useEffect(() => {
    const handleTabChange = (e: any) => {
      if (typeof e.detail === 'string') {
        setActiveTab(e.detail);
      }
    };
    window.addEventListener('changeTab', handleTabChange);
    return () => window.removeEventListener('changeTab', handleTabChange);
  }, [setActiveTab]);

  const allowedTabs = React.useMemo(() => 
    currentUser ? (rolePermissions[currentUser.role] || ['dashboard', 'home']) : ['dashboard']
  , [currentUser]);

  const activeDay = React.useMemo(() => dailyStocks.find(d => d.status === 'OPEN'), [dailyStocks]);
  const isDayClosed = !activeDay;
  const transactionalTabs = React.useMemo(() => ['billing', 'purchases', 'expenses'], []);
  const isRestricted = transactionalTabs.includes(activeTab) && isDayClosed;

  React.useEffect(() => {
    initAuth();
  }, [initAuth]);
  
  React.useEffect(() => {
    if (currentUser && !allowedTabs.includes(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [currentUser, allowedTabs, activeTab, setActiveTab]);

  if (isLoading) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center transition-colors duration-500 overflow-hidden relative",
        theme === 'dark' ? "bg-slate-950" : "bg-white"
      )}>
        <Background3D />
        <div className="relative z-10 w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-primary" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Auth 
        mode="login" 
        onToggle={() => {}} 
        onSuccess={() => {}} 
      />
    );
  }

  return (
    <div 
      className={cn(
        "min-h-screen relative overflow-hidden transition-colors duration-500",
        theme === 'dark' ? "bg-slate-950 text-slate-50 dark" : "bg-slate-50 text-slate-900 light"
      )}
      style={{ '--primary-accent': settings?.primaryColor } as React.CSSProperties}
    >
      <style>{`
        :root {
          --primary-accent: ${settings?.primaryColor || '#22D3EE'};
        }
        
        .shadow-primary { box-shadow: 0 10px 30px -10px var(--primary-accent) !important; }
        
        .glass {
          background: ${theme === 'dark' ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.6)'};
          backdrop-filter: blur(12px);
          border: 1px solid ${theme === 'dark' ? 'rgba(30, 41, 59, 1)' : 'rgba(203, 213, 225, 1)'};
          box-shadow: ${theme === 'dark' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : '0 10px 25px -5px rgba(0, 0, 0, 0.05)'};
        }
        
        /* Global Text Overrides for Light Mode Visibility */
        .light .text-slate-400 { color: #64748b !important; }
        .light .text-slate-500 { color: #475569 !important; }
        .light .text-white { color: #0f172a !important; }
        .light .text-slate-200 { color: #1e293b !important; }
        .light .text-slate-300 { color: #334155 !important; }
        
        .light .bg-slate-900 { background-color: #f1f5f9 !important; }
        .light .bg-slate-950 { background-color: #f8fafc !important; }
        .light .bg-slate-950\/50 { background-color: rgba(248, 250, 252, 0.5) !important; }
        .light .border-slate-800 { border-color: #e2e8f0 !important; }
        .light .border-slate-900 { border-color: #f1f5f9 !important; }
        .light .border-slate-500\/10 { border-color: rgba(0, 0, 0, 0.05) !important; }
        .light .border-slate-500\/20 { border-color: rgba(0, 0, 0, 0.1) !important; }
        
        .dark .text-slate-400 { color: #94a3b8 !important; }
        
        input::placeholder {
          color: #64748b;
          opacity: 0.6;
        }

        .dark input, .dark select, .dark textarea {
          background-color: rgba(2, 6, 23, 0.8) !important;
          color: white !important;
          border-color: rgba(30, 41, 59, 1) !important;
        }

        .light input, .light select, .light textarea {
          background-color: white !important;
          color: #0f172a !important;
          border-color: #cbd5e1 !important;
        }
        
        /* Scrollbar styles to be less prominent in light mode */
        .light .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .light .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <main 
        className={cn(
          "transition-all duration-300 min-h-screen relative z-10",
          settings?.isSidebarCollapsed ? "lg:pl-[80px]" : "lg:pl-[240px]"
        )}
      >
        {/* Top Header */}
        <header className={cn(
          "sticky top-0 z-50 backdrop-blur-xl border-b px-4 lg:px-8 py-4 h-20 flex items-center transition-colors",
          theme === 'dark' ? "bg-slate-950/80 border-slate-900" : "bg-white/80 border-slate-200 shadow-sm"
        )}>
          <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 text-slate-400 hover:text-white"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex flex-col">
                <h2 className="text-lg font-black uppercase tracking-tight leading-none text-primary">
                  {activeTab}
                </h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Management Portal</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden md:flex flex-col items-end text-right">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full shadow-[0_0_10px_var(--primary-accent)]", activeDay ? "bg-primary" : "bg-rose-500")} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {activeDay ? "Operations: Active" : "Operations: Locked"}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">
                  {settings.shopName}
                </span>
              </div>
              <button className={cn(
                "relative p-2.5 border rounded-xl transition-colors",
                theme === 'dark' ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-600"
              )}>
                <Bell className="w-5 h-5" />
                <span className={cn(
                  "absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 shadow-[0_0_8px_var(--primary-accent)]",
                  theme === 'dark' ? "border-slate-950" : "border-slate-100"
                )} />
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 lg:p-12 max-w-7xl mx-auto relative min-h-[calc(100vh-80px)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <React.Suspense fallback={
                <div className="h-[60vh] flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-primary" />
                </div>
              }>
                {isRestricted ? (
                  <div className={cn(
                    "min-h-[500px] flex flex-col items-center justify-center text-center rounded-[3.5rem] p-12 max-w-2xl mx-auto border sm:glass",
                    theme === 'dark' ? "border-rose-500/10" : "bg-white border-rose-500/20 shadow-xl"
                  )}>
                    <div className="w-24 h-24 bg-rose-500/10 rounded-[2.5rem] flex items-center justify-center mb-10 border border-rose-500/20 shadow-[0_0_50px_rgba(244,63,94,0.1)]">
                      <Lock className="w-10 h-10 text-rose-500" />
                    </div>
                    <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">Day is Closed</h2>
                    <p className="text-slate-400 font-medium mb-10 leading-relaxed text-lg text-balance">
                      Transaction modules are currently <span className="text-rose-500 font-black">locked</span>. 
                      Navigate to <span className="text-primary font-bold">Daily Stocks</span> to enable operations for today.
                    </p>
                    <button 
                      onClick={() => setActiveTab('dailystocks')}
                      className="bg-primary text-slate-950 px-10 py-5 rounded-2xl font-black text-sm shadow-xl shadow-primary hover:scale-105 transition-all active:scale-95 uppercase tracking-widest"
                    >
                      Initialize Daily Session
                    </button>
                  </div>
                ) : (
                  <>
                    {activeTab === 'dashboard' && <Dashboard />}
                    {activeTab === 'billing' && <Billing />}
                    {activeTab === 'products' && <Products />}
                    {activeTab === 'purchases' && <Purchases />}
                    {activeTab === 'storage' && <Storage />}
                    {activeTab === 'expenses' && <Expenses />}
                    {activeTab === 'members' && <Members />}
                    {activeTab === 'dailystocks' && <DailyStocks />}
                    {activeTab === 'audit' && <Audit />}
                    {activeTab === 'settings' && <Settings />}
                  </>
                )}
              </React.Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Persistent Radial Glow */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
}

