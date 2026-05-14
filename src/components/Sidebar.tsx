import React from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  ShoppingBag, 
  Package, 
  TrendingUp, 
  Users, 
  Settings, 
  LogOut,
  History,
  Database,
  CalendarDays,
  Building2,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }: SidebarProps) {
  const { logout, currentUser, settings, toggleSidebar } = useStore();
  const theme = settings?.theme || 'dark';
  const isCollapsed = settings?.isSidebarCollapsed || false;
  const primaryColor = settings?.primaryColor || '#22D3EE';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'billing', label: 'Billing', icon: Receipt, roles: ['Super Admin', 'Admin', 'Sales'] },
    { id: 'products', label: 'Products', icon: ShoppingBag, roles: ['Super Admin', 'Admin', 'Inventory Manager'] },
    { id: 'purchases', label: 'Purchases', icon: Package, roles: ['Super Admin', 'Admin', 'Inventory Manager'] },
    { id: 'storage', label: 'Storage', icon: Database, roles: ['Super Admin', 'Admin', 'Inventory Manager'] },
    { id: 'expenses', label: 'Expenses', icon: TrendingUp, roles: ['Super Admin', 'Admin'] },
    { id: 'members', label: 'Members', icon: Users, roles: ['Super Admin', 'Admin'] },
    { id: 'dailystocks', label: 'Daily Stocks', icon: CalendarDays, roles: ['Super Admin', 'Admin', 'Sales', 'Inventory Manager'] },
    { id: 'audit', label: 'Audit Logs', icon: History, roles: ['Super Admin'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['Super Admin', 'Admin'] },
  ];

  const filteredMenu = menuItems.filter(item => 
    !item.roles || (currentUser && item.roles.includes(currentUser.role))
  );

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.div 
        animate={{ width: isCollapsed ? '80px' : '240px' }}
        className={cn(
          "fixed inset-y-0 left-0 z-[70] glass border-r flex flex-col transition-transform duration-300 lg:translate-x-0 shadow-2xl lg:shadow-none overflow-hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className={cn("p-4 flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center p-1">
                <img 
                  src="/elements/lion_logo-removebg-preview.png" 
                  alt="Logo" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as any).src = 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/building-2.svg';
                  }}
                />
              </div>
              <h1 className="font-black text-sm tracking-tighter whitespace-nowrap text-white">
                liquid-ERP
              </h1>
            </div>
          )}
          {isCollapsed && (
            <div className="w-10 h-10 rounded-xl flex items-center justify-center p-1">
              <img 
                src="/elements/lion_logo-removebg-preview.png" 
                alt="Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as any).src = 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/building-2.svg';
                }}
              />
            </div>
          )}
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400 p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto mt-4 scrollbar-hide">
          {filteredMenu.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-sm mb-1 border",
                  isActive 
                    ? "bg-primary/10 border-primary/20 text-primary" 
                    : "text-slate-400 hover:bg-slate-500/10 border-transparent hover:text-slate-200"
                )}
                style={isActive ? { color: primaryColor, backgroundColor: `${primaryColor}15`, borderColor: `${primaryColor}20` } : {}}
              >
                <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100 transition-opacity")} style={isActive ? { color: primaryColor } : {}} />
                {!isCollapsed && <span className="font-bold whitespace-nowrap">{item.label}</span>}
                {!isCollapsed && isActive && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="ml-auto w-1 h-4 rounded-full"
                    style={{ backgroundColor: primaryColor, boxShadow: `0 0 10px ${primaryColor}` }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto px-3 pb-4">
          <button 
            onClick={toggleSidebar}
            className="hidden lg:flex w-full items-center justify-center gap-2 py-2 px-3 rounded-xl text-slate-500 hover:bg-slate-500/10 hover:text-slate-300 transition-all border border-slate-500/10 bg-slate-500/5 backdrop-blur-sm"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /> <span className="text-[10px] font-bold uppercase tracking-widest">Collapse</span></>}
          </button>
        </div>

        <div className="p-3 border-t border-slate-500/10 bg-slate-500/5">
          {!isCollapsed && (
            <div className="flex items-center gap-3 p-2 mb-3 rounded-xl bg-slate-500/5 border border-slate-500/10 overflow-hidden">
              <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-black border" style={{ borderColor: `${primaryColor}40`, color: primaryColor, backgroundColor: `${primaryColor}10` }}>
                {currentUser?.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black truncate text-slate-200">{currentUser?.name}</p>
                <p className="text-[8px] uppercase tracking-wider text-slate-500 font-bold truncate">{currentUser?.role}</p>
              </div>
            </div>
          )}
          <button
            onClick={async () => {
              await logout();
              // Wait for 2 seconds then refresh to ensure clean state
              setTimeout(() => {
                window.location.reload();
              }, 2000);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-colors group",
              isCollapsed && "justify-center"
            )}
          >
            <LogOut className={cn("w-5 h-5 flex-shrink-0 transition-transform", !isCollapsed && "group-hover:-translate-x-1")} />
            {!isCollapsed && <span className="font-bold text-sm">Log Out</span>}
          </button>
        </div>
      </motion.div>
    </>
  );
}

