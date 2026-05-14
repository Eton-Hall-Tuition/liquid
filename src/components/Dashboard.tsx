import React from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingDown,
  Activity,
  History,
  Building2,
  Calendar
} from 'lucide-react';
import { useStore } from '../store';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { SectionAudit } from './SectionAudit';

export function Dashboard() {
  const { sales, dailyStocks, products, expenses, auditLogs, batches, settings } = useStore();
  const theme = settings?.theme || 'dark';
  const primaryColor = settings?.primaryColor || '#22D3EE';
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalRevenue = sales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalProfit = sales.reduce((acc, s) => acc + s.totalProfit, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const stockValuation = batches.reduce((acc, b) => acc + (b.currentQuantity * b.unitCost), 0);

  // Use real data from dailyStocks
  const chartData = dailyStocks.slice(0, 7).reverse().map(d => ({
    name: format(new Date(d.date), 'MMM dd'),
    revenue: d.totalSales,
    profit: d.totalSales * 0.15, // Simplified profit view for the chart
  }));

  const previousDay = dailyStocks.find(d => d.status === 'CLOSED');
  const carriedRevenue = previousDay ? previousDay.totalSales : 0;

  const stats = [
    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10', trend: '+12.5%' },
    { label: 'Net Profit', value: `₹${totalProfit.toLocaleString()}`, icon: Activity, color: 'text-primary', bg: 'bg-primary/10', trend: '+8.2%' },
    { label: 'Stock Valuation', value: `₹${stockValuation.toLocaleString()}`, icon: Package, color: 'text-amber-400', bg: 'bg-amber-400/10', trend: '-2.4%' },
    { label: 'Opening Balance', value: `₹${carriedRevenue.toLocaleString()}`, icon: Building2, color: 'text-indigo-400', bg: 'bg-indigo-400/10', trend: 'Carried' },
  ];

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 uppercase tracking-tight">
        <div>
          <h2 className={cn("text-4xl font-black group underline decoration-4 underline-offset-8", theme === 'dark' ? "text-white decoration-primary/20" : "text-slate-900 decoration-primary/40")}>
            Control Station
          </h2>
          <p className="text-slate-400 mt-2 font-medium normal-case tracking-normal">Snapshot of your retail ecosystem performance</p>
        </div>
        <div className={cn(
          "flex items-center gap-3 border px-6 py-4 rounded-[2rem]",
          theme === 'dark' ? "bg-slate-950/50 border-white/5" : "bg-white border-slate-200 shadow-sm"
        )}>
          <Calendar className="w-5 h-5 shadow-sm" style={{ color: primaryColor }} />
          <span className={cn("text-sm font-black whitespace-nowrap", theme === 'dark' ? "text-white" : "text-slate-900")}>
            {format(new Date(), 'EEEE, MMMM do')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "glass p-8 rounded-[3rem] relative overflow-hidden group transition-all hover:border-primary/20",
              theme === 'light' && "shadow-xl border-slate-200 bg-white"
            )}
          >
            <div className={`absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity whitespace-nowrap`}>
              <stat.icon className="w-24 h-24" />
            </div>
            
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-white/5" style={{ backgroundColor: stat.bg === 'bg-primary/10' ? `${primaryColor}15` : undefined }}>
              <stat.icon className={cn("w-6 h-6", stat.color)} style={stat.color === 'text-primary' ? { color: primaryColor } : {}} />
            </div>
            
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{stat.label}</p>
              <h3 className={cn("text-3xl font-black tracking-tighter", theme === 'dark' ? "text-white" : "text-slate-900")}>{stat.value}</h3>
              <div className="flex items-center gap-2 mt-4 text-[10px] font-black uppercase tracking-[0.15em] text-emerald-500">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/30 flex items-center justify-center"><div className="w-0.5 h-0.5 rounded-full bg-emerald-500" /></div>
                {stat.trend} <span className="text-slate-500/60 lowercase italic ml-1">growth</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className={cn(
          "lg:col-span-8 glass p-12 rounded-[4rem] min-h-[500px]",
          theme === 'light' && "bg-white shadow-xl border-slate-200"
        )}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
            <div>
              <h3 className={cn("text-2xl font-black uppercase tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>Performance Flow</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Real-time revenue monitoring</p>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.5)]" style={{ backgroundColor: primaryColor }} />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gross Sales</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Profit</span>
              </div>
            </div>
          </div>
          
          <div className="h-[350px] w-full" style={{ minWidth: 0 }}>
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={chartData.length > 0 ? chartData : [{ name: 'PENDING', revenue: 0, profit: 0 }]}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={primaryColor} stopOpacity={0.25}/>
                      <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="8 8" vertical={false} stroke={theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#E2E8F0'} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 9, fontWeight: 900 }}
                    dy={15}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 9, fontWeight: 900 }}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme === 'dark' ? '#020617' : '#FFFFFF', 
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '24px',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                      padding: '20px'
                    }}
                    cursor={{ stroke: primaryColor, strokeWidth: 1, strokeDasharray: '4 4' }}
                    itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={primaryColor} 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorRev)" 
                    animationDuration={1500}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#6366f1" 
                    strokeWidth={4} 
                    fill="transparent" 
                    strokeDasharray="8 8"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className={cn(
            "glass p-10 rounded-[3.5rem] flex-1 border-white/5",
            theme === 'dark' ? "bg-slate-950/20 shadow-inner" : "bg-white shadow-xl border-slate-200"
          )}>
            <div className="flex items-center justify-between mb-10">
              <h3 className={cn("text-xl font-black uppercase tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>Live Feed</h3>
              <div className="flex gap-1">
                {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />)}
              </div>
            </div>
            <div className="space-y-6">
              {auditLogs.slice(0, 5).map((log, i) => (
                <div key={log.id} className="flex gap-5 relative group">
                  {i !== 4 && <div className={cn("absolute left-[17px] top-[34px] bottom-[-24px] w-0.5", theme === 'dark' ? "bg-white/5" : "bg-slate-100")} />}
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center relative z-10 border transition-all group-hover:scale-110 shadow-sm",
                    theme === 'dark' ? "bg-slate-950 border-white/10" : "bg-white border-slate-200"
                  )}>
                    <Activity className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                  </div>
                  <div className="py-1">
                    <p className={cn("text-xs font-black tracking-tight uppercase mb-0.5", theme === 'dark' ? "text-white" : "text-slate-900")}>{log.action}</p>
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.15em] opacity-60">
                      {log.module} <span className="mx-1.5 text-slate-700">|</span> {format(new Date(log.timestamp), 'HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <div className="py-16 text-center opacity-20">
                  <div className="w-16 h-16 bg-slate-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <History className="w-8 h-8" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] px-4">Terminal has no recorded activity</p>
                </div>
              )}
            </div>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('changeTab', { detail: 'audit' }))}
              className={cn(
                "w-full mt-10 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all border group",
                theme === 'dark' ? "bg-slate-900 shadow-inner text-slate-500 hover:text-white border-white/5 hover:bg-slate-800" : "bg-slate-50 text-slate-500 hover:bg-white border-slate-200"
              )}
            >
              Open Full Audit <ArrowUpRight className="inline-block w-3 h-3 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      <SectionAudit module={["Sales", "Purchases", "Expenses", "Auth", "Inventory"]} />
    </div>
  );
}
