import React from 'react';
import { 
  Database, 
  Search, 
  Layers, 
  HardDrive, 
  AlertTriangle, 
  Clock,
  ArrowRight,
  ChevronDown,
  Edit3
} from 'lucide-react';
import { useStore, Batch, Product } from '../store';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { SectionAudit } from './SectionAudit';
import { cn } from '../lib/utils';

export default function Storage() {
  const { batches, products, updateStockManually, settings } = useStore();
  const primaryColor = settings?.primaryColor || '#22D3EE';
  const [searchTerm, setSearchTerm] = React.useState('');
  const [expandedProduct, setExpandedProduct] = React.useState<string | null>(null);
  const [editingStock, setEditingStock] = React.useState<string | null>(null);
  const [newStockValue, setNewStockValue] = React.useState('');
  const [correctionReason, setCorrectionReason] = React.useState('');

  const stockSummary = products.map(p => {
    const productBatches = batches.filter(b => b.productId === p.id && b.currentQuantity > 0);
    const totalQty = productBatches.reduce((acc, b) => acc + b.currentQuantity, 0);
    return { ...p, totalQty, productBatches };
  }).filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleManualUpdate = async (productId: string) => {
    const val = parseInt(newStockValue);
    if (isNaN(val) || val < 0) {
      alert('Please enter a valid stock number');
      return;
    }
    await updateStockManually(productId, val, correctionReason || 'Manual inventory audit');
    setEditingStock(null);
    setNewStockValue('');
    setCorrectionReason('');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tight">Active Storage</h2>
          <p className="text-slate-400 font-medium">Batch-level inventory with FIFO tracking</p>
        </div>
        <div className="flex items-center gap-4 glass px-6 py-4 rounded-3xl">
          <Database className="w-5 h-5 text-primary" />
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Total Stock Value</p>
            <p className="text-xl font-black text-white mt-1">₹{batches.reduce((acc, b) => acc + (b.currentQuantity * b.unitCost), 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="glass flex items-center gap-3 px-6 py-4 rounded-2xl mb-8">
        <Search className="w-5 h-5 text-slate-500" />
        <input 
          type="text" 
          placeholder="Filter storage by product name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none outline-none text-white w-full font-medium"
        />
      </div>

      <div className="space-y-4">
        {stockSummary.map((item) => (
          <div key={item.id} className="glass rounded-[2rem] overflow-hidden transition-all">
            <div 
              className={cn(
                "p-6 flex items-center justify-between cursor-pointer hover:bg-slate-500/5 transition-colors",
                expandedProduct === item.id && "bg-slate-500/10"
              )}
              onClick={() => setExpandedProduct(expandedProduct === item.id ? null : item.id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-500/10 rounded-2xl flex items-center justify-center border border-slate-500/20">
                  <HardDrive className={cn("w-6 h-6", item.totalQty > 0 ? "text-primary" : "text-rose-500")} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">{item.name}</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.category}</p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Available</p>
                  <p className={cn(
                    "text-2xl font-black mt-1",
                    item.totalQty < 10 ? "text-rose-500" : "text-white"
                  )}>
                    {item.totalQty} <span className="text-xs text-slate-500">{item.unitType}s</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingStock(item.id);
                      setNewStockValue(item.totalQty.toString());
                    }}
                    className="w-8 h-8 rounded-full bg-slate-500/10 border border-slate-500/20 flex items-center justify-center text-slate-500 hover:text-primary transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <div className="w-8 h-8 rounded-full bg-slate-500/10 border border-slate-500/20 flex items-center justify-center text-slate-500">
                    <ChevronDown className={cn("w-5 h-5 transition-transform", expandedProduct === item.id && "rotate-180")} />
                  </div>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {expandedProduct === item.id && (
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="bg-slate-500/5 border-t border-slate-500/10"
                >
                  <div className="p-6 space-y-3">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Batch Distribution (FIFO ORDER)</p>
                    {item.productBatches.length > 0 ? item.productBatches.map((batch, i) => (
                      <div key={batch.id} className="flex items-center justify-between p-4 bg-slate-500/5 rounded-2xl border border-slate-500/10">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-500/10 rounded-xl flex items-center justify-center text-[10px] font-black text-primary">
                            #{i + 1}
                          </div>
                          <div>
                            <p className="text-xs font-black text-white uppercase">Batch {batch.id.split('-')[1]}</p>
                            <p className="text-[10px] text-slate-500 font-bold">Acquired: {format(new Date(batch.timestamp), 'PP')}</p>
                          </div>
                        </div>
                        <div className="flex gap-10">
                          <div className="text-right">
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Unit Cost</p>
                            <p className="text-sm font-black text-white">₹{batch.unitCost}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Qty Left</p>
                            <p className="text-sm font-black text-primary">{batch.currentQuantity}</p>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="flex flex-col items-center justify-center py-10 opacity-30 italic">
                        <AlertTriangle className="w-8 h-8 mb-2" />
                        <p className="text-xs">Out of stock in all batches</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {editingStock && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingStock(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md glass rounded-[3rem] p-10 relative z-10"
            >
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-8">Stock Correction</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">New Total Units</label>
                  <input 
                    type="number"
                    value={newStockValue}
                    onChange={(e) => setNewStockValue(e.target.value)}
                    className="w-full rounded-2xl px-6 py-4 outline-none focus:border-primary transition-colors font-bold border"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Reason for Adjustment</label>
                  <input 
                    type="text"
                    placeholder="e.g. Broken units, physical count audit..."
                    value={correctionReason}
                    onChange={(e) => setCorrectionReason(e.target.value)}
                    className="w-full rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:border-primary transition-colors border"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setEditingStock(null)} className="flex-1 py-4 px-6 rounded-2xl border text-[10px] font-black uppercase text-slate-500 hover:text-white transition-all">Cancel</button>
                  <button 
                    onClick={() => editingStock && handleManualUpdate(editingStock)}
                    className="flex-1 py-4 px-6 rounded-2xl bg-primary text-slate-950 text-[10px] font-black uppercase shadow-xl shadow-primary hover:scale-[1.02] active:scale-95 transition-all text-center"
                  >
                    Commit Change
                  </button>
                </div>
                <p className="text-[9px] text-rose-500 font-bold uppercase tracking-widest text-center mt-4">Warning: This overrides FIFO historical data for reconciliation.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SectionAudit module="Inventory" />
    </div>
  );
}
