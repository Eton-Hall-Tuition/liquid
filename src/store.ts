import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  limit,
  getDocs,
  Unsubscribe
} from 'firebase/firestore';
import { 
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';
import { 
  signOut, 
  onAuthStateChanged
} from 'firebase/auth';
import { db, auth, storage } from './lib/firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export type Role = 'Super Admin' | 'Admin' | 'Sales' | 'Inventory Manager';

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  phone: string;
  photoUrl?: string;
  aadhaarUrl?: string;
  status?: 'Active' | 'Inactive' | 'Pending';
}

export interface Batch {
  id: string;
  purchaseId: string;
  productId: string;
  initialQuantity: number;
  currentQuantity: number;
  unitCost: number;
  expiryDate?: string;
  timestamp: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  unitType: 'ml' | 'unit';
  industryPrice: number;
  sellingPrice: number;
  gainPerUnit: number;
  marginPercentage: number;
  status: 'Active' | 'Inactive';
}

export interface DailyStock {
  id: string;
  date: string;
  status: 'OPEN' | 'CLOSED';
  openedAt: string;
  openedBy: string;
  closedAt?: string;
  closedBy?: string;
  openingValuation: number;
  closingValuation?: number;
  openingCash: number;
  closingCash?: number;
  totalSales: number;
  totalPurchases: number;
  totalExpenses: number;
  paymentBreakdown: {
    cash: number;
    qr: number;
    card: number;
  };
}

export interface SaleItem {
  productId: string;
  batchId: string; // Specific batch sold from (FIFO)
  name: string;
  quantity: number;
  unitPrice: number;
  unitCost: number; // Cost of the batch at time of sale
  total: number;
  profit: number;
}

export interface Sale {
  id: string;
  dailyStockId: string;
  items: SaleItem[];
  totalAmount: number;
  totalProfit: number;
  paymentMethod: 'Cash' | 'QR' | 'Card';
  timestamp: string;
  processedBy: string;
}

export interface Purchase {
  id: string;
  dailyStockId: string;
  productId: string;
  invoiceNumber: string;
  supplier: string;
  quantity: number;
  unitCost: number;
  totalAmount: number;
  paymentStatus: 'Paid' | 'Pending';
  timestamp: string;
}

export interface Expense {
  id: string;
  dailyStockId: string;
  description: string;
  amount: number;
  category: string;
  paymentMethod: 'Cash' | 'QR' | 'Card';
  timestamp: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  module: string;
  timestamp: string;
  details?: string;
  type?: 'success' | 'warning' | 'error' | 'info';
}

interface ERPState {
  currentUser: User | null;
  users: User[];
  dailyStocks: DailyStock[];
  products: Product[];
  batches: Batch[];
  sales: Sale[];
  purchases: Purchase[];
  expenses: Expense[];
  auditLogs: AuditLog[];
  settings: {
    theme: 'dark' | 'light';
    primaryColor: string;
    shopName: string;
    isSidebarCollapsed: boolean;
  };
  isLoading: boolean;
  isDemoMode: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Auth
  initAuth: () => void;
  logout: () => void;
  loginAsDemo: (role: Role) => void;
  
  // Operational Cycle
  openDay: (userId: string, openingCash?: number) => Promise<void>;
  closeDay: (userId: string, closingCash?: number) => Promise<void>;
  reopenDay: (id: string, userId: string) => Promise<void>;
  updateDailyRecord: (id: string, userId: string, updates: Partial<DailyStock>) => Promise<void>;
  
