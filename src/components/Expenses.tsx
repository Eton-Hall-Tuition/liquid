import React from 'react';
import { 
  Plus, 
  Search, 
  Receipt, 
  DollarSign, 
  Tag, 
  CreditCard, 
  Wallet,
  X,
  History,
  TrendingDown,
  ChevronRight,
  Edit2,
  Trash2
} from 'lucide-react';
import { useStore, Expense } from '../store';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { SectionAudit } from './SectionAudit';
import { cn } from '../lib/utils';

export default function Expenses() {
  const { expenses, addExpense, updateExpense, deleteExpense, dailyStocks, settings } = useStore();
  const theme = settings?.theme || 'dark';
  const primaryColor = settings?.primaryColor || '#22D3EE';
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showModal, setShowModal] = React.useState(false);
  const [editingExpense, setEditingExpense] = React.useState<Expense | null>(null);

  const activeDay = dailyStocks.find(d => d.status === 'OPEN');

  const filteredExpenses = expenses.filter(e => 
    e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 uppercase tracking-tight">
        <div>
          <h2 className={cn("text-4xl font-black group underline decoration-4 underline-offset-8", theme === 'dark' ? "text-white decoration-rose-500/20" : "text-slate-900 decoration-rose-500/40")}>
            Outflow Tracker
          </h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Monitor operational costs</p>
        </div>
        <button 
          onClick={() => { setEditingExpense(null); setShowModal(true); }}
          className="bg-rose-500 text-white px-8 py-5 rounded-[2rem] font-black flex items-center gap-2 shadow-xl shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all text-[10px] uppercase tracking-[0.2em]"
        >
          <Plus className="w-5 h-5 shadow-sm" />
          Record Expenditure
        </button>
      </div>

      {/* Stats and Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className={cn(
          "glass p-10 rounded-[3rem] relative overflow-hidden group transition-all hover:border-rose-500/20",
          theme === 'light' && "bg-white shadow-xl border-slate-200"
        )}>
           <div className="absolute -right-8 -top-8 text-rose-500/5 transition-transform group-hover:scale-110 group-hover:-rotate-12">
              <TrendingDown className="w-32 h-32" />
            </div>
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-6 shadow-sm border border-rose-500/5">
            <TrendingDown className="w-6 h-6 text-rose-500" />
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Active Session Outflow</p>
          <h3 className={cn("text-3xl font-black text-white tracking-tighter", theme === 'light' && "text-slate-900")}>₹{activeDay?.totalExpenses.toLocaleString() || '0'}</h3>
        </div>
        <div className={cn(
          "md:col-span-2 glass p-10 rounded-[3.5rem] flex items-center gap-8",
          theme === 'light' && "bg-white shadow-xl border-slate-200"
        )}>
          <div className="flex-1">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Search Outflows</p>
            <div className={cn(
              "flex items-center gap-4 px-6 py-5 rounded-[2rem] border transition-all focus-within:ring-2",
              theme === 'dark' ? "bg-slate-950/50 border-white/5 ring-primary/10" : "bg-slate-50 border-slate-200 ring-primary/20 shadow-inner"
            )}>
              <Search className="w-5 h-5 text-slate-600" />
              <input 
                type="text" 
                placeholder="Description or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-white w-full text-sm font-black uppercase tracking-tight placeholder:text-slate-600"
              />
            </div>
          </div>
        </div>
      </div>

      <div className={cn(
        "glass rounded-[3.5rem] overflow-hidden",
        theme === 'light' && "bg-white shadow-2xl border-slate-200"
      )}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={cn(
                "border-b uppercase tracking-[0.2em]",
                theme === 'dark' ? "border-white/5 bg-white/[0.02]" : "border-slate-100 bg-slate-50/50"
              )}>
                <th className="px-10 py-6 text-[10px] font-black text-slate-500">Timeline</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-500">Narration</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-500">Category</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-500">Settlement</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-500 text-right">Value</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-500 text-center">Process</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-white/[0.02] transition-all group">
                  <td className="px-10 py-6">
                    <p className={cn("text-xs font-black uppercase tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>{format(new Date(expense.timestamp), 'PP')}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase mt-1 opacity-60">{format(new Date(expense.timestamp), 'HH:mm')}</p>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-500/5 border border-white/5 flex items-center justify-center shadow-sm">
                        <Receipt className="w-4 h-4 text-rose-500" />
                      </div>
                      <span className={cn("text-sm font-black uppercase tracking-tight truncate max-w-[250px]", theme === 'dark' ? "text-slate-300" : "text-slate-700")}>{expense.description}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-500/10 px-3 py-1.5 rounded-lg border border-white/5">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-2">
                       <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center border", expense.paymentMethod === 'Cash' ? "bg-emerald-500/10 border-emerald-500/20" : "bg-indigo-500/10 border-indigo-500/20")}>
                        {expense.paymentMethod === 'Cash' ? <Wallet className="w-3 h-3 text-emerald-500" /> : <CreditCard className="w-3 h-3 text-indigo-500" />}
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{expense.paymentMethod}</span>
                    </div>
                  </td>
                  <td className={cn("px-10 py-6 text-right font-black text-lg tracking-tighter", theme === 'dark' ? "text-white" : "text-slate-900")}>
                    ₹{expense.amount.toLocaleString()}
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center justify-center gap-3">
                      <button 
                         onClick={() => { setEditingExpense(expense); setShowModal(true); }}
                         className="p-3 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                         onClick={async () => {
                           if (confirm('Permanently remove this expense record?')) {
                             await deleteExpense(expense.id);
                           }
                         }}
                         className="p-3 text-slate-500 hover:text-rose-500 hover:bg-rose-500/5 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredExpenses.length === 0 && (
            <div className="py-24 text-center opacity-20">
              <History className="w-16 h-16 text-slate-500 mx-auto mb-6" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Terminal Void: No Records Found</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <ExpenseModal expense={editingExpense} onClose={() => setShowModal(false)} />
        )}
      </AnimatePresence>

      <div className="pt-16 border-t border-white/5">
        <h2 className="text-xs font-black text-slate-600 uppercase tracking-[0.3em] mb-10 text-center">Expenditure Audit Trail</h2>
        <SectionAudit module="Expenses" />
      </div>
    </div>
  );
}

function ExpenseModal({ expense, onClose }: { expense: Expense | null, onClose: () => void }) {
  const { addExpense, updateExpense, settings } = useStore();
  const theme = settings?.theme || 'dark';
  const primaryColor = settings?.primaryColor || '#22D3EE';
  const [formData, setFormData] = React.useState({
    description: expense?.description || '',
    amount: expense?.amount || 0,
    category: expense?.category || 'Operational',
    paymentMethod: expense?.paymentMethod || 'Cash' as 'Cash' | 'QR' | 'Card'
  });

  const categories = ['Operational', 'Maintenance', 'Rent', 'Electricity', 'Water', 'Marketing', 'Others'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (expense) {
        await updateExpense(expense.id, formData);
      } else {
        await addExpense(formData);
      }
      onClose();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className={cn(
          "glass w-full max-w-2xl p-12 rounded-[4rem] relative overflow-hidden",
          theme === 'light' && "bg-white shadow-2xl border-slate-200"
        )}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-rose-500/50" />
        
        <div className="flex items-center justify-between mb-12">
          <div>
            <h3 className={cn("text-3xl font-black uppercase tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>Seize Outflow</h3>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Record financial commitment</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Expenditure Narrative</label>
            <input 
              required
              type="text" 
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ex: Unit electricity settlement..."
              className={cn(
                "w-full rounded-[2rem] px-8 py-5 outline-none transition-all font-black uppercase tracking-tight text-sm border focus:ring-2 ring-rose-500/20",
                theme === 'dark' ? "bg-slate-950/50 border-white/5 focus:border-rose-500/40" : "bg-slate-50 border-slate-200 focus:border-rose-500/40"
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Monetary Value</label>
              <div className="relative group">
                <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-rose-500 transition-colors" />
                <input 
                  required
                  type="number" 
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className={cn(
                    "w-full rounded-[2rem] pl-16 pr-8 py-5 outline-none transition-all font-black text-lg tracking-tighter border focus:ring-2 ring-rose-500/20",
                    theme === 'dark' ? "bg-slate-950/50 border-white/5 focus:border-rose-500/40" : "bg-slate-50 border-slate-200 focus:border-rose-500/40"
                  )}
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Cost Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className={cn(
                  "w-full rounded-[2rem] px-8 py-5 outline-none transition-all font-black uppercase tracking-widest text-[10px] appearance-none border focus:ring-2 ring-rose-500/20",
                  theme === 'dark' ? "bg-slate-950/50 border-white/5 focus:border-rose-500/40" : "bg-slate-50 border-slate-200 focus:border-rose-500/40"
                )}
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Funding Interface</p>
            <div className="grid grid-cols-3 gap-4">
              {['Cash', 'QR', 'Card'].map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: method as any })}
                  className={cn(
                    "py-5 rounded-2xl border font-black text-[10px] uppercase tracking-[0.2em] transition-all",
                    formData.paymentMethod === method 
                      ? "bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20" 
                      : (theme === 'dark' ? "bg-white/5 border-white/5 text-slate-500 hover:text-white" : "bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600")
                  )}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-6 pt-6">
            <button 
              type="button"
              onClick={onClose}
              className={cn(
                "flex-1 py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all border",
                theme === 'dark' ? "bg-white/5 border-white/5 text-slate-500 hover:text-white" : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-white"
              )}
            >
              Abort Process
            </button>
            <button 
              type="submit"
              className="flex-[2] bg-rose-500 text-white font-black py-6 rounded-[2rem] hover:bg-rose-600 transition-all shadow-2xl shadow-rose-500/30 uppercase tracking-[0.2em] text-[10px]"
            >
              Finalize Commitment
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
