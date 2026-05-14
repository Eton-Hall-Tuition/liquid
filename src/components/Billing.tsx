import React from 'react';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight,
  Package,
  Download,
  AlertCircle,
  Banknote,
  Receipt,
  Lock
} from 'lucide-react';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { SectionAudit } from './SectionAudit';
import { cn } from '../lib/utils';
import jsPDF from 'jspdf';

export default function Billing() {
  const { 
    products, 
    batches, 
    processSale, 
    recordManualSale, 
    openDay,
    currentUser, 
    settings, 
    sales, 
    users, 
    dailyStocks 
  } = useStore();

  const primaryColor = settings?.primaryColor || '#22D3EE';
  const [searchTerm, setSearchTerm] = React.useState('');
  const [cart, setCart] = React.useState<{ productId: string, quantity: number }[]>([]);
  const [paymentMethod, setPaymentMethod] = React.useState<'Cash' | 'QR' | 'Card'>('Cash');
  const [quickRevenue, setQuickRevenue] = React.useState('');
  const [checkoutLoading, setCheckoutLoading] = React.useState(false);
  const [openingCashInput, setOpeningCashInput] = React.useState('');

  const lastClosedDay = dailyStocks.find(d => d.status === 'CLOSED');
  const suggestedCash = lastClosedDay?.closingCash || 0;

  const handleQuickOpen = async () => {
    if (!currentUser) return;
    await openDay(currentUser.id, openingCashInput !== '' ? parseFloat(openingCashInput) : suggestedCash);
  };

  const filteredProducts = products.filter(p => 
    p.status === 'Active' && 
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStock = (productId: string) => {
    return batches
      .filter(b => b.productId === productId)
      .reduce((acc, b) => acc + b.currentQuantity, 0);
  };

  const activeDay = dailyStocks.find(d => d.status === 'OPEN');

  const downloadInvoice = (saleId: string) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;

    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: [80, 150] });
    const centerX = 40;
    
    doc.setFont('helvetica', 'bold').setFontSize(14);
    doc.text(settings?.shopName || 'POS TERMINAL', centerX, 15, { align: 'center' });
    
    doc.setFont('helvetica', 'normal').setFontSize(8);
    doc.text(`TRX: ${sale.id}`, centerX, 20, { align: 'center' });
    doc.text(format(new Date(sale.timestamp), 'dd MMM yyyy, HH:mm'), centerX, 24, { align: 'center' });
    
    doc.setDrawColor(200).line(5, 28, 75, 28);

    let y = 35;
    doc.setFont('helvetica', 'bold').text('DESCRIPTION', 5, y);
    doc.text('TOTAL', 75, y, { align: 'right' });
    y += 5;

    doc.setFont('helvetica', 'normal');
    if (sale.items.length > 0) {
      sale.items.forEach(item => {
        const titleLines = doc.splitTextToSize(item.name, 50);
        doc.text(titleLines, 5, y);
        doc.text(`Rs. ${item.total.toLocaleString()}`, 75, y, { align: 'right' });
        y += (titleLines.length * 4);
        doc.setFontSize(7);
        doc.text(`${item.quantity} x Rs. ${(item.total / item.quantity).toLocaleString()}`, 5, y + 1);
        doc.setFontSize(8);
        y += 6;
      });
    } else {
      doc.text('EXPECTED REVENUE ENTRY', 5, y);
      doc.text(`Rs. ${sale.totalAmount.toLocaleString()}`, 75, y, { align: 'right' });
      y += 6;
    }

    doc.line(5, y, 75, y).setFontSize(10).setFont('helvetica', 'bold');
    y += 8;
    doc.text('GRAND TOTAL', 5, y);
    doc.text(`Rs. ${sale.totalAmount.toLocaleString()}`, 75, y, { align: 'right' });
    
    y += 8;
    doc.setFontSize(8).setFont('helvetica', 'normal');
    doc.text(`Method: ${sale.paymentMethod}`, 5, y);
    doc.text(`Staff: ${users.find(u => u.id === sale.processedBy)?.name || 'N/A'}`, 75, y, { align: 'right' });

    y += 15;
    doc.setFont('helvetica', 'italic').setFontSize(7);
    doc.text('Thank you for choosing us!', centerX, y, { align: 'center' });

    doc.save(`BILL_${sale.id}.pdf`);
  };

  const addToCart = (productId: string) => {
    const available = getStock(productId);
    const existing = cart.find(item => item.productId === productId);
    if (existing) {
      if (existing.quantity < available) {
        setCart(cart.map(item => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item));
      }
    } else if (available > 0) {
      setCart([...cart, { productId, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    const available = getStock(productId);
    setCart(cart.map(item => 
      item.productId === productId ? { ...item, quantity: Math.max(1, Math.min(available, item.quantity + delta)) } : item
    ));
  };

  const handleQtyInput = (productId: string, val: string) => {
    const qty = Math.max(0, parseInt(val) || 0);
    const available = getStock(productId);
    setCart(cart.map(item => 
      item.productId === productId ? { ...item, quantity: Math.min(available, qty) } : item
    ).filter(i => i.quantity > 0)); 
  };

  const cartTotal = cart.reduce((acc, item) => {
    const p = products.find(prod => prod.id === item.productId);
    return acc + (item.quantity * (p?.sellingPrice || 0));
  }, 0);

  const handleCheckout = async (download: boolean) => {
    if (!currentUser || !activeDay) {
      return;
    }

    const manualVal = parseFloat(quickRevenue) || 0;
    if (cart.length === 0 && manualVal <= 0) return;

    setCheckoutLoading(true);
    try {
      let saleId = '';
      if (cart.length > 0) {
        saleId = await processSale({ paymentMethod, processedBy: currentUser.id }, cart);
        setCart([]);
      }
      if (manualVal > 0) {
        const mId = await recordManualSale(manualVal, paymentMethod, "Direct Expected Revenue Entry");
        if (!saleId) saleId = mId;
        setQuickRevenue('');
      }
      if (download && saleId) {
        setTimeout(() => downloadInvoice(saleId), 500);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const total = cartTotal + (parseFloat(quickRevenue) || 0);

  return (
    <div className="space-y-12 pb-24 relative">
      <div className={cn("grid grid-cols-12 gap-8 lg:min-h-[700px] transition-all")}>
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Billing Terminal</h1>
            <div className="glass flex items-center gap-3 px-4 py-3 rounded-2xl w-full sm:w-80 focus-within:ring-2 ring-primary/20 transition-all">
              <Search className="w-4 h-4 text-slate-500" />
              <input 
                type="text" placeholder="Quick search products..." value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-xs font-bold text-white w-full"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide max-h-[800px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.map(p => {
                const stock = getStock(p.id);
                return (
                  <button key={p.id} onClick={() => addToCart(p.id)} disabled={stock === 0 || !activeDay}
                    className="glass p-5 rounded-[2rem] text-left hover:border-primary/40 transition-all disabled:opacity-30 disabled:grayscale group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="p-1.5 bg-primary rounded-lg text-slate-950">
                        <Plus className="w-3 h-3" />
                      </div>
                    </div>
                    <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest bg-slate-500/10 px-2 py-1 rounded-lg border border-slate-500/10">{p.category}</span>
                    <h3 className="text-xs font-black text-white uppercase tracking-tight mt-3 truncate">{p.name}</h3>
                    <div className="flex justify-between items-end mt-6">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-slate-500 uppercase">Price</span>
                        <p className="text-sm font-black text-white">₹{p.sellingPrice.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] font-bold text-slate-500 uppercase">Stock</span>
                        <p className={cn("text-[9px] font-black", stock < 10 ? "text-rose-500" : "text-slate-400")}>{stock} PCS</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {filteredProducts.length === 0 && (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500">
                <Search className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-xs font-black uppercase tracking-widest opacity-40">No products found</p>
              </div>
            )}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <div className="glass rounded-[3rem] flex-1 flex flex-col overflow-hidden border-primary/10 lg:sticky lg:top-24">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xs font-black text-white uppercase tracking-widest">Active Cart</h3>
              </div>
              <span className="text-[10px] font-black px-3 py-1.5 bg-white/5 rounded-xl text-slate-400 border border-white/5">{cart.length} ITEMS</span>
            </div>
            
            <div className="p-5 border-b border-white/5 bg-white/5 space-y-4">
              <div className="relative group">
                <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-rose-500 transition-colors" />
                <input 
                  type="number" value={quickRevenue} onChange={e => setQuickRevenue(e.target.value)}
                  placeholder="DIRECT REVENUE (MANUAL)"
                  className="w-full bg-slate-500/10 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-xs font-black text-white outline-none focus:border-rose-500/40 transition-all placeholder:text-slate-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-hide max-h-[400px]">
              {cart.map(item => {
                const p = products.find(prod => prod.id === item.productId);
                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={item.productId} 
                    className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-colors"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-[11px] font-black text-white uppercase truncate">{p?.name}</p>
                      <p className="text-[10px] font-bold text-slate-500 mt-1">₹{p?.sellingPrice?.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800">
                        <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 px-2 text-slate-500 hover:text-white transition-colors"><Minus className="w-3 h-3" /></button>
                        <input 
                          type="number" value={item.quantity} onChange={e => handleQtyInput(item.productId, e.target.value)}
                          className="w-10 text-center text-xs font-black text-white bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 px-2 text-slate-500 hover:text-white transition-colors"><Plus className="w-3 h-3" /></button>
                      </div>
                      <button onClick={() => setCart(cart.filter(c => c.productId !== item.productId))} className="p-2 text-slate-600 hover:text-rose-500 transition-colors hover:bg-rose-500/10 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </motion.div>
                );
              })}
              {cart.length === 0 && !quickRevenue && (
                <div className="h-full flex flex-col items-center justify-center opacity-20 py-12 text-center">
                  <Package className="w-10 h-10 mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-balance">Empty Cart Waiting<br/>for Transaction</p>
                </div>
              )}
            </div>

            <div className="p-8 bg-white/5 border-t border-white/5 space-y-6">
              <div className="flex gap-2 p-1 bg-slate-950 rounded-2xl border border-white/5">
                {['Cash', 'QR', 'Card'].map(m => (
                  <button key={m} onClick={() => setPaymentMethod(m as any)}
                    className={cn(
                      "flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", 
                      paymentMethod === m ? "bg-white text-slate-950 shadow-lg" : "text-slate-500 hover:text-white"
                    )}
                  >{m}</button>
                ))}
              </div>
              
              <div className="flex justify-between items-end border-b border-white/5 pb-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Payable</span>
                  <span className="text-4xl font-black text-white tracking-tighter">₹{total.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  disabled={total <= 0 || !activeDay || checkoutLoading} 
                  onClick={() => handleCheckout(false)}
                  className="flex-1 bg-white text-slate-950 font-black py-5 rounded-2xl flex items-center justify-center gap-3 uppercase tracking-widest text-[11px] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 shadow-xl"
                >
                  {checkoutLoading ? "PROCESSING..." : "COMMIT SALE"} <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  disabled={total <= 0 || !activeDay || checkoutLoading} 
                  onClick={() => handleCheckout(true)}
                  className="w-16 bg-primary text-slate-950 rounded-2xl hover:scale-[1.05] active:scale-90 transition-all disabled:opacity-30 flex items-center justify-center shadow-lg shadow-primary/20" 
                  title="Generate Receipt and Commit"
                >
                  <Download className="w-6 h-6" />
                </button>
              </div>

              {!activeDay && (
                <div className="flex items-center gap-2 justify-center py-2 px-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                  <AlertCircle className="w-3 h-3 text-rose-500" />
                  <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest">Initialize Operational Day to Transact</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-16 border-t border-white/5">
        <h2 className="text-xs font-black text-slate-600 uppercase tracking-[0.3em] mb-10 text-center">Module Audit Trail</h2>
        <SectionAudit module={["Billing", "Inventory"]} />
      </div>
    </div>

  );
}