  // Core Actions
  addProduct: (product: Omit<Product, 'id' | 'gainPerUnit' | 'marginPercentage'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addMember: (user: Omit<User, 'id'>) => Promise<void>;
  updateMember: (id: string, updates: Partial<User>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  
  addPurchase: (purchase: Omit<Purchase, 'id' | 'timestamp' | 'totalAmount' | 'dailyStockId'>) => Promise<void>;
  updatePurchase: (id: string, updates: Partial<Purchase>) => Promise<void>;
  deletePurchase: (id: string) => Promise<void>;
  processSale: (sale: Omit<Sale, 'id' | 'timestamp' | 'dailyStockId' | 'items' | 'totalAmount' | 'totalProfit'>, cartItems: { productId: string, quantity: number }[]) => Promise<string>;
  recordManualSale: (amount: number, paymentMethod: 'Cash' | 'QR' | 'Card', details?: string) => Promise<string>;
  updateStockManually: (productId: string, newQuantity: number, reason: string) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id' | 'timestamp' | 'dailyStockId'>) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  
  logAction: (userId: string, action: string, module: string, details?: string, type?: 'success' | 'warning' | 'error' | 'info') => Promise<void>;
  updateSettings: (updates: Partial<ERPState['settings']>) => Promise<void>;
  toggleSidebar: () => void;
  uploadFile: (file: File, path: string) => Promise<string>;
  wipeAllData: () => Promise<void>;
  checkAutoMaintenance: () => Promise<void>;
}

const clean = (obj: any) => {
  const newObj = { ...obj };
  Object.keys(newObj).forEach(key => {
    if (newObj[key] === undefined) delete newObj[key];
  });
  return newObj;
};

export const useStore = create<ERPState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [],
      dailyStocks: [],
      products: [],
      batches: [],
      sales: [],
      purchases: [],
      expenses: [],
      auditLogs: [],
      settings: {
        theme: 'light',
        primaryColor: '#EF4444',
        shopName: 'liquid-ERP CENTRAL',
        isSidebarCollapsed: false,
      },
      isLoading: true,
      isDemoMode: false,
      activeTab: 'dashboard',

      setActiveTab: (tab: string) => set({ activeTab: tab }),

      initAuth: () => {
        let unsubscribers: Unsubscribe[] = [];

        onAuthStateChanged(auth, async (firebaseUser) => {
          // Cleanup previous listeners
          unsubscribers.forEach(unsub => unsub());
          unsubscribers = [];

          if (firebaseUser) {
            try {
              let user: User | null = null;
              const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
              
              if (userDoc.exists()) {
                user = userDoc.data() as User;
              } else if (firebaseUser.email === 'leviyathanindustries@gmail.com') {
                user = {
                  id: firebaseUser.uid,
                  name: 'Owner',
                  role: 'Super Admin',
                  email: firebaseUser.email!,
                  phone: '0000000000',
                  status: 'Active'
                };
                await setDoc(doc(db, 'users', firebaseUser.uid), user);
              } else if (firebaseUser.email) {
                // Check if there's a pending invitation for this email
                const emailKey = firebaseUser.email.toLowerCase();
                const inviteDoc = await getDoc(doc(db, 'users', emailKey));
                if (inviteDoc.exists()) {
                  const data = inviteDoc.data() as User;
                  user = {
                    ...data,
                    id: firebaseUser.uid,
                    status: 'Active',
                    email: firebaseUser.email, // Preserve email from Auth
                    role: data.role // Explicitly preserve role from invitation
                  };
                  await setDoc(doc(db, 'users', firebaseUser.uid), user);
                  
                  // Delete invitation document (id is lowercase email)
                  const inviteRef = doc(db, 'users', emailKey);
                  try {
                    await deleteDoc(inviteRef);
                  } catch (e) {
                    console.warn(`Could not delete invitation doc ${emailKey}. It may require admin cleanup:`, e);
                  }
                }
              }

              if (!user) {
                // If in Auth but not in Users and no invitation, they aren't authorized
                await signOut(auth);
                set({ currentUser: null, isLoading: false, activeTab: 'dashboard' });
                return;
              }

              set({ currentUser: user, isDemoMode: false });

              // Initialize real-time listeners for authenticated user
              const isAdmin = user.role === 'Super Admin' || user.role === 'Admin';

              if (isAdmin) {
                unsubscribers.push(onSnapshot(collection(db, 'users'), 
                  (snap) => set({ users: snap.docs.map(d => ({ ...d.data() as User, id: d.id })) }),
                  (err) => console.error('Users snapshot error:', err)
                ));

                unsubscribers.push(onSnapshot(query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'), limit(100)), 
                  (snap) => set({ auditLogs: snap.docs.map(d => ({ ...d.data() as AuditLog, id: d.id })) }),
                  (err) => console.error('AuditLogs snapshot error:', err)
                ));
              }

              unsubscribers.push(onSnapshot(collection(db, 'products'), 
                (snap) => set({ products: snap.docs.map(d => ({ ...d.data() as Product, id: d.id })) }),
                (err) => console.error('Products snapshot error:', err)
              ));

              unsubscribers.push(onSnapshot(collection(db, 'dailyStocks'), 
                (snap) => set({ dailyStocks: snap.docs.map(d => ({ ...d.data() as DailyStock, id: d.id })).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()) }),
                (err) => console.error('DailyStocks snapshot error:', err)
              ));

              unsubscribers.push(onSnapshot(collection(db, 'batches'), 
                (snap) => set({ batches: snap.docs.map(d => ({ ...d.data() as Batch, id: d.id })) }),
                (err) => console.error('Batches snapshot error:', err)
              ));

              unsubscribers.push(onSnapshot(collection(db, 'sales'), 
                (snap) => set({ sales: snap.docs.map(d => ({ ...d.data() as Sale, id: d.id })) }),
                (err) => console.error('Sales snapshot error:', err)
              ));

              unsubscribers.push(onSnapshot(collection(db, 'purchases'), 
                (snap) => set({ purchases: snap.docs.map(d => ({ ...d.data() as Purchase, id: d.id })) }),
                (err) => console.error('Purchases snapshot error:', err)
              ));

              unsubscribers.push(onSnapshot(collection(db, 'expenses'), 
                (snap) => set({ expenses: snap.docs.map(d => ({ ...d.data() as Expense, id: d.id })) }),
                (err) => console.error('Expenses snapshot error:', err)
              ));

              unsubscribers.push(onSnapshot(doc(db, 'config', 'settings'), 
                (snap) => snap.exists() && set(state => ({ settings: { ...state.settings, ...snap.data() } })),
                (err) => console.error('Settings snapshot error:', err)
              ));

              // Auto maintenance check
              get().checkAutoMaintenance();
            } catch (err) {
              console.error("Failed to initialize system state:", err);
            }
          } else {
            // Only clear if not in demo mode
            set((state) => (state.isDemoMode ? {} : { currentUser: null }));
          }
          set({ isLoading: false });
        });
      },
      
