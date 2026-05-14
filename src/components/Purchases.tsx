import React from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Calendar, 
  ClipboardList, 
  Truck,
  IndianRupee,
  ChevronDown,
  ChevronUp,
  X,
  Edit2,
  Trash2
} from 'lucide-react';
import { useStore, Product, Purchase } from '../store';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { SectionAudit } from './SectionAudit';
import { cn } from '../lib/utils';

export default function Purchases() {
  const { products, purchases, dailyStocks, addPurchase, updatePurchase, deletePurchase, settings } = useStore();
  const primaryColor = settings?.primaryColor || '#22D3EE';
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showModal, setShowModal] = React.useState(false);
  const [editingPurchase, setEditingPurchase] = React.useState<Purchase | null>(null);

  const activeDay = dailyStocks.find(d => d.status === 'OPEN');

  const filteredPurchases = purchases.filter(p => 
    p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tight">Stock Purchases</h2>
          <p className="text-slate-400 font-medium">Log inflow from suppliers and create batches</p>
        </div>
        <button 
          onClick={() => { setEditingPurchase(null); setShowModal(true); }}
          className="bg-primary text-slate-950 px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-primary hover:scale-105 active:scale-95 transition-all text-xs uppercase"
        >
          <Plus className="w-5 h-5" />
          NEW PURCHASE
        </button>
      </div>

      <div className="glass flex items-center gap-3 px-6 py-4 rounded-2xl mb-8">
        <Search className="w-5 h-5 text-slate-500" />
        <input 
          type="text" 
          placeholder="Search by invoice number or supplier..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none outline-none text-white w-full font-medium"
        />
      </div>

      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-left px-6">
              <th className="px-6 py-4">Inflow Data</th>
              <th className="px-6 py-4">Supplier</th>
              <th className="px-6 py-4">Ref Number</th>
              <th className="px-6 py-4">Quantity</th>
              <th className="px-6 py-4">Cost Basis</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPurchases.map((purchase) => {
              const product = products.find(p => p.id === purchase.productId);
              return (
                <tr key={purchase.id} className="glass group hover:border-primary/30 transition-all cursor-default">
                  <td className="px-6 py-6 rounded-l-[1.5rem] border-y border-l border-slate-500/10">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-500/10 rounded-xl flex items-center justify-center border border-slate-500/20">
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-black text-white uppercase tracking-tight leading-none">{product?.name || 'Unknown Item'}</p>
                        <p className="text-[10px] text-slate-500 font-bold mt-1.5">{format(new Date(purchase.timestamp), 'PP')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 border-y border-slate-500/10 font-bold text-slate-400">
                    {purchase.supplier}
                  </td>
                  <td className="px-6 py-6 border-y border-slate-500/10">
                    <span className="text-xs font-black text-slate-500 bg-slate-500/10 px-3 py-1.5 rounded-lg border border-slate-500/20">
                      #{purchase.invoiceNumber}
                    </span>
                  </td>
                  <td className="px-6 py-6 border-y border-slate-500/10 font-black text-white">
                    {purchase.quantity} <span className="text-[10px] text-slate-500">{product?.unitType}s</span>
                  </td>
                  <td className="px-6 py-6 border-y border-slate-500/10">
                    <div className="text-right inline-block">
                      <p className="text-sm font-black text-white">₹{purchase.totalAmount.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-500 font-bold tracking-tight mt-1">₹{purchase.unitCost} / unit</p>
                    </div>
                  </td>
                  <td className="px-6 py-6 border-y border-slate-500/10">
                    <span className={cn(
                      "text-[10px] font-black uppercase px-2.5 py-1 rounded-lg",
                      purchase.paymentStatus === 'Paid' ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-500"
                    )}>
                      {purchase.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-6 rounded-r-[1.5rem] border-y border-r border-slate-500/10">
                    <div className="flex items-center gap-2">
                       <button 
                          onClick={() => { setEditingPurchase(purchase); setShowModal(true); }}
                          className="p-2 text-slate-500 hover:text-white transition-colors"
                       >
                         <Edit2 className="w-4 h-4" />
                       </button>
                       <button 
                          onClick={async () => {
                            if (confirm('Delete this purchase? This will also remove the associated stock batch.')) {
                              await deletePurchase(purchase.id);
                            }
                          }}
                          className="p-2 text-slate-500 hover:text-rose-500 transition-colors"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredPurchases.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-slate-500/10 rounded-[3rem]">
            <Truck className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-500 font-black uppercase text-xs tracking-widest">No purchase records found</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <PurchaseModal purchase={editingPurchase} onClose={() => setShowModal(false)} />
        )}
      </AnimatePresence>

      <SectionAudit module="Purchases" />
    </div>
  );
}

function PurchaseModal({ purchase, onClose }: { purchase: Purchase | null, onClose: () => void }) {
  const { products, addPurchase, updatePurchase, settings } = useStore();
  const primaryColor = settings?.primaryColor || '#22D3EE';
  const [formData, setFormData] = React.useState({
    productId: purchase?.productId || '',
    invoiceNumber: purchase?.invoiceNumber || '',
    supplier: purchase?.supplier || '',
    quantity: purchase?.quantity || 0,
    unitCost: purchase?.unitCost || 0,
    paymentStatus: purchase?.paymentStatus || 'Paid' as 'Paid' | 'Pending'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (purchase) {
        await updatePurchase(purchase.id, formData);
      } else {
        await addPurchase(formData);
      }
      onClose();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass w-full max-w-2xl p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] max-h-[90vh] overflow-y-auto scrollbar-hide"
      >
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <Package className="text-primary w-6 h-6" />
            Stock Inflow
          </h3>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Select Product</label>
              <select 
                required
                value={formData.productId}
                onChange={e => {
                  const p = products.find(prod => prod.id === e.target.value);
                  setFormData({ ...formData, productId: e.target.value, unitCost: p?.industryPrice || 0 });
                }}
                className="w-full rounded-2xl px-6 py-4 outline-none focus:border-primary transition-colors font-medium appearance-none border"
              >
                <option value="">Choose item...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Invoice / Reference #</label>
              <input 
                required
                type="text" 
                value={formData.invoiceNumber}
                onChange={e => setFormData({ ...formData, invoiceNumber: e.target.value })}
                placeholder="REF-123456"
                className="w-full rounded-2xl px-6 py-4 outline-none focus:border-primary transition-colors font-medium border"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Supplier Name</label>
              <input 
                required
                type="text" 
                value={formData.supplier}
                onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="Ex: Wholesale Mart"
                className="w-full rounded-2xl px-6 py-4 outline-none focus:border-primary transition-colors font-medium border"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Inflow Status</label>
              <select 
                value={formData.paymentStatus}
                onChange={e => setFormData({ ...formData, paymentStatus: e.target.value as any })}
                className="w-full rounded-2xl px-6 py-4 outline-none focus:border-primary transition-colors font-medium appearance-none border"
              >
                <option value="Paid">Payment Completed</option>
                <option value="Pending">Payment Pending</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Quantity</label>
              <input 
                required
                type="number" 
                value={formData.quantity}
                onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="w-full rounded-2xl px-6 py-4 outline-none focus:border-primary transition-colors font-medium border"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Cost Per Unit</label>
              <div className="relative">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  required
                  type="number" 
                  value={formData.unitCost}
                  onChange={e => setFormData({ ...formData, unitCost: Number(e.target.value) })}
                  className="w-full rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-primary transition-colors font-medium border"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-500/5 p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-500/10">
            <div className="flex justify-between items-center text-center">
              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Valuation</p>
                <p className="text-2xl sm:text-3xl font-black text-white">₹{(formData.quantity * formData.unitCost).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-500/10 text-slate-500 font-black py-4 sm:py-5 rounded-2xl hover:bg-slate-500/20 transition-colors uppercase tracking-widest text-xs"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 bg-primary text-slate-950 font-black py-4 sm:py-5 rounded-2xl hover:opacity-90 transition-colors shadow-lg shadow-primary uppercase tracking-widest text-xs"
            >
              Confirm Purchase
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
