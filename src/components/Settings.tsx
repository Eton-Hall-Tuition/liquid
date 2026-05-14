import React from 'react';
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Palette, 
  Building2, 
  Globe, 
  Shield, 
  Save, 
  RefreshCcw,
  LogOut,
  ChevronRight,
  Check,
  Sparkles
} from 'lucide-react';
import { useStore } from '../store';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export function Settings() {
  const { settings, updateSettings, logout } = useStore();
  const theme = settings?.theme || 'dark';
  const primaryColor = settings?.primaryColor || '#22D3EE';
  const [formData, setFormData] = React.useState({ ...settings });

  // Sync internal form state if settings change externally
  React.useEffect(() => {
    setFormData({ ...settings });
  }, [settings]);

  const handleSave = async () => {
    await updateSettings(formData);
  };

  const colors = [
    { name: 'Cyan', value: '#22D3EE' },
    { name: 'Amber', value: '#F59E0B' },
    { name: 'Emerald', value: '#10B981' },
    { name: 'Rose', value: '#F43F5E' },
    { name: 'Violet', value: '#8B5CF6' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className={cn("text-4xl font-black uppercase tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>Preferences</h2>
          <p className="text-slate-400 font-medium">Fine-tune your liquid-ERP workspace</p>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 mt-1">Constructed by Leviyathan Industries</p>
        </div>
        <button 
          onClick={handleSave}
          className="px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-lg hover:scale-101 active:scale-95 transition-all text-white"
          style={{ 
            backgroundColor: formData.primaryColor,
            boxShadow: `0 10px 30px -5px ${formData.primaryColor}40`
          }}
        >
          <Save className="w-5 h-5" />
          SAVE CHANGES
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Core Identity */}
        <section className="glass p-10 rounded-[3rem] space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ backgroundColor: `${formData.primaryColor}10`, borderColor: `${formData.primaryColor}20` }}>
              <Building2 className="w-5 h-5" style={{ color: formData.primaryColor }} />
            </div>
            <h3 className={cn("text-xl font-black uppercase tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>Organization</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Store Name</label>
              <input 
                type="text" 
                value={formData.shopName}
                onChange={e => setFormData({ ...formData, shopName: e.target.value })}
                className="w-full rounded-2xl px-6 py-4 outline-none transition-colors font-medium border"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Global Currency</label>
              <div className="flex items-center gap-3 bg-slate-500/5 border border-slate-500/10 rounded-2xl px-6 py-4">
                <span className="font-black" style={{ color: formData.primaryColor }}>₹</span>
                <span className="text-slate-400 font-medium text-sm">Indian Rupee (INR)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Visual Theme */}
        <section className="glass p-10 rounded-[3rem] space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ backgroundColor: `${formData.primaryColor}10`, borderColor: `${formData.primaryColor}20` }}>
              <Palette className="w-5 h-5" style={{ color: formData.primaryColor }} />
            </div>
            <h3 className={cn("text-xl font-black uppercase tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>Interface</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Theme Mode</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFormData({ ...formData, theme: 'dark' })}
                  className={cn(
                    "flex items-center justify-center gap-3 p-4 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all",
                    formData.theme === 'dark' 
                      ? "bg-slate-900 text-white shadow-lg" 
                      : "bg-transparent border-slate-500/10 text-slate-500"
                  )}
                  style={formData.theme === 'dark' ? { borderColor: formData.primaryColor, boxShadow: `0 4px 15px ${formData.primaryColor}20` } : {}}
                >
                  <Moon className="w-4 h-4" /> Dark
                </button>
                <button
                  onClick={() => setFormData({ ...formData, theme: 'light' })}
                  className={cn(
                    "flex items-center justify-center gap-3 p-4 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all",
                    formData.theme === 'light' 
                      ? "bg-white text-slate-900 shadow-xl" 
                      : "bg-transparent border-slate-500/10 text-slate-500"
                  )}
                  style={formData.theme === 'light' ? { borderColor: formData.primaryColor, boxShadow: `0 4px 15px ${formData.primaryColor}10` } : {}}
                >
                  <Sun className="w-4 h-4" /> Light
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Primary Accent</label>
              <div className="flex flex-wrap gap-3">
                {colors.map(color => (
                  <button
                    key={color.value}
                    onClick={() => setFormData({ ...formData, primaryColor: color.value })}
                    className={cn(
                      "w-10 h-10 rounded-xl transition-all relative overflow-hidden border-2",
                      formData.primaryColor === color.value 
                        ? "scale-110 shadow-lg z-10" 
                        : "hover:scale-105 opacity-80 hover:opacity-100"
                    )}
                    style={{ 
                      backgroundColor: color.value,
                      borderColor: formData.primaryColor === color.value ? 'white' : 'transparent'
                    }}
                  >
                    {formData.primaryColor === color.value && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Advanced Control */}
      <section className="glass p-10 rounded-[3.5rem] space-y-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center border border-rose-500/20">
            <Shield className="w-5 h-5 text-rose-500" />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight text-rose-500">System Danger Zone</h3>
        </div>

        <div className="grid grid-cols-1 gap-10">
          <div className="space-y-4">
            <div className="p-10 bg-amber-500/5 rounded-[3rem] border border-amber-500/10 relative overflow-hidden group">
              <div className="absolute top-4 right-4 px-3 py-1 bg-amber-500 text-slate-950 text-[8px] font-black uppercase tracking-widest rounded-full">
                Under Construction
              </div>
              <h4 className="font-black uppercase tracking-tight text-lg mb-2">Export Data Archive</h4>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8 max-w-xl">Download a complete snapshot of all transactions, storage logs, and system audits in JSON format. This feature is currently being calibrated for maximum security.</p>
              <button 
                disabled
                className="flex items-center gap-3 bg-slate-800 text-slate-500 font-black text-[10px] uppercase tracking-widest py-4 px-10 rounded-2xl cursor-not-allowed opacity-50"
              >
                <RefreshCcw className="w-4 h-4" /> System Calibration in Progress
              </button>
            </div>

            {useStore.getState().currentUser?.role === 'Super Admin' && (
              <div className="p-10 bg-rose-500/5 rounded-[3rem] border border-rose-500/10 relative overflow-hidden group">
                <div className="absolute top-4 right-4 px-3 py-1 bg-amber-500 text-slate-950 text-[8px] font-black uppercase tracking-widest rounded-full z-10 animate-pulse">
                  Under Update
                </div>
                <h4 className="font-black uppercase tracking-tight text-lg mb-2 text-rose-500">Wipe System Data</h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8 max-w-xl">
                  Irreversible action: Clear all products, sales, purchases, expenses, audit logs, and members. 
                  <span className="text-rose-500/60 font-black block mt-2">The Super Admin account remains intact.</span>
                </p>
                <button 
                  onClick={async () => {
                    const confirmed = window.confirm("CRITICAL WARNING: This will permanently delete ALL organization data. Are you absolutely sure?");
                    if (confirmed) {
                      const doubleCheck = window.confirm("LAST CHANCE: Type 'DELETE' to confirm? (Just joking, but please be sure)");
                      if (doubleCheck) {
                        try {
                          await useStore.getState().wipeAllData();
                        } catch (err: any) {
                          alert(`Wipe failed: ${err.message}`);
                        }
                      }
                    }
                  }}
                  className="flex items-center gap-3 bg-rose-500 text-white font-black text-[10px] uppercase tracking-widest py-4 px-10 rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-rose-500/20"
                >
                  <RefreshCcw className="w-4 h-4" /> Reset Workspace State
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="flex flex-col items-center justify-center pt-10 text-slate-700">
        <Sparkles className="w-8 h-8 mb-4 opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">liquid-ERP • Production Build V1.0.4</p>
        <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-20 mt-2">Engineered by Leviyathan Industries</p>
      </div>
    </div>
  );
}