      logout: async () => {
        const user = get().currentUser;
        if (user && !get().isDemoMode) {
          await get().logAction(user.id, 'Logged Out', 'Auth');
          await signOut(auth);
        }
        set({ 
          currentUser: null, 
          isDemoMode: false,
          activeTab: 'dashboard',
          users: [],
          dailyStocks: [],
          products: [],
          batches: [],
          sales: [],
          purchases: [],
          expenses: [],
          auditLogs: []
        });
      },

      loginAsDemo: (role) => {
        const demoUser: User = {
          id: role === 'Admin' ? 'demo-admin' : 'demo-sales',
          name: role === 'Admin' ? 'Face Admin' : 'Face Sales',
          role: role,
          email: role === 'Admin' ? 'admin@example.com' : 'sales@example.com',
          phone: '0000000000',
          status: 'Active'
        };
        
        // Mock some data for demo mode
        const mockProducts: Product[] = [
          { id: 'p1', name: 'Premium Tech Kit', category: 'Hardware', unitType: 'unit', industryPrice: 5000, sellingPrice: 7500, gainPerUnit: 2500, marginPercentage: 33.3, status: 'Active' },
          { id: 'p2', name: 'Software License', category: 'Digital', unitType: 'unit', industryPrice: 1000, sellingPrice: 2000, gainPerUnit: 1000, marginPercentage: 50, status: 'Active' }
        ];

        set({ 
          currentUser: demoUser, 
          isDemoMode: true,
          products: mockProducts,
          dailyStocks: [
            { id: 'd1', date: new Date().toISOString().split('T')[0], status: 'OPEN', openedAt: new Date().toISOString(), openedBy: demoUser.id, openingValuation: 50000, openingCash: 15000, totalSales: 4500, totalPurchases: 0, totalExpenses: 200, paymentBreakdown: { cash: 2000, qr: 2500, card: 0 } }
          ],
          isLoading: false 
        });
      },

