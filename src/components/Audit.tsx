import React from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Activity, 
  User, 
  Database,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useStore } from '../store';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export function Audit() {
  const { auditLogs, users } = useStore();
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredLogs = auditLogs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tight">Audit Infinity</h2>
          <p className="text-slate-400 font-medium">Immutable chronological record of all system events</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-6 py-4 rounded-[2rem]">
          <Activity className="w-5 h-5 text-primary" />
          <span className="text-sm font-black text-white uppercase tracking-widest">{auditLogs.length} Events Captured</span>
        </div>
      </div>

      <div className="glass flex items-center gap-3 px-6 py-4 rounded-2xl border-slate-800 mb-8">
        <Search className="w-5 h-5 text-slate-500" />
        <input 
          type="text" 
          placeholder="Filter logs by action, module, or details..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none outline-none text-white w-full font-medium"
        />
      </div>

      <div className="space-y-4">
        {filteredLogs.map((log) => {
          const user = users.find(u => u.id === log.userId);
          return (
            <motion.div 
              layout
              key={log.id}
              className="glass p-6 rounded-[2.5rem] border-slate-800 group hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center gap-6"
            >
              <div className="flex items-center gap-4 min-w-[200px]">
                <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center border border-slate-800">
                  <User className="w-6 h-6 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-black text-white uppercase tracking-tight">{user?.name || 'System'}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{user?.role || 'Service'}</p>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-md border",
                    log.type === 'error' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                    log.type === 'warning' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                    log.type === 'success' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                    "bg-primary/10 text-primary border-primary/20"
                  )}>
                    {log.module}
                  </span>
                  <h4 className={cn(
                    "text-lg font-black uppercase tracking-tight",
                    log.type === 'error' ? "text-rose-500" : "text-white"
                  )}>{log.action}</h4>
                </div>
                <p className="text-xs text-slate-400 font-medium leading-relaxed italic">
                  {log.details || 'Operational event recorded successfully without extended metadata.'}
                </p>
              </div>

              <div className="text-right border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-8">
                <div className="flex items-center gap-2 justify-end text-slate-500 mb-1">
                  <Calendar className="w-3 h-3" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{format(new Date(log.timestamp), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2 justify-end text-white">
                  <History className="w-3 h-3 text-primary" />
                  <span className="text-sm font-black uppercase tracking-tight">{format(new Date(log.timestamp), 'HH:mm:ss')}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
        {filteredLogs.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-[3rem]">
            <History className="w-12 h-12 text-slate-800 mx-auto mb-4" />
            <p className="text-slate-500 font-black uppercase text-xs tracking-widest">No audit trails found</p>
          </div>
        )}
      </div>
    </div>
  );
}
