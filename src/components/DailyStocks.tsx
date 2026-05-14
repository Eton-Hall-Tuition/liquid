import React from 'react';
import { 
  CalendarDays, 
  Lock, 
  Unlock, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowRight,
  FileText,
  AlertCircle,
  History,
  Download,
  Edit2,
  Save,
  RotateCcw,
  X,
  CreditCard,
  QrCode,
  DollarSign,
  Users
} from 'lucide-react';
import { useStore, DailyStock } from '../store';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SectionAudit } from './SectionAudit';
import { cn } from '../lib/utils';

export function DailyStocks() {
  const { dailyStocks, openDay, closeDay, reopenDay, updateDailyRecord, currentUser, expenses, settings, users, sales } = useStore();
  const theme = settings?.theme || 'dark';
  const primaryColor = settings?.primaryColor || '#22D3EE';
  const [showConfirm, setShowConfirm] = React.useState<'open' | 'close' | null>(null);
  const [selectedDay, setSelectedDay] = React.useState<DailyStock | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editData, setEditData] = React.useState<Partial<DailyStock>>({});
  
  const [cashInput, setCashInput] = React.useState('');

  const activeDay = dailyStocks.find(d => d.status === 'OPEN');
  const pastDays = dailyStocks.filter(d => d.status === 'CLOSED');

  // Load last day's closing cash as default for new opening
  React.useEffect(() => {
    if (showConfirm === 'open') {
      const lastDay = dailyStocks.find(d => d.status === 'CLOSED');
      setCashInput((lastDay?.closingCash || 0).toString());
    }
  }, [showConfirm, dailyStocks]);

  const downloadJournal = (day: DailyStock) => {
    const doc = new jsPDF();
    const dayExpenses = expenses.filter(e => e.dailyStockId === day.id);

    // Title & Date
    doc.setFontSize(22).setFont('helvetica', 'bold');
    doc.text(settings?.shopName?.toUpperCase() || 'OPERATIONAL JOURNAL', 105, 20, { align: 'center' });
    doc.setFontSize(10).setFont('helvetica', 'normal');
    if (settings?.shopName) {
      doc.text('OPERATIONAL JOURNAL', 105, 28, { align: 'center' });
    }
    doc.text(`Date: ${format(new Date(day.date), 'dd/MM/yyyy')}`, 190, 20, { align: 'right' });

    // Main Stats Container
    doc.setDrawColor(200);
    doc.rect(15, 30, 180, 100); 

    const startX = 20;
    let startY = 40;
    const col2X = 185;

    const addRow = (label: string, value: string, isBold = false) => {
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.text(label, startX, startY);
      doc.text(value, col2X, startY, { align: 'right' });
      startY += 10;
    };

    const openedByUser = users.find(u => u.id === day.openedBy);
    const closedByUser = users.find(u => u.id === day.closedBy);

    addRow('Status', day.status, true);
    addRow('Date', format(new Date(day.date), 'dd/MM/yyyy'));
    addRow('Opened By', openedByUser?.name || 'Unknown');
    if (closedByUser) addRow('Closed By', closedByUser?.name || 'Unknown');
    addRow('Opening Valuation', `Rs. ${day.openingValuation.toLocaleString()}`);
    addRow('Opening Cash', `Rs. ${(day.openingCash || 0).toLocaleString()}`);
    addRow('Purchase Amount', `Rs. ${(day.totalPurchases || 0).toLocaleString()}`);
    addRow('Sales Amount', `Rs. ${(day.totalSales || 0).toLocaleString()}`);
    addRow('Expenses', `Rs. ${(day.totalExpenses || 0).toLocaleString()}`);
    
    doc.setDrawColor(230);
    doc.line(20, startY - 5, 190, startY - 5);
    
    addRow('SCAN PAY', `Rs. ${(day.paymentBreakdown?.qr || 0).toLocaleString()}`);
    addRow('Card PAY', `Rs. ${(day.paymentBreakdown?.card || 0).toLocaleString()}`);
    addRow('Cash (Net)', `Rs. ${(day.paymentBreakdown?.cash || 0).toLocaleString()}`);
    
    doc.setFontSize(12);
    addRow('Closing Cash (Actual)', `Rs. ${(day.closingCash || 0).toLocaleString()}`, true);

    // Staff Performance
    const daySales = sales.filter(s => s.dailyStockId === day.id);
    const performanceByMember = daySales.reduce((acc, sale) => {
      const staff = users.find(u => u.id === sale.processedBy)?.name || 'Unknown';
      acc[staff] = (acc[staff] || 0) + sale.totalAmount;
      return acc;
    }, {} as Record<string, number>);

    if (Object.keys(performanceByMember).length > 0) {
      doc.setFontSize(14);
      const perfY = Math.max(startY + 15, 145);
      doc.text('Staff Performance', 15, perfY);
      
      autoTable(doc, {
        startY: perfY + 5,
        head: [['Staff Name', 'Sales Processed']],
        body: Object.entries(performanceByMember).map(([name, amount]) => [name, `Rs. ${amount.toLocaleString()}`]),
        theme: 'grid',
        headStyles: { fillColor: [34, 211, 238], textColor: [15, 23, 42] },
        styles: { fontSize: 10, cellPadding: 5 }
      });
      startY = (doc as any).lastAutoTable.finalY + 15;
    } else {
      startY = Math.max(startY + 15, 145);
    }

    // Expenses Details
    doc.setFontSize(14);
    doc.text('Expenses Details', 15, startY);
    
    autoTable(doc, {
      startY: startY + 5,
      head: [['Details', 'Amount']],
      body: dayExpenses.map(e => [e.description, `Rs. ${e.amount.toLocaleString()}`]),
      theme: 'grid',
      headStyles: { fillColor: [34, 211, 238], textColor: [15, 23, 42] },
      styles: { fontSize: 10, cellPadding: 5 }
    });

    doc.save(`JOURNAL_${day.date}.pdf`);
  };

  const isAdmin = currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin';
  const canModify = isAdmin;

  const handleAction = async () => {
    if (!currentUser) return;
    if (showConfirm === 'open') {
      const amount = cashInput !== '' ? parseFloat(cashInput) : 0;
      await openDay(currentUser.id, amount);
    } else {
      const expected = (activeDay?.openingCash || 0) + (activeDay?.totalSales || 0) - (activeDay?.totalExpenses || 0);
      const amount = cashInput !== '' ? parseFloat(cashInput) : expected;
      await closeDay(currentUser.id, amount);
    }
    setShowConfirm(null);
    setCashInput('');
  };

  const handleConfirmClose = () => {
    if (activeDay) {
      const expected = (activeDay.openingCash || 0) + (activeDay.totalSales || 0) - (activeDay.totalExpenses || 0);
      setCashInput(expected.toString());
      setShowConfirm('close');
    }
  };

  const handleReopen = async (day: DailyStock) => {
    if (!currentUser) return;
    if (!isAdmin) {
      alert("Insufficient permissions to reopen past journals.");
      return;
    }
    if (activeDay) {
      alert("Please close the current active day before reopening a past day.");
      return;
    }
    await reopenDay(day.id, currentUser.id);
    setSelectedDay(null);
  };

  const saveEdits = async () => {
    if (!selectedDay || !currentUser) return;
    if (!isAdmin) return;
    await updateDailyRecord(selectedDay.id, currentUser.id, editData);
    setSelectedDay({ ...selectedDay, ...editData });
    setIsEditing(false);
  };

  const openSummary = (day: DailyStock) => {
    setSelectedDay(day);
    setEditData(day);
    setIsEditing(false);
  };

  return (
    <div className="space-y-12 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2 block" style={{ color: primaryColor }}>Operational Control</span>
          <h2 className={cn("text-5xl font-black uppercase tracking-tighter leading-none", theme === 'dark' ? "text-white" : "text-slate-900")}>Terminal Journal</h2>
        </div>
        
        {activeDay && (
          <button 
            onClick={handleConfirmClose}
            className="bg-rose-500 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all group"
          >
            <Lock className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            CLOSE DAY & LOCK DATA
          </button>
        )}
      </div>

      {!activeDay ? (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "glass p-16 rounded-[4rem] text-center relative overflow-hidden",
            theme === 'dark' ? "border-primary/10 shadow-3xl" : "bg-white border-slate-200 shadow-2xl"
          )}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" style={{ '--tw-gradient-via': `${primaryColor}33` } as any} />
          
          <div className="max-w-2xl mx-auto">
            <div className="w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl relative group" style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}>
              <div className="absolute inset-0 bg-primary/20 rounded-[2.5rem] blur-2xl group-hover:blur-3xl transition-all" style={{ backgroundColor: `${primaryColor}33` }} />
              <Unlock className="w-10 h-10 relative z-10" />
            </div>
            
            <h3 className={cn("text-4xl font-black mb-6 uppercase tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>
              Terminal Is Inactive
            </h3>
            
            <p className="text-slate-400 font-bold text-sm mb-12 uppercase tracking-[0.15em] leading-relaxed">
              Today's operational day has not been initialized.<br/>
              Please verify your opening cash balance to unlock the billing terminal and inventory actions.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button 
                onClick={() => setShowConfirm('open')}
                className="w-full sm:w-auto px-12 py-5 rounded-[2rem] font-black text-slate-950 text-sm uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all"
                style={{ backgroundColor: primaryColor, boxShadow: `0 20px 40px ${primaryColor}40` }}
              >
                Initialize Session
              </button>
              
              {pastDays[0] && (
                <div className="flex items-center gap-3 px-6 py-4 bg-slate-500/5 rounded-2xl border border-slate-500/10">
                  <RotateCcw className="w-4 h-4 text-slate-500" />
                  <div className="text-left">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Last Closing Cash</span>
                    <span className="text-xs font-black text-white">₹{pastDays[0].closingCash?.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-16 pt-16 border-t border-white/5 grid grid-cols-3 gap-8">
            <div className="text-center">
              <span className="block text-2xl font-black text-white">{pastDays.length}</span>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Total Journals</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-black text-emerald-400">₹{(pastDays.reduce((acc, curr) => acc + (curr.totalSales || 0), 0) / (pastDays.length || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Avg. Daily Rev</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-black text-primary" style={{ color: primaryColor }}>{format(new Date(), 'EEEE')}</span>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Current Day</span>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "glass p-10 rounded-[4rem] relative overflow-hidden transition-all border-primary/20",
            theme === 'dark' ? "shadow-inner" : "bg-white border-slate-200 shadow-xl"
          )}
        >
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <TrendingUp className="w-48 h-48" />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[2rem] flex items-center justify-center border shadow-xl" style={{ backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}20` }}>
                <CalendarDays className="w-8 h-8" style={{ color: primaryColor }} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <h3 className={cn("text-2xl font-black uppercase tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>Live Operation</h3>
                </div>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                  Session Active Since {format(new Date(activeDay.openedAt), 'hh:mm a')}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => downloadJournal(activeDay)}
                className="px-6 py-4 rounded-2xl transition-all flex items-center gap-3 font-black text-xs uppercase tracking-widest border border-white/5 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
              >
                <Download className="w-4 h-4" />
                Live Report
              </button>
              <div className="flex items-center gap-3 px-6 py-4 bg-primary/10 rounded-2xl border border-primary/20" style={{ backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}20` }}>
                <Users className="w-4 h-4 shadow-sm" style={{ color: primaryColor }} />
                <div className="text-left">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">In-Charge</span>
                  <span className="text-xs font-black text-white uppercase">{users.find(u => u.id === activeDay.openedBy)?.name}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-slate-950/40 border border-white/5 p-8 rounded-3xl overflow-hidden relative shadow-inner">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" style={{ backgroundColor: `${primaryColor}1a` }} />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 relative z-10">Real-time Revenue</p>
              <p className={cn("text-4xl font-black relative z-10 tracking-tighter", theme === 'dark' ? "text-white" : "text-slate-900")}>₹{activeDay.totalSales.toLocaleString()}</p>
              <div className="mt-4 flex items-center gap-2 text-emerald-400 text-[9px] font-black uppercase">
                <TrendingUp className="w-3 h-3" /> 
                {activeDay.totalSales > 0 ? "Tracking Upwards" : "Awaiting Sales"}
              </div>
            </div>
            
            <div className="bg-slate-950/40 border border-white/5 p-8 rounded-3xl group hover:border-primary/20 transition-colors">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Today's Purchases</p>
              <p className="text-4xl font-black text-primary tracking-tighter" style={{ color: primaryColor }}>₹{activeDay.totalPurchases.toLocaleString()}</p>
              <div className="mt-4 text-slate-600 text-[9px] font-black uppercase">{activeDay.totalPurchases > 0 ? "Stock replenished" : "No stock intake"}</div>
            </div>

            <div className="bg-slate-950/40 border border-white/5 p-8 rounded-3xl">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Live Expenses</p>
              <p className="text-4xl font-black text-rose-500 tracking-tighter">₹{activeDay.totalExpenses.toLocaleString()}</p>
              <div className="mt-4 text-rose-500/40 text-[9px] font-black uppercase">Operation Costs</div>
            </div>

            <div className="bg-slate-950/40 border border-white/5 p-8 rounded-3xl">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Opening Cash</p>
              <p className="text-4xl font-black text-emerald-400 tracking-tighter">₹{(activeDay.openingCash || 0).toLocaleString()}</p>
              <div className="mt-4 text-emerald-500/40 text-[9px] font-black uppercase">Verified Start</div>
            </div>

            <div className="bg-primary/5 border border-primary/20 p-8 rounded-3xl shadow-lg relative overflow-hidden" style={{ backgroundColor: `${primaryColor}0d`, borderColor: `${primaryColor}33` }}>
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <Wallet className="w-12 h-12" />
              </div>
              <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-3" style={{ color: primaryColor }}>Est. Cash Reserve</p>
              <p className={cn("text-4xl font-black tracking-tighter", theme === 'dark' ? "text-white" : "text-slate-900")}>
                ₹{((activeDay.openingCash || 0) + (activeDay.totalSales || 0) - (activeDay.totalExpenses || 0)).toLocaleString()}
              </p>
              <div className="mt-4 text-primary text-[9px] font-black uppercase" style={{ color: primaryColor }}>In-Hand Balance</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* History */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <History className="w-5 h-5 text-slate-500" />
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em]">Operational Journal</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pastDays.map(day => (
            <div 
              key={day.id} 
              onClick={() => openSummary(day)}
              className={cn(
                "glass p-8 rounded-[2.5rem] group transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] border relative overflow-hidden",
                theme === 'dark' ? "hover:border-primary/40 border-slate-800" : "bg-white border-slate-200 hover:border-primary shadow-lg"
              )}
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-all">
                <FileText className="w-24 h-24" />
              </div>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className={cn("text-xl font-black", theme === 'dark' ? "text-white" : "text-slate-900")}>{format(new Date(day.date), 'MMMM do, yyyy')}</h4>
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/10 px-2 py-1 rounded-md mt-1 inline-block">Closed</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); downloadJournal(day); }}
                  className="p-3 bg-slate-500/5 rounded-xl text-slate-500 hover:text-primary transition-colors border border-slate-500/10 group-hover:border-primary/20"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-8 border-t border-slate-500/10 pt-6">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Revenue</p>
                  <p className={cn("text-lg font-black", theme === 'dark' ? "text-white" : "text-slate-900")}>₹{day.totalSales.toLocaleString()}</p>
                </div>
                <div className="h-10 w-px bg-slate-500/10" />
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Closing Cash</p>
                  <p className="text-lg font-black text-primary" style={{ color: primaryColor }}>₹{(day.closingCash || 0).toLocaleString()}</p>
                </div>
                <div className="h-10 w-px bg-slate-500/10" />
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Profit Est.</p>
                  <p className="text-lg font-black text-emerald-400">₹{(day.totalSales * 0.15).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
          {pastDays.length === 0 && (
            <div className={cn(
              "col-span-full py-20 text-center border-2 border-dashed rounded-[3rem]",
              theme === 'dark' ? "border-slate-500/20" : "border-slate-200"
            )}>
              <CalendarDays className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">No finalized days in records</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal (Open/Close) */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setShowConfirm(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "relative glass w-full max-w-md p-10 rounded-[3rem] text-center",
                theme === 'light' && "bg-white border-slate-200"
              )}
            >
              <div className={cn(
                "w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl",
                showConfirm === 'open' ? "text-primary" : "bg-rose-500/20 text-rose-500"
              )} style={showConfirm === 'open' ? { backgroundColor: `${primaryColor}20`, color: primaryColor } : {}}>
                {showConfirm === 'open' ? <Unlock className="w-10 h-10" /> : <Lock className="w-10 h-10" />}
              </div>
              <h3 className={cn("text-3xl font-black mb-4 uppercase tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>
                {showConfirm === 'open' ? 'Initialize Day' : 'Seal Ledger'}
              </h3>
              
              <div className="mb-8 space-y-4">
                <p className="text-slate-400 font-medium leading-relaxed px-4 normal-case">
                  {showConfirm === 'open' 
                    ? 'Verify physical cash in hand before starting operations.'
                    : 'This session will be locked. Verify final cash balance before sealing the record.'}
                </p>
                
                <div className="relative group text-left">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">
                    {showConfirm === 'open' ? 'Opening Cash Balance (₹)' : 'Closing Cash in Hand (₹)'}
                  </label>
                  <div className="relative">
                    <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                    <input 
                      type="number"
                      value={cashInput}
                      onChange={e => setCashInput(e.target.value)}
                      placeholder={showConfirm === 'open' ? "Opening Balance" : "Closing Balance"}
                      className={cn(
                        "w-full rounded-2xl pl-12 pr-6 py-5 outline-none font-black text-lg transition-all border",
                        theme === 'dark' ? "bg-slate-950/50 border-slate-800 focus:border-primary" : "bg-slate-50 border-slate-200 focus:border-primary"
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowConfirm(null)}
                  className="bg-slate-500/5 text-slate-500 font-black py-5 rounded-2xl hover:bg-slate-500/10 transition-colors uppercase tracking-widest text-xs"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAction}
                  className={cn(
                    "font-black py-5 rounded-2xl transition-all shadow-xl active:scale-95 uppercase tracking-widest text-xs",
                    showConfirm === 'open' ? "text-slate-950" : "bg-rose-500 text-white shadow-rose-500/10"
                  )}
                  style={showConfirm === 'open' ? { backgroundColor: primaryColor, boxShadow: `0 10px 30px ${primaryColor}40` } : {}}
                >
                  {showConfirm === 'open' ? 'Confirm Open' : 'Confirm Close'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Day Summary & Edit Modal */}
      <AnimatePresence>
        {selectedDay && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
              onClick={() => setSelectedDay(null)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className={cn(
                "relative glass w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl",
                theme === 'light' && "bg-white border-slate-200"
              )}
            >
              {/* Header */}
              <div className={cn(
                "p-8 border-b flex items-center justify-between",
                theme === 'dark' ? "bg-slate-950/50 border-slate-800" : "bg-slate-50 border-slate-200"
              )}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={cn("text-2xl font-black uppercase tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>
                      Day Summary
                    </h3>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{format(new Date(selectedDay.date), 'EEEE, MMMM do, yyyy')}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedDay(null)}
                  className="p-3 rounded-xl hover:bg-slate-500/10 text-slate-500 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  {/* Financial Overview */}
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Financial Ledger</h4>
                    
                    <div className="space-y-4">
                      {[
                        { label: 'Opened By', value: users.find(u => u.id === selectedDay.openedBy)?.name || 'Unknown', icon: Users },
                        { label: 'Closed By', value: users.find(u => u.id === selectedDay.closedBy)?.name || 'Not Closed', icon: Lock },
                        { label: 'Opening Cash', key: 'openingCash', icon: Wallet, color: 'text-emerald-400' },
                        { label: 'Total Revenue', key: 'totalSales', icon: TrendingUp, color: 'text-primary' },
                        { label: 'Total Expenses', key: 'totalExpenses', icon: TrendingDown, color: 'text-rose-500' },
                        { label: 'Closing Cash', key: 'closingCash', icon: DollarSign, color: 'text-emerald-400' },
                      ].map(item => (
                        <div key={item.label} className={cn(
                          "flex items-center justify-between p-4 rounded-2xl border",
                          theme === 'dark' ? "bg-slate-900/50 border-slate-800/50" : "bg-slate-50 border-slate-200"
                        )}>
                          <div className="flex items-center gap-3">
                            <item.icon className="w-4 h-4 text-slate-500" />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
                          </div>
                          {item.key && isEditing ? (
                            <input 
                              type="number"
                              value={editData[item.key as keyof DailyStock] || ''}
                              onChange={e => setEditData({ ...editData, [item.key as string]: parseFloat(e.target.value) || 0 })}
                              className="w-24 text-right bg-transparent border-b border-primary/40 font-black text-primary outline-none"
                              style={{ color: primaryColor }}
                            />
                          ) : (
                            <span className={cn(
                              "font-black truncate max-w-[120px] text-right", 
                              item.key === 'totalSales' ? "text-primary" : (item.color || (theme === 'dark' ? "text-white" : "text-slate-900"))
                            )} style={item.key === 'totalSales' ? { color: primaryColor } : {}}>
                              {item.key 
                                ? `₹${(selectedDay[item.key as keyof DailyStock] as number || 0).toLocaleString()}`
                                : item.value
                              }
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Breakdown & Staff */}
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Channel Analysis</h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Cash', key: 'cash', icon: Wallet },
                        { label: 'QR', key: 'qr', icon: QrCode },
                        { label: 'Card', key: 'card', icon: CreditCard },
                      ].map(item => (
                        <div key={item.key} className={cn(
                          "flex flex-col p-4 rounded-2xl border",
                          theme === 'dark' ? "bg-slate-900/50 border-slate-800/50" : "bg-slate-50 border-slate-200"
                        )}>
                          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">{item.label}</span>
                          <span className={cn("font-black text-sm", theme === 'dark' ? "text-white" : "text-slate-900")}>
                            ₹{(selectedDay.paymentBreakdown?.[item.key as keyof typeof selectedDay.paymentBreakdown] || 0).toLocaleString()}
                          </span>
                        </div>
                      ))}
                      <div className={cn(
                        "flex flex-col p-4 rounded-2xl border",
                        theme === 'dark' ? "bg-primary/10 border-primary/20" : "bg-primary/5 border-primary/20"
                      )}>
                        <span className="text-[8px] font-bold text-primary uppercase tracking-widest mb-1">Valuation</span>
                        <span className="font-black text-sm text-primary" style={{ color: primaryColor }}>
                          ₹{selectedDay.closingValuation?.toLocaleString() || '---'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-6">Staff Contribution</h4>
                      <div className="max-h-40 overflow-y-auto pr-2 space-y-2">
                        {Object.entries(
                          sales.filter(s => s.dailyStockId === selectedDay.id).reduce((acc, sale) => {
                            const staffName = users.find(u => u.id === sale.processedBy)?.name || 'Unknown';
                            acc[staffName] = (acc[staffName] || 0) + sale.totalAmount;
                            return acc;
                          }, {} as Record<string, number>)
                        ).map(([name, amount]) => (
                          <div key={name} className="flex justify-between items-center text-xs">
                            <span className="text-slate-400 font-medium">{name}</span>
                            <span className={cn("font-black", theme === 'dark' ? "text-slate-200" : "text-slate-700")}>₹{amount.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Audit Context */}
                <div className="pt-6 border-t border-slate-500/10">
                   <div className="flex items-center gap-4 text-slate-500 mb-4 px-2">
                     <AlertCircle className="w-4 h-4" />
                     <p className="text-[9px] font-bold uppercase tracking-[0.1em] leading-relaxed">
                       Note: Manually editing day totals will update the current record and carry forward the closing cash to the next day's opening.
                     </p>
                   </div>
                </div>
              </div>

              {/* Actions */}
              <div className={cn(
                "p-8 border-t flex flex-wrap items-center gap-4",
                theme === 'dark' ? "bg-slate-950/50 border-slate-800" : "bg-slate-50 border-slate-200"
              )}>
                {isEditing ? (
                  <>
                    <button 
                      onClick={saveEdits}
                      className="px-6 py-3 text-slate-950 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Save className="w-4 h-4" /> Save Corrections
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-3 bg-slate-500/10 text-slate-500 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => downloadJournal(selectedDay)}
                      className="px-6 py-3 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Download className="w-4 h-4" /> Generate Day Invoice
                    </button>
                    {canModify && (
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="px-6 py-3 bg-slate-500/10 text-slate-500 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-500/20"
                      >
                        <Edit2 className="w-4 h-4" /> Modify Ledger
                      </button>
                    )}
                    {isAdmin && (
                      <button 
                        onClick={() => handleReopen(selectedDay)}
                        className="px-6 py-3 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-rose-500 hover:text-white transition-all ml-auto"
                      >
                        <RotateCcw className="w-4 h-4" /> Reopen Day
                      </button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SectionAudit module="Operational" />
    </div>
  );
}