      openDay: async (userId, openingCash) => {
        if (get().isDemoMode) {
          const newDay: DailyStock = { id: `DEMO-${Date.now()}`, date: new Date().toISOString().split('T')[0], status: 'OPEN', openedAt: new Date().toISOString(), openedBy: userId, openingValuation: 10000, openingCash: openingCash || 0, totalSales: 0, totalPurchases: 0, totalExpenses: 0, paymentBreakdown: { cash: 0, qr: 0, card: 0 } };
          set(state => ({ dailyStocks: [newDay, ...state.dailyStocks] }));
          return;
        }
        const active = get().dailyStocks.find(d => d.status === 'OPEN');
        if (active) return;

        const valuation = get().batches.reduce((acc, b) => acc + (b.currentQuantity * b.unitCost), 0);
        const lastDay = get().dailyStocks.find(d => d.status === 'CLOSED');
        const effectiveOpeningCash = openingCash ?? (lastDay?.closingCash || 0);

        const newDayId = `DAY-${Date.now()}`;
        const newDay: DailyStock = {
          id: newDayId,
          date: new Date().toISOString().split('T')[0],
          status: 'OPEN',
          openedAt: new Date().toISOString(),
          openedBy: userId,
          openingValuation: valuation,
          openingCash: effectiveOpeningCash,
          totalSales: 0,
          totalPurchases: 0,
          totalExpenses: 0,
          paymentBreakdown: { cash: 0, qr: 0, card: 0 }
        };
        
        await setDoc(doc(db, 'dailyStocks', newDayId), newDay);
        get().logAction(userId, 'Opened Day', 'Operational', `Opening Cash: ${effectiveOpeningCash}`);
      },

      closeDay: async (userId, closingCash) => {
        if (get().isDemoMode) {
          set(state => ({ dailyStocks: state.dailyStocks.map(d => d.status === 'OPEN' ? { ...d, status: 'CLOSED', closingCash: closingCash || 15000 } as DailyStock : d ) }));
          return;
        }
        const active = get().dailyStocks.find(d => d.status === 'OPEN');
        if (!active) return;

        const valuation = get().batches.reduce((acc, b) => acc + (b.currentQuantity * b.unitCost), 0);
        const effectiveClosingCash = closingCash ?? (active.openingCash + active.totalSales - active.totalExpenses);

        await updateDoc(doc(db, 'dailyStocks', active.id), {
          status: 'CLOSED',
          closedAt: new Date().toISOString(),
          closedBy: userId,
          closingValuation: valuation,
          closingCash: effectiveClosingCash
        });
        
        get().logAction(userId, 'Closed Day', 'Operational', `Closing Cash: ${effectiveClosingCash}`);
      },

      reopenDay: async (id, userId) => {
        const active = get().dailyStocks.find(d => d.status === 'OPEN');
        if (active) throw new Error('Cannot reopen a day while another day is open');

        await updateDoc(doc(db, 'dailyStocks', id), {
          status: 'OPEN',
          closedAt: null,
          closedBy: null
        });
        
        const day = get().dailyStocks.find(d => d.id === id);
        get().logAction(userId, 'Reopened Session', 'Operational', `Date: ${day?.date}`);
      },

      updateDailyRecord: async (id, userId, updates) => {
        await updateDoc(doc(db, 'dailyStocks', id), clean(updates));
        
        if (updates.closingCash !== undefined) {
          const sorted = [...get().dailyStocks].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          const index = sorted.findIndex(d => d.id === id);
          
          if (index !== -1 && index < sorted.length - 1) {
            const nextDay = sorted[index + 1];
            await updateDoc(doc(db, 'dailyStocks', nextDay.id), {
              openingCash: updates.closingCash
            });
          }
        }
        
        const changeDesc = Object.entries(updates)
          .map(([key, val]) => `${key}: ${val}`)
          .join(', ');
        
        get().logAction(userId, 'Modified Journal Record', 'Operational', `Changes: ${changeDesc}`);
      },

      addProduct: async (p) => {
        const gain = p.sellingPrice - p.industryPrice;
        const margin = (gain / p.sellingPrice) * 100;
        const productId = `PROD-${Date.now()}`;
        const newProduct: Product = { 
          ...p, 
          id: productId,
          gainPerUnit: gain,
          marginPercentage: margin
        };
        if (get().isDemoMode) {
          set(state => ({ products: [...state.products, newProduct] }));
          return;
        }

        // Record first product creation for maintenance timer
        const metaDoc = await getDoc(doc(db, 'config', 'metadata'));
        if (!metaDoc.exists() || !metaDoc.data().firstProductCreatedAt) {
          await setDoc(doc(db, 'config', 'metadata'), { 
            firstProductCreatedAt: new Date().toISOString() 
          }, { merge: true });
        }

        await setDoc(doc(db, 'products', productId), newProduct);
        if (get().currentUser) get().logAction(get().currentUser!.id, `Added Product: ${p.name}`, 'Products');
      },

