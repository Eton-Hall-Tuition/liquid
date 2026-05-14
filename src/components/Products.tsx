import React from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Package, 
  Tag, 
  DollarSign,
  Filter,
  TrendingUp,
  X
} from 'lucide-react';
import { useStore, Product } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { SectionAudit } from './SectionAudit';
import { cn } from '../lib/utils';

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct, settings } = useStore();
  const primaryColor = settings?.primaryColor || '#22D3EE';
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showModal, setShowModal] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tight">Product Registry</h2>
          <p className="text-slate-400 font-medium">Define items, set margins, and manage prices</p>
        </div>
        <button 
          onClick={() => { setEditingProduct(null); setShowModal(true); }}
          className="bg-primary text-slate-950 px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-primary hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
          ADD PRODUCT
        </button>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="flex-1 glass flex items-center gap-3 px-6 py-4 rounded-2xl">
          <Search className="w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search products or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-white w-full font-medium"
          />
        </div>
        <button className="glass p-4 rounded-2xl text-slate-500 hover:text-white transition-colors">
          <Filter className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <motion.div 
            layout
            key={product.id}
            className="glass p-6 rounded-[2.5rem] group hover:border-primary/30 transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Package className="w-20 h-20" />
            </div>

            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-slate-950/20 rounded-2xl flex items-center justify-center border border-slate-800/20">
                <Tag className="w-6 h-6 text-primary" />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setEditingProduct(product); setShowModal(true); }}
                  className="p-2 text-slate-500 hover:text-white transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={async () => {
                    if (confirm('Are you sure you want to delete this product?')) {
                      await deleteProduct(product.id);
                    }
                  }}
                  className="p-2 text-slate-500 hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-1 rounded-md mb-2 inline-block">
                {product.category}
              </span>
              <h3 className="text-xl font-black text-white leading-tight uppercase tracking-tight">{product.name}</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-800/20 pt-6">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Selling Price</p>
                <p className="text-xl font-black text-white">₹{product.sellingPrice}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Gain / Unit</p>
                <p className="text-xl font-black text-emerald-400">₹{product.gainPerUnit}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Margin: <span className="text-white">{product.marginPercentage.toFixed(1)}%</span>
                </span>
                <span className={cn(
                  "text-[8px] font-black uppercase px-2 py-0.5 rounded-full ml-2",
                  product.status === 'Active' ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800/20 text-slate-500 font-bold"
                )}>
                  {product.status}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <ProductModal 
            product={editingProduct} 
            onClose={() => setShowModal(false)} 
          />
        )}
      </AnimatePresence>

      <SectionAudit module="Products" />
    </div>
  );
}

function ProductModal({ product, onClose }: { product: Product | null, onClose: () => void }) {
  const { addProduct, updateProduct, settings } = useStore();
  const [formData, setFormData] = React.useState({
    name: product?.name || '',
    category: product?.category || '',
    unitType: product?.unitType || 'unit',
    industryPrice: product?.industryPrice || 0,
    sellingPrice: product?.sellingPrice || 0,
    status: product?.status || 'Active'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (product) {
      await updateProduct(product.id, formData);
    } else {
      await addProduct(formData as any);
    }
    onClose();
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
          <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            {product ? 'Edit Product' : 'Define New Product'}
          </h3>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Product Name</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Coca Cola 500ml"
                className="w-full rounded-2xl px-6 py-4 outline-none focus:border-primary transition-colors font-medium border"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
              <input 
                required
                type="text" 
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ex: Soft Drinks"
                className="w-full rounded-2xl px-6 py-4 outline-none focus:border-primary transition-colors font-medium border"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Industry Price</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  required
                  type="number" 
                  value={formData.industryPrice}
                  onChange={e => setFormData({ ...formData, industryPrice: Number(e.target.value) })}
                  className="w-full rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-primary transition-colors font-medium border"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Selling Price</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  required
                  type="number" 
                  value={formData.sellingPrice}
                  onChange={e => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                  className="w-full rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-primary transition-colors font-medium border"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Unit Type</label>
              <select 
                value={formData.unitType}
                onChange={e => setFormData({ ...formData, unitType: e.target.value as 'unit' | 'ml' })}
                className="w-full rounded-2xl px-6 py-4 outline-none focus:border-primary transition-colors font-medium appearance-none border"
              >
                <option value="unit">Per Unit</option>
                <option value="ml">Per ML</option>
              </select>
            </div>
          </div>

          <div className="p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-800/20 bg-slate-500/5">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-2 text-center sm:text-left">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Calculated Margin</p>
                <p className="text-2xl sm:text-3xl font-black text-white">
                  {((formData.sellingPrice - formData.industryPrice) / (formData.sellingPrice || 1) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="sm:text-right">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Gain Per Unit</p>
                <p className="text-2xl sm:text-3xl font-black text-emerald-400">₹{formData.sellingPrice - formData.industryPrice}</p>
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
              className="flex-[2] bg-primary text-slate-950 font-black py-4 sm:py-5 rounded-2xl hover:opacity-90 transition-colors shadow-lg shadow-primary uppercase tracking-widest text-xs"
            >
              {product ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
