import React from 'react';
import { History, Activity } from 'lucide-react';
import { useStore } from '../store';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

interface SectionAuditProps {
  module: string | string[];
}

export function SectionAudit({ module }: SectionAuditProps) {
  const { auditLogs, users, settings } = useStore();
  const theme = settings?.theme || 'dark';
  const primaryColor = settings?.primaryColor || '#22D3EE';
  
  const modules = Array.isArray(module) ? module : [module];
  const sectionLogs = auditLogs.filter(log => modules.includes(log.module)).slice(0, 50);

  return (
    <div className={cn(
      "glass p-8 rounded-[3rem] mt-12 w-full",
      theme === 'dark' ? "border-slate-800 bg-slate-900/20" : "bg-white shadow-lg border-slate-200"
    )}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}20` }}>
            <History className="w-5 h-5" style={{ color: primaryColor }} />
          </div>
          <div>
            <h3 className={cn("text-xl font-black uppercase tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>Activity Log</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Module specific trail</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {sectionLogs.map((log) => {
          const user = users.find(u => u.id === log.userId);
          return (
            <div key={log.id} className={cn(
              "flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-colors gap-4",
              theme === 'dark' ? "bg-slate-950/40 border-slate-800/50 hover:bg-slate-950" : "bg-slate-50 border-slate-200 hover:bg-white"
            )}>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center border" style={{ backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}20` }}>
                  <Activity className="w-3 h-3" style={{ color: primaryColor }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className={cn(
                      "text-xs font-black uppercase tracking-tight",
                      log.type === 'error' ? "text-rose-500" : (theme === 'dark' ? "text-white" : "text-slate-900")
                    )}>{log.action}</p>
                    {log.details && <span className="text-[9px] text-slate-500 italic">— {log.details}</span>}
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    {format(new Date(log.timestamp), 'HH:mm:ss')} • {user?.name || 'System'}
                  </p>
                </div>
              </div>
              <span className={cn(
                "text-[9px] self-start sm:self-center font-black px-2 py-1 rounded border uppercase tracking-tighter",
                theme === 'dark' ? "text-slate-600 bg-slate-900 border-slate-800" : "text-slate-400 bg-white border-slate-200"
              )}>{log.module}</span>
            </div>
          );
        })}
        {sectionLogs.length === 0 && (
          <p className="py-8 text-center text-[10px] font-black text-slate-700 uppercase tracking-widest">Operational trail empty</p>
        )}
      </div>
    </div>
  );
}