      updateProduct: async (id, updates) => {
        if (get().isDemoMode) {
          set(state => ({ products: state.products.map(p => p.id === id ? { ...p, ...updates } : p) }));
          return;
        }
        const product = get().products.find(p => p.id === id);
        if (!product) return;
        
        const updated = { ...product, ...updates };
        const gain = (updated.sellingPrice || 0) - (updated.industryPrice || 0);
        const margin = updated.sellingPrice ? (gain / updated.sellingPrice) * 100 : 0;
        
        await updateDoc(doc(db, 'products', id), clean({
          ...updates,
          gainPerUnit: gain,
          marginPercentage: margin
        }));
      },

      deleteProduct: async (id) => {
        if (get().isDemoMode) {
          set(state => ({ products: state.products.filter(p => p.id !== id) }));
          return;
        }
        await deleteDoc(doc(db, 'products', id));
      },

      addMember: async (user) => {
        if (get().isDemoMode) {
          const newUser: User = { ...user, id: `DEMO-USER-${Date.now()}` };
          set(state => ({ users: [...state.users, newUser] }));
          return;
        }
        // Use email as ID for the invitation doc so it can be looked up during registration
        const emailKey = user.email.toLowerCase();
        const newUser: User = { ...user, id: emailKey, status: 'Pending' };
        await setDoc(doc(db, 'users', emailKey), clean(newUser));
        if (get().currentUser) get().logAction(get().currentUser!.id, `Added Member: ${user.name}`, 'Members');
      },

      updateMember: async (id, updates) => {
        if (get().isDemoMode) {
          set(state => ({ users: state.users.map(u => u.id === id ? { ...u, ...updates } : u) }));
          return;
        }
        await updateDoc(doc(db, 'users', id), clean(updates));
        if (get().currentUser) get().logAction(get().currentUser!.id, `Updated Member: ${id}`, 'Members');
      },

      deleteMember: async (id) => {
        if (get().isDemoMode) {
          set(state => ({ users: state.users.filter(u => u.id !== id) }));
          return;
        }
        const userToDelete = get().users.find(u => u.id === id);
        await deleteDoc(doc(db, 'users', id));
        if (get().currentUser) get().logAction(get().currentUser!.id, `Deleted Member: ${userToDelete?.name || id}`, 'Members');
      },

      addPurchase: async (pData) => {
        const active = get().dailyStocks.find(d => d.status === 'OPEN');
        if (!active) throw new Error('Day must be open to record purchases');

        const total = pData.quantity * pData.unitCost;

        if (get().isDemoMode) {
          const pid = `DEMO-PUR-${Date.now()}`;
          const purchase: Purchase = { ...pData, id: pid, dailyStockId: active.id, totalAmount: total, timestamp: new Date().toISOString() };
          set(state => ({ 
            purchases: [...state.purchases, purchase],
            dailyStocks: state.dailyStocks.map(d => d.id === active.id ? { ...d, totalPurchases: d.totalPurchases + total } : d)
          }));
          return;
        }

        const purchaseId = `PUR-${Date.now()}`;
        const purchase: Purchase = {
          ...pData,
          id: purchaseId,
          dailyStockId: active.id,
          totalAmount: total,
          timestamp: new Date().toISOString()
        };

        const batchId = `BATCH-${Date.now()}`;
        const batch: Batch = {
          id: batchId,
          purchaseId: purchaseId,
          productId: pData.productId,
          initialQuantity: pData.quantity,
          currentQuantity: pData.quantity,
          unitCost: pData.unitCost,
          timestamp: new Date().toISOString()
        };

        await setDoc(doc(db, 'purchases', purchaseId), purchase);
        await setDoc(doc(db, 'batches', batchId), batch);
        await updateDoc(doc(db, 'dailyStocks', active.id), {
          totalPurchases: active.totalPurchases + total
        });
        
        if (get().currentUser) get().logAction(get().currentUser!.id, `Added Purchase: Inv #${pData.invoiceNumber}`, 'Purchases');
      },

