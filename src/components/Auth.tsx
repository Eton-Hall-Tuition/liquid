import React from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  Mail, 
  Lock, 
  ArrowRight,
  ShieldCheck,
  User,
  Key
} from 'lucide-react';
import { useStore } from '../store';
import { cn } from '../lib/utils';
import { Background3D } from './Background3D';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

interface AuthProps {
  mode: 'login' | 'signup';
  onToggle: () => void;
  onSuccess: () => void;
}

export function Auth({ mode: initialMode, onToggle, onSuccess }: AuthProps) {
  const { settings, loginAsDemo } = useStore();
  const theme = settings?.theme || 'dark';
  const primaryColor = settings?.primaryColor || '#22D3EE';
  
  const [loading, setLoading] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [authStep, setAuthStep] = React.useState<'identify' | 'password' | 'setup'>('identify');

  const handleIdentify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Demo bypass
    if (email.toLowerCase() === 'admin@example.com') {
      loginAsDemo('Admin');
      onSuccess();
      return;
    }
    if (email.toLowerCase() === 'sales@example.com') {
      loginAsDemo('Sales');
      onSuccess();
      return;
    }

    setAuthStep('password');
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email.toLowerCase(), password);
      onSuccess();
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        // If user doesn't exist or enumeration protection is on, offer setup
        setAuthStep('setup');
        setError('Verification required. If this is your first time, please set your password.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password auth is DISABLED in Firebase Console. Please enable it in the Authentication tab.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection or Firebase configuration.');
      } else if (err.message && err.message.includes('apiKey')) {
        setError('Firebase API Key issue. Please verify your configuration.');
      } else {
        setError(`Access denied: ${err.message || 'Check project configuration'}`);
        console.error("Auth Error Detail:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Complexity failed: 6 characters minimum required');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      // Create user in Auth
      const cred = await createUserWithEmailAndPassword(auth, email.toLowerCase(), password);
      
      // We don't perform setDoc here. 
      // The initAuth function in store.ts handles the initialization 
      // logic (invitation lookup or Super Admin bootstrap).
      
      onSuccess();
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setAuthStep('password');
        setError('Identity already established. Please authorize.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center p-8 transition-colors duration-500 overflow-hidden relative",
      theme === 'dark' ? "bg-slate-950" : "bg-white"
    )}>
      {/* 3D Background */}
      <Background3D />

      {/* Background Orbs */}
      <div className="fixed top-[10%] right-[10%] w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0" style={{ backgroundColor: `${primaryColor}10` }} />
      <div className="fixed bottom-[10%] left-[10%] w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none z-0" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-24 h-24 mx-auto mb-6 relative"
          >
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
            <img 
              src="/elements/lion_logo-removebg-preview.png" 
              alt="Logo" 
              className="w-full h-full object-contain relative z-10"
              onError={(e) => {
                // Fallback to Icon if image doesn't exist
                (e.target as any).style.display = 'none';
                (e.target as any).parentElement.querySelector('.fallback-icon').style.display = 'flex';
              }}
            />
            <div className="fallback-icon hidden w-full h-full rounded-2xl bg-primary items-center justify-center shadow-lg">
              <Building2 className="text-white w-12 h-12" />
            </div>
          </motion.div>
          <h2 className={cn("text-4xl font-black mb-3 uppercase tracking-tight drop-shadow-2xl", theme === 'dark' ? "text-white" : "text-slate-900")}>
            {authStep === 'identify' ? 'Identity Check' : authStep === 'password' ? 'Authorize' : 'Account Setup'}
          </h2>
          <p className="text-slate-500 font-medium normal-case tracking-normal">
            {authStep === 'setup' ? 'Define your entry credentials' : 'System access authorization portal'}
          </p>
        </div>

        <div className="glass p-8 md:p-10 rounded-[3rem] shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-xs font-bold text-center">
              {error}
            </div>
          )}

          <form onSubmit={authStep === 'identify' ? handleIdentify : authStep === 'password' ? handleLogin : handleSetup} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="email" 
                  value={email}
                  disabled={authStep !== 'identify'}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@liquid-erp.com"
                  className="w-full rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-primary transition-all border disabled:opacity-50"
                />
              </div>
            </div>

            {authStep !== 'identify' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {authStep === 'setup' ? 'New Password' : 'Password'}
                  </label>
                  {authStep === 'password' && (
                    <button type="button" className="text-[10px] font-black uppercase tracking-widest hover:opacity-80" style={{ color: primaryColor }}>Forgot?</button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-primary transition-all border"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {authStep === 'setup' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Confirm Password</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-primary transition-all border"
                  />
                </div>
              </div>
            )}

            <button
              disabled={loading}
              className="w-full font-black py-5 rounded-2xl hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 text-white"
              style={{ backgroundColor: primaryColor, boxShadow: `0 10px 25px ${primaryColor}40` }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {authStep === 'identify' ? 'Search Identity' : authStep === 'password' ? 'Authorize Session' : 'Establish Account'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {authStep !== 'identify' && (
              <button 
                type="button"
                onClick={() => {
                  setAuthStep('identify');
                  setPassword('');
                  setConfirmPassword('');
                  setError(null);
                }}
                className="w-full text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-primary transition-colors"
              >
                Change Email Address
              </button>
            )}
          </form>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <button 
              type="button" 
              onClick={() => { setEmail('admin@example.com'); setAuthStep('identify'); }}
              className="text-[9px] font-black uppercase tracking-widest px-4 py-2 bg-slate-500/10 hover:bg-primary/20 hover:text-primary rounded-xl transition-all border border-slate-500/10"
            >
              Admin Trial
            </button>
            <button 
              type="button"
              onClick={() => { setEmail('sales@example.com'); setAuthStep('identify'); }}
              className="text-[9px] font-black uppercase tracking-widest px-4 py-2 bg-slate-500/10 hover:bg-primary/20 hover:text-primary rounded-xl transition-all border border-slate-500/10"
            >
              Sales Training
            </button>
          </div>
          
          <div className="flex items-center gap-6 opacity-30">
            <ShieldCheck className="w-6 h-6 text-slate-500" />
            <div className="h-4 w-px bg-slate-500/20" />
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Secure Protocol</span>
              <span className="text-[6px] font-black uppercase tracking-[0.2em] text-slate-500 mt-1">Constructed by Leviyathan Industries</span>
            </div>
          </div>
          
          <div className="p-4 bg-slate-500/5 rounded-2xl border border-slate-500/10 text-[9px] font-bold text-slate-500 uppercase tracking-widest text-center max-w-xs leading-relaxed">
            Note: First-time users must use their authorized email to establish a new password.
          </div>
        </div>
      </motion.div>
    </div>
  );
}
