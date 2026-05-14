import React from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  ArrowRight, 
  Shield, 
  Zap, 
  BarChart3,
  Layout
} from 'lucide-react';
import { useStore } from '../store';
import { Background3D } from './Background3D';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface HomeProps {
  onLogin: () => void;
  onSignup: () => void;
}

export function Home({ onLogin, onSignup }: HomeProps) {
  const { settings } = useStore();
  const primaryColor = settings?.primaryColor || '#22D3EE';

  return (
    <div className={cn(
      "min-h-screen relative overflow-hidden transition-colors duration-500",
      settings?.theme === 'dark' ? "bg-slate-950 text-slate-50" : "bg-white text-slate-900"
    )}>
      <Background3D />
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full opacity-20" style={{ backgroundColor: primaryColor }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: primaryColor, boxShadow: `0 4px 15px ${primaryColor}40` }}>
            <Building2 className="text-slate-950 w-6 h-6" />
          </div>
          <span className="text-xl font-black tracking-tighter">liquid-ERP</span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Constructed by Leviyathan Industries</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onLogin}
            className="text-slate-400 hover:text-white font-bold text-sm transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={onSignup}
            className="px-6 py-2.5 rounded-xl font-black text-sm transition-all active:scale-95 shadow-lg"
            style={{ backgroundColor: primaryColor, color: '#0f172a' }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-full mb-8"
        >
          <Zap className="w-4 h-4" style={{ color: primaryColor }} />
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: primaryColor }}>Next-Gen Retail ERP</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl font-black leading-tight mb-6"
        >
          Work Smarter, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, #818cf8)` }}>
            Not Harder.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl text-slate-400 text-lg md:text-xl font-medium leading-relaxed mb-12"
        >
          The ultimate shop management system. From FIFO billing and deep inventory 
          insights to automated daily financial tracking — all in one powerful workspace.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mb-20"
        >
          <button 
            onClick={onSignup}
            className="px-10 py-5 rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-3 text-slate-950"
            style={{ backgroundColor: primaryColor, boxShadow: `0 20px 40px ${primaryColor}30` }}
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5" />
          </button>
          <button 
            onClick={onLogin}
            className="bg-slate-900 text-white border border-slate-800 px-10 py-5 rounded-2xl font-black text-lg hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-3"
          >
            View Demo
          </button>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
          {[
            { icon: BarChart3, title: 'Deep Analytics', desc: 'Real-time profit tracking and sales breakdown analysis.' },
            { icon: Layout, title: 'Smart POS', desc: 'FIFO-powered ultra-fast billing with automated stock deduction.' },
            { icon: Shield, title: 'Audit Logs', desc: 'Immutable operational history for complete shop transparency.' }
          ].map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (i * 0.1) }}
              className="glass p-8 rounded-[2.5rem] text-left group hover:border-cyan-400/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${primaryColor}15` }}>
                <feat.icon className="w-6 h-6" style={{ color: primaryColor }} />
              </div>
              <h3 className="text-xl font-black text-white mb-3">{feat.title}</h3>
              <p className="text-slate-400 font-medium leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