      updatePurchase: async (id, updates) => {
        await updateDoc(doc(db, 'purchases', id), clean(updates));
        if (get().currentUser) get().logAction(get().currentUser!.id, `Updated Purchase: ${id}`, 'Purchases');
      },

      deletePurchase: async (id) => {
        const pToDelete = get().purchases.find(p => p.id === id);
        await deleteDoc(doc(db, 'purchases', id));
        const batchSnap = await getDocs(query(collection(db, 'batches'), where('purchaseId', '==', id)));
        for (const d of batchSnap.docs) {
          await deleteDoc(d.ref);
        }
        if (get().currentUser) get().logAction(get().currentUser!.id, `Deleted Purchase: Inv #${pToDelete?.invoiceNumber || id}`, 'Purchases');
      },

      processSale: async (saleData, cartItems) => {
        if (get().isDemoMode) {
          return `DEMO-SALE-${Date.now()}`;
        }
        const active = get().dailyStocks.find(d => d.status === 'OPEN');
        if (!active) throw new Error('Day must be open to process sales');

        const soldItems: SaleItem[] = [];
        let totalAmount = 0;
        let totalProfit = 0;

        for (const cartItem of cartItems) {
          const product = get().products.find(p => p.id === cartItem.productId);
          if (!product) continue;

          let remainingToSell = cartItem.quantity;
          
          const productBatches = [...get().batches]
            .filter(b => b.productId === cartItem.productId && b.currentQuantity > 0)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

          const availableStock = productBatches.reduce((acc, b) => acc + b.currentQuantity, 0);
          if (availableStock < remainingToSell) throw new Error(`Insufficient stock for ${product.name}`);

          for (const batch of productBatches) {
            if (remainingToSell <= 0) break;

            const sellFromThisBatch = Math.min(batch.currentQuantity, remainingToSell);
            const itemTotal = sellFromThisBatch * product.sellingPrice;
            const itemCost = sellFromThisBatch * batch.unitCost;
            const itemProfit = itemTotal - itemCost;

            soldItems.push({
              productId: product.id,
              batchId: batch.id,
              name: product.name,
              quantity: sellFromThisBatch,
              unitPrice: product.sellingPrice,
              unitCost: batch.unitCost,
              total: itemTotal,
              profit: itemProfit
            });

            await updateDoc(doc(db, 'batches', batch.id), {
              currentQuantity: batch.currentQuantity - sellFromThisBatch
            });
            
            remainingToSell -= sellFromThisBatch;
            totalAmount += itemTotal;
            totalProfit += itemProfit;
          }
        }

        const saleId = `SALE-${Date.now()}`;
        const sale: Sale = {
          ...saleData,
          id: saleId,
          dailyStockId: active.id,
          items: soldItems,
          totalAmount,
          totalProfit,
          timestamp: new Date().toISOString()
        };

        const payMethod = saleData.paymentMethod.toLowerCase() as 'cash' | 'qr' | 'card';

        await setDoc(doc(db, 'sales', saleId), sale);
        await updateDoc(doc(db, 'dailyStocks', active.id), {
          totalSales: active.totalSales + totalAmount,
          [`paymentBreakdown.${payMethod}`]: active.paymentBreakdown[payMethod] + totalAmount
        });

        if (get().currentUser) get().logAction(get().currentUser!.id, `Processed Sale: ₹${totalAmount}`, 'Billing', `Sale ID: ${saleId}`, 'success');
        return saleId;
      },

      recordManualSale: async (amount, paymentMethod, details) => {
        const active = get().dailyStocks.find(d => d.status === 'OPEN');
        if (!active) throw new Error('Day must be open to record sales');

        const saleId = `MANUAL-${Date.now()}`;
        const sale: Sale = {
          id: saleId,
          dailyStockId: active.id,
          items: [],
          totalAmount: amount,
          totalProfit: amount * 0.2,
          paymentMethod,
          timestamp: new Date().toISOString(),
          processedBy: get().currentUser?.id || 'System'
        };

        const payMethod = paymentMethod.toLowerCase() as 'cash' | 'qr' | 'card';

        await setDoc(doc(db, 'sales', saleId), sale);
        await updateDoc(doc(db, 'dailyStocks', active.id), {
          totalSales: active.totalSales + amount,
          [`paymentBreakdown.${payMethod}`]: active.paymentBreakdown[payMethod] + amount
        });

        if (get().currentUser) {
          get().logAction(get().currentUser!.id, `Manual Sale Recorded: ₹${amount}`, 'Billing', details, 'error');
        }
        return saleId;
      },

      updateStockManually: async (productId, newQuantity, reason) => {
        const product = get().products.find(p => p.id === productId);
        if (!product) throw new Error('Product not found');

        const productBatches = [...get().batches]
          .filter(b => b.productId === productId)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        if (productBatches.length === 0) {
          const batchId = `MANUAL-BATCH-${Date.now()}`;
          await setDoc(doc(db, 'batches', batchId), {
            id: batchId,
            productId,
            purchaseId: 'MANUAL',
            initialQuantity: newQuantity,
            currentQuantity: newQuantity,
            unitCost: product.industryPrice,
            timestamp: new Date().toISOString()
          });
        } else {
          await updateDoc(doc(db, 'batches', productBatches[0].id), {
            currentQuantity: newQuantity
          });
        }

        if (get().currentUser) {
          get().logAction(get().currentUser!.id, `Manual Stock Update: ${productId}`, 'Inventory', `New Qty: ${newQuantity}, Reason: ${reason}`);
        }
      },

      addExpense: async (eData) => {
        const active = get().dailyStocks.find(d => d.status === 'OPEN');
        if (!active) throw new Error('Day must be open to record expenses');

        const expenseId = `EXP-${Date.now()}`;
        const expense: Expense = {
          ...eData,
          id: expenseId,
          dailyStockId: active.id,
          timestamp: new Date().toISOString()
        };

        await setDoc(doc(db, 'expenses', expenseId), expense);
        await updateDoc(doc(db, 'dailyStocks', active.id), {
          totalExpenses: active.totalExpenses + eData.amount
        });
        
        if (get().currentUser) get().logAction(get().currentUser!.id, `Added Expense: ${eData.description}`, 'Expenses');
      },

      updateExpense: async (id, updates) => {
        await updateDoc(doc(db, 'expenses', id), clean(updates));
        if (get().currentUser) get().logAction(get().currentUser!.id, `Updated Expense: ${id}`, 'Expenses');
      },

      deleteExpense: async (id) => {
        const eToDelete = get().expenses.find(e => e.id === id);
        await deleteDoc(doc(db, 'expenses', id));
        if (get().currentUser) get().logAction(get().currentUser!.id, `Deleted Expense: ${eToDelete?.description || id}`, 'Expenses');
      },

      logAction: async (userId, action, module, details, type = 'info') => {
        if (get().isDemoMode) return;
        if (!userId) {
          console.warn('Logging skipped: No userId provided');
          return;
        }
        const logId = `LOG-${Date.now()}`;
        const log = clean({
          id: logId,
          userId,
          action,
          module,
          details,
          type,
          timestamp: new Date().toISOString()
        });
        
        try {
          await setDoc(doc(db, 'auditLogs', logId), log);
        } catch (err) {
          console.error('Failed to write audit log:', err);
        }
      },

      updateSettings: async (updates) => {
        await setDoc(doc(db, 'config', 'settings'), updates, { merge: true });
      },

      toggleSidebar: () => {
        set(state => ({ settings: { ...state.settings, isSidebarCollapsed: !state.settings.isSidebarCollapsed } }));
      },
      
      uploadFile: async (file, path) => {
        if (get().isDemoMode) {
          return URL.createObjectURL(file);
        }
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, file);
        return await getDownloadURL(snapshot.ref);
      },

      checkAutoMaintenance: async () => {
        if (get().isDemoMode) return;
        
        // Wait a small moment to ensure Auth state is fully synced with Firestore rules
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const user = get().currentUser;
        if (!user || (user.role !== 'Admin' && user.role !== 'Super Admin')) return;
        
        try {
          console.log('Running auto-maintenance check...');
          const metaRef = doc(db, 'config', 'metadata');
          
          let metaDoc;
          try {
            metaDoc = await getDoc(metaRef);
          } catch (e) {
            // If we still get permission errors, it's likely the rules haven't been deployed locally
            console.warn('Maintenance check permission deferred:', e);
            return;
          }
          
          if (!metaDoc.exists()) {
            console.log('No metadata found, maintenance timer not initialized.');
            return;
          }
          
          const { firstProductCreatedAt, lastAuditCleanup } = metaDoc.data();
          if (!firstProductCreatedAt) return;

          const lastCleanup = lastAuditCleanup ? new Date(lastAuditCleanup) : new Date(firstProductCreatedAt);
          const now = new Date();
          
          // Check if 6 months have passed (approx 182 days)
          const sixMonthsInMs = 6 * 30 * 24 * 60 * 60 * 1000;
          if (now.getTime() - lastCleanup.getTime() >= sixMonthsInMs) {
            console.log('Maintenance threshold reached. Starting cleanup...');
            
            // 1. Get logs
            let logsSnap;
            try {
              logsSnap = await getDocs(collection(db, 'auditLogs'));
            } catch (e) {
              console.error('Failed to list audit logs for cleanup:', e);
              return;
            }

            if (logsSnap.empty) {
              console.log('Audit logs already empty.');
            } else {
              // 2. Delete logs
              const deletePromises = logsSnap.docs.map(d => deleteDoc(d.ref));
              await Promise.all(deletePromises);
              console.log(`Deleted ${logsSnap.size} audit logs.`);
            }

            // 3. Record maintenance log
            const maintenanceLogId = `LOG-MAINT-${Date.now()}`;
            try {
              await setDoc(doc(db, 'auditLogs', maintenanceLogId), {
                id: maintenanceLogId,
                userId: 'SYSTEM',
                action: 'Auto Maintenance: Audit Logs Cleared',
                module: 'System',
                timestamp: now.toISOString(),
                type: 'info',
                details: `Scheduled 6-month maintenance completed. Deleted ${logsSnap.size} logs.`
              });
            } catch (e) {
              console.error('Failed to record maintenance completion log:', e);
            }

            // 4. Update metadata
            try {
              await setDoc(metaRef, { 
                lastAuditCleanup: now.toISOString() 
              }, { merge: true });
            } catch (e) {
              console.error('Failed to update maintenance metadata timestamp:', e);
            }
            
            console.log('System maintenance completed successfully.');
          } else {
            const nextRun = new Date(lastCleanup.getTime() + sixMonthsInMs);
            console.log(`Maintenance not yet due. Next scheduled run: ${nextRun.toLocaleDateString()}`);
          }
        } catch (err) {
          console.error('Maintenance check logic error:', err);
        }
      },

      wipeAllData: async () => {
        if (get().isDemoMode) return;
        const user = get().currentUser;
        if (!user || user.role !== 'Super Admin') throw new Error('Unauthorized');

        const collectionsToWipe = [
          'products', 'purchases', 'expenses', 'auditLogs', 
          'sales', 'dailyStocks', 'batches'
        ];

        try {
          // 1. Wipe operational collections
          for (const colName of collectionsToWipe) {
            const snap = await getDocs(collection(db, colName));
            const deletePromises = snap.docs.map(d => deleteDoc(d.ref));
            await Promise.all(deletePromises);
          }

          // 2. Wipe non-super-admin users
          const usersSnap = await getDocs(collection(db, 'users'));
          const userDeletePromises = usersSnap.docs
            .filter(d => (d.data() as User).role !== 'Super Admin')
            .map(d => deleteDoc(d.ref));
          await Promise.all(userDeletePromises);

          // 3. Reset metadata
          await setDoc(doc(db, 'config', 'metadata'), {
            firstProductCreatedAt: null,
            lastAuditCleanup: null
          });

          // Log the wipe
          await get().logAction(user.id, 'System Reset: All data wiped', 'System', 'Except Super Admin', 'warning');
          
          window.location.reload();
        } catch (err) {
          console.error('Wipe failed:', err);
          throw err;
        }
      }
    }),
    { 
      name: 'liquid-erp-storage',
      partialize: (state) => ({ 
        settings: state.settings,
        activeTab: state.activeTab
      })
    }
  )
);
