import { useState, useCallback } from 'react'
import { uid, nowTimestamp } from '../utils/format'

// ── Seed data ────────────────────────────────────────────────────────────────
const SEED_ITEMS = [
  { id: 1, name: 'Premium Cold Brew', emoji: '☕', category: 'Beverages', fixedCost: 45, industryPrice: 80, sellPrice: 120, active: true },
  { id: 2, name: 'Artisan Espresso Blend', emoji: '🫘', category: 'Beverages', fixedCost: 30, industryPrice: 55, sellPrice: 85, active: true },
  { id: 3, name: 'Sparkling Water Pack', emoji: '💧', category: 'Beverages', fixedCost: 12, industryPrice: 20, sellPrice: 35, active: true },
  { id: 4, name: 'Protein Shake Mix', emoji: '🥤', category: 'Supplements', fixedCost: 85, industryPrice: 140, sellPrice: 199, active: true },
  { id: 5, name: 'Matcha Latte Powder', emoji: '🍵', category: 'Beverages', fixedCost: 55, industryPrice: 90, sellPrice: 135, active: true },
  { id: 6, name: 'Energy Drink', emoji: '⚡', category: 'Beverages', fixedCost: 18, industryPrice: 30, sellPrice: 50, active: true },
  { id: 7, name: 'Vitamin C Tablets', emoji: '💊', category: 'Supplements', fixedCost: 40, industryPrice: 65, sellPrice: 99, active: true },
  { id: 8, name: 'Herbal Tea Set', emoji: '🫖', category: 'Beverages', fixedCost: 60, industryPrice: 95, sellPrice: 149, active: true },
]

const SEED_STORAGE = [
  { id: 10, itemId: 1, itemName: 'Premium Cold Brew', supplier: 'BrewMasters Co.', boughtQty: 200, boughtTotal: 9000, currentQty: 142, purchaseDate: '2025-01-10', expiryDate: '2025-09-30' },
  { id: 11, itemId: 2, itemName: 'Artisan Espresso Blend', supplier: 'CoffeeRoasters Ltd.', boughtQty: 300, boughtTotal: 9000, currentQty: 200, purchaseDate: '2025-01-05', expiryDate: '2026-01-01' },
  { id: 12, itemId: 3, itemName: 'Sparkling Water Pack', supplier: 'AquaFresh Pvt.', boughtQty: 500, boughtTotal: 6000, currentQty: 80, purchaseDate: '2025-02-01', expiryDate: '2025-12-31' },
  { id: 13, itemId: 4, itemName: 'Protein Shake Mix', supplier: 'NutriPro India', boughtQty: 100, boughtTotal: 8500, currentQty: 45, purchaseDate: '2025-01-20', expiryDate: '2026-03-15' },
  { id: 14, itemId: 5, itemName: 'Matcha Latte Powder', supplier: 'TeaOrigins', boughtQty: 100, boughtTotal: 5500, currentQty: 60, purchaseDate: '2025-02-10', expiryDate: '2025-09-30' },
  { id: 15, itemId: 6, itemName: 'Energy Drink', supplier: 'BuzzDrinks Corp.', boughtQty: 600, boughtTotal: 10800, currentQty: 300, purchaseDate: '2025-01-28', expiryDate: '2025-11-30' },
]

const SEED_MEMBERS = [
  { id: 20, name: 'Arun Krishnamurthy', group: 'Owner', role: 'Managing Director', experience: '8 years', salary: 0, sharePercent: 60, joined: '2019-03-01', phone: '+91 98765 43210', email: 'arun@liquidlevi.com', status: 'Active', bio: 'Founded the shop in 2019. Oversees all operations.' },
  { id: 21, name: 'Meena Sundaram', group: 'Owner', role: 'Co-Founder', experience: '8 years', salary: 0, sharePercent: 40, joined: '2019-03-01', phone: '+91 87654 32109', email: 'meena@liquidlevi.com', status: 'Active', bio: 'Handles finance and vendor relationships.' },
  { id: 22, name: 'Priya Rajan', group: 'Employee', role: 'Store Manager', experience: '3 years', salary: 35000, sharePercent: 0, joined: '2022-07-01', phone: '+91 76543 21098', email: 'priya@liquidlevi.com', status: 'Active', bio: 'Day-to-day operations and staff scheduling.' },
  { id: 23, name: 'Karthik Balaji', group: 'Cashier', role: 'Head Cashier', experience: '2 years', salary: 22000, sharePercent: 0, joined: '2023-04-20', phone: '+91 65432 10987', email: 'karthik@liquidlevi.com', status: 'Active', bio: 'All billing and customer transactions.' },
  { id: 24, name: 'Suresh Venkat', group: 'Employee', role: 'Inventory Specialist', experience: '4 years', salary: 20000, sharePercent: 0, joined: '2021-09-05', phone: '+91 54321 09876', email: 'suresh@liquidlevi.com', status: 'Active', bio: 'Storage, restocking and supplier coordination.' },
  { id: 25, name: 'Divya Nair', group: 'Cashier', role: 'Cashier', experience: '1 year', salary: 16000, sharePercent: 0, joined: '2024-01-15', phone: '+91 43210 98765', email: 'divya@liquidlevi.com', status: 'Active', bio: 'Billing and customer support.' },
]

const SEED_ASSETS = [
  { id: 30, name: 'LED Ceiling Lights', category: 'Electrical', count: 12, costEach: 800, totalCost: 9600, status: 'Good', installDate: '2019-03-01', lastChecked: '2025-01-15', events: [] },
  { id: 31, name: 'Office Chairs', category: 'Furniture', count: 6, costEach: 3500, totalCost: 21000, status: 'Damaged', installDate: '2019-03-01', lastChecked: '2025-02-01', damageDate: '2025-01-28', events: [{ id: 901, type: 'Damage', date: '2025-01-28', cost: 0, note: 'Armrest broken on 2 chairs' }, { id: 902, type: 'Repair', date: '2025-02-05', cost: 500, note: 'Armrest welded, fabric stitched' }] },
  { id: 32, name: 'Tables', category: 'Furniture', count: 4, costEach: 5000, totalCost: 20000, status: 'Good', installDate: '2019-03-01', lastChecked: '2025-01-10', events: [] },
  { id: 33, name: 'Water Purifier', category: 'Appliance', count: 1, costEach: 15000, totalCost: 15000, status: 'Under Repair', installDate: '2020-06-15', lastChecked: '2025-02-12', damageDate: '2025-02-11', events: [{ id: 903, type: 'Damage', date: '2025-02-11', cost: 0, note: 'Low output, filter clogged' }, { id: 904, type: 'Repair', date: '2025-02-12', cost: 2200, note: 'Filter replacement in progress' }] },
  { id: 34, name: 'Refrigerator', category: 'Appliance', count: 2, costEach: 18000, totalCost: 36000, status: 'Good', installDate: '2020-01-10', lastChecked: '2025-02-01', events: [] },
]

const SEED_BILLS = [
  { id: 50, billNo: 'LL-001', date: '2025-02-14 10:12', cashier: 'Karthik Balaji', items: [{ itemId: 1, name: 'Premium Cold Brew', emoji:'☕', qty: 2, price: 120 }, { itemId: 6, name: 'Energy Drink', emoji:'⚡', qty: 3, price: 50 }], subtotal: 390, discount: 0, total: 390, paymentMode: 'Cash', paid: true },
  { id: 51, billNo: 'LL-002', date: '2025-02-14 11:45', cashier: 'Divya Nair', items: [{ itemId: 4, name: 'Protein Shake Mix', emoji:'🥤', qty: 1, price: 199 }, { itemId: 7, name: 'Vitamin C Tablets', emoji:'💊', qty: 2, price: 99 }], subtotal: 397, discount: 20, total: 377, paymentMode: 'UPI', paid: true },
  { id: 52, billNo: 'LL-003', date: '2025-02-14 14:20', cashier: 'Karthik Balaji', items: [{ itemId: 2, name: 'Artisan Espresso Blend', emoji:'🫘', qty: 1, price: 85 }, { itemId: 3, name: 'Sparkling Water Pack', emoji:'💧', qty: 4, price: 35 }], subtotal: 225, discount: 0, total: 225, paymentMode: 'Card', paid: true },
]

const SEED_EXPENSES = [
  { id: 60, date: '2025-02-01', category: 'Utilities', description: 'Electricity bill', amount: 8500, paidTo: 'TNEB', paymentMode: 'Bank Transfer', approved: true },
  { id: 61, date: '2025-02-01', category: 'Rent', description: 'Monthly shop rent', amount: 25000, paidTo: 'Landlord Ravi', paymentMode: 'Cheque', approved: true },
  { id: 62, date: '2025-02-05', category: 'Supplies', description: 'Cleaning supplies', amount: 1200, paidTo: 'Local Vendor', paymentMode: 'Cash', approved: true },
  { id: 63, date: '2025-02-10', category: 'Marketing', description: 'Pamphlet printing', amount: 2000, paidTo: 'Print Shop', paymentMode: 'UPI', approved: true },
  { id: 64, date: '2025-02-12', category: 'Maintenance', description: 'Water purifier repair', amount: 2200, paidTo: 'Service Tech', paymentMode: 'Cash', approved: true },
  { id: 65, date: '2025-02-14', category: 'Utilities', description: 'Internet bill', amount: 999, paidTo: 'BSNL', paymentMode: 'UPI', approved: true },
]

const SEED_PURCHASES = [
  { id: 70, date: '2025-01-10', supplier: 'BrewMasters Co.', itemName: 'Premium Cold Brew', qty: 200, unitCost: 45, totalCost: 9000, invoiceNo: 'INV-BM-001', paymentMode: 'Bank Transfer', status: 'Received' },
  { id: 71, date: '2025-01-20', supplier: 'NutriPro India', itemName: 'Protein Shake Mix', qty: 100, unitCost: 85, totalCost: 8500, invoiceNo: 'INV-NP-007', paymentMode: 'Cheque', status: 'Received' },
  { id: 72, date: '2025-02-01', supplier: 'AquaFresh Pvt.', itemName: 'Sparkling Water Pack', qty: 500, unitCost: 12, totalCost: 6000, invoiceNo: 'INV-AF-022', paymentMode: 'Bank Transfer', status: 'Received' },
]

export const SEED_MONTHLY = [
  { month: 'Mar 2024', revenue: 118000, restock: 38000, salaries: 108000, maintenance: 4000, opex: 38000 },
  { month: 'Apr 2024', revenue: 125000, restock: 40000, salaries: 108000, maintenance: 6000, opex: 39000 },
  { month: 'May 2024', revenue: 132000, restock: 42000, salaries: 108000, maintenance: 3000, opex: 40000 },
  { month: 'Jun 2024', revenue: 129000, restock: 41000, salaries: 108000, maintenance: 8000, opex: 38500 },
  { month: 'Jul 2024', revenue: 141000, restock: 45000, salaries: 108000, maintenance: 5000, opex: 42000 },
  { month: 'Aug 2024', revenue: 152000, restock: 48000, salaries: 108000, maintenance: 7000, opex: 45000 },
  { month: 'Sep 2024', revenue: 158000, restock: 50000, salaries: 113000, maintenance: 3000, opex: 46000 },
  { month: 'Oct 2024', revenue: 178000, restock: 58000, salaries: 113000, maintenance: 12000, opex: 52000 },
  { month: 'Nov 2024', revenue: 195000, restock: 62000, salaries: 113000, maintenance: 5000, opex: 55000 },
  { month: 'Dec 2024', revenue: 238000, restock: 82000, salaries: 113000, maintenance: 9000, opex: 68000 },
  { month: 'Jan 2025', revenue: 168000, restock: 54000, salaries: 108000, maintenance: 6000, opex: 48000 },
  { month: 'Feb 2025', revenue: 182000, restock: 58000, salaries: 108000, maintenance: 14000, opex: 52000 },
]

export const SEED_PREV_YEAR = [
  { month: 'Mar 2023', revenue: 95000, restock: 31000, salaries: 98000, maintenance: 3000, opex: 30000 },
  { month: 'Apr 2023', revenue: 102000, restock: 33000, salaries: 98000, maintenance: 5000, opex: 32000 },
  { month: 'May 2023', revenue: 108000, restock: 35000, salaries: 98000, maintenance: 2500, opex: 33000 },
  { month: 'Jun 2023', revenue: 105000, restock: 34000, salaries: 98000, maintenance: 7000, opex: 31500 },
  { month: 'Jul 2023', revenue: 112000, restock: 37000, salaries: 98000, maintenance: 4000, opex: 34000 },
  { month: 'Aug 2023', revenue: 122000, restock: 40000, salaries: 98000, maintenance: 6000, opex: 36000 },
  { month: 'Sep 2023', revenue: 128000, restock: 42000, salaries: 103000, maintenance: 2500, opex: 37000 },
  { month: 'Oct 2023', revenue: 145000, restock: 48000, salaries: 103000, maintenance: 10000, opex: 42000 },
  { month: 'Nov 2023', revenue: 162000, restock: 52000, salaries: 103000, maintenance: 4000, opex: 46000 },
  { month: 'Dec 2023', revenue: 201000, restock: 68000, salaries: 103000, maintenance: 8000, opex: 56000 },
  { month: 'Jan 2024', revenue: 138000, restock: 45000, salaries: 98000, maintenance: 5000, opex: 38000 },
  { month: 'Feb 2024', revenue: 149000, restock: 48000, salaries: 98000, maintenance: 11000, opex: 42000 },
]

const SEED_LOG = [
  { id: 80, ts: '2025-02-14 10:32', who: 'Admin', section: 'Items', action: 'Price updated', detail: 'Energy Drink: ₹45 → ₹50', prev: { id: 6, sellPrice: 45 }, canRevert: true, reverted: false },
  { id: 81, ts: '2025-02-14 10:12', who: 'Admin', section: 'Billing', action: 'Bill created', detail: 'LL-001 — ₹390 Cash', prev: null, canRevert: false, reverted: false },
  { id: 82, ts: '2025-02-12 16:45', who: 'Admin', section: 'Maintenance', action: 'Damage reported', detail: 'Water Purifier — filter clogged', prev: null, canRevert: false, reverted: false },
]

const SEED_STORAGE_RECS = [
  { id: 90, type: 'restock', itemName: 'Protein Shake Mix', reason: 'Only 45 units left (<50 threshold)', approved: false, rejected: false },
  { id: 91, type: 'restock', itemName: 'Sparkling Water Pack', reason: 'Only 80 units, fast-moving item', approved: false, rejected: false },
  { id: 92, type: 'offer', itemName: 'Matcha Latte Powder', reason: 'Expires in ~60 days — suggest 10% off', approved: false, rejected: false },
]

// ── The store hook ────────────────────────────────────────────────────────────
export function useStore() {
  const [items, setItems]           = useState(SEED_ITEMS)
  const [storage, setStorage]       = useState(SEED_STORAGE)
  const [members, setMembers]       = useState(SEED_MEMBERS)
  const [assets, setAssets]         = useState(SEED_ASSETS)
  const [bills, setBills]           = useState(SEED_BILLS)
  const [expenses, setExpenses]     = useState(SEED_EXPENSES)
  const [purchases, setPurchases]   = useState(SEED_PURCHASES)
  const [auditLog, setAuditLog]     = useState(SEED_LOG)
  const [storageRecs, setStorageRecs] = useState(SEED_STORAGE_RECS)
  const monthlyData = SEED_MONTHLY
  const prevYearData = SEED_PREV_YEAR

  /** Prepend a log entry */
  const addLog = useCallback((section, action, detail, prev = null, canRevert = false) => {
    setAuditLog((l) => [
      { id: uid(), ts: nowTimestamp(), who: 'Admin', section, action, detail, prev, canRevert, reverted: false },
      ...l,
    ])
  }, [])

  // ── Items ──────────────────────────────────────────────────────────────────
  const addItem = useCallback((data) => {
    const item = { ...data, id: uid(), active: true }
    setItems((p) => [...p, item])
    addLog('Items', 'Item added', `${item.name} — sell ₹${item.sellPrice}`)
    return item
  }, [addLog])

  const updateItem = useCallback((id, data) => {
    let prev
    setItems((p) => p.map((i) => { if (i.id !== id) return i; prev = { ...i }; return { ...i, ...data } }))
    const changes = Object.entries(data).map(([k, v]) => `${k}: ${prev?.[k]} → ${v}`).join(', ')
    addLog('Items', 'Item updated', `${prev?.name}: ${changes}`, prev, true)
  }, [addLog])

  const deleteItem = useCallback((id) => {
    let name
    setItems((p) => { name = p.find((i) => i.id === id)?.name; return p.filter((i) => i.id !== id) })
    addLog('Items', 'Item deleted', name || `ID ${id}`)
  }, [addLog])

  // ── Storage ────────────────────────────────────────────────────────────────
  const addStorage = useCallback((data) => {
    const entry = { ...data, id: uid() }
    setStorage((p) => [...p, entry])
    addLog('Storage', 'Stock added', `${entry.itemName} — ${entry.boughtQty} units @ ₹${entry.boughtTotal}`)
    return entry
  }, [addLog])

  const updateStorage = useCallback((id, data) => {
    let prev
    setStorage((p) => p.map((s) => { if (s.id !== id) return s; prev = { ...s }; return { ...s, ...data } }))
    addLog('Storage', 'Stock updated', `ID ${id}`, prev, true)
  }, [addLog])

  const deductStorage = useCallback((itemId, qty) => {
    setStorage((p) => p.map((s) => s.itemId === itemId ? { ...s, currentQty: Math.max(0, s.currentQty - qty) } : s))
  }, [])

  const approveRec = useCallback((id) => {
    setStorageRecs((p) => p.map((r) => r.id === id ? { ...r, approved: true } : r))
    addLog('Storage', 'Recommendation approved', `Rec ID ${id}`)
  }, [addLog])

  const rejectRec = useCallback((id) => {
    setStorageRecs((p) => p.map((r) => r.id === id ? { ...r, rejected: true } : r))
    addLog('Storage', 'Recommendation rejected', `Rec ID ${id}`)
  }, [addLog])

  // ── Members ────────────────────────────────────────────────────────────────
  const addMember = useCallback((data) => {
    const m = { ...data, id: uid() }
    setMembers((p) => [...p, m])
    addLog('Members', 'Member added', `${m.name} — ${m.group}`)
    return m
  }, [addLog])

  const updateMember = useCallback((id, data) => {
    let prev
    setMembers((p) => p.map((m) => { if (m.id !== id) return m; prev = { ...m }; return { ...m, ...data } }))
    addLog('Members', 'Member updated', prev?.name, prev, true)
  }, [addLog])

  const deleteMember = useCallback((id) => {
    let name
    setMembers((p) => { name = p.find((m) => m.id === id)?.name; return p.filter((m) => m.id !== id) })
    addLog('Members', 'Member removed', name)
  }, [addLog])

  // ── Billing ────────────────────────────────────────────────────────────────
  const addBill = useCallback((data) => {
    const billNo = 'LL-' + String(bills.length + 1).padStart(3, '0')
    const bill = { ...data, id: uid(), billNo, date: nowTimestamp(), paid: true }
    setBills((p) => [bill, ...p])
    data.items.forEach((li) => deductStorage(li.itemId, li.qty))
    addLog('Billing', 'Bill created', `${billNo} — ₹${data.total} ${data.paymentMode}`)
    return bill
  }, [bills.length, deductStorage, addLog])

  // ── Expenses ───────────────────────────────────────────────────────────────
  const addExpense = useCallback((data) => {
    const e = { ...data, id: uid(), approved: true }
    setExpenses((p) => [e, ...p])
    addLog('Expenses', 'Expense added', `${data.description} — ₹${data.amount}`)
  }, [addLog])

  const deleteExpense = useCallback((id) => {
    setExpenses((p) => p.filter((e) => e.id !== id))
    addLog('Expenses', 'Expense deleted', `ID ${id}`)
  }, [addLog])

  // ── Purchases ──────────────────────────────────────────────────────────────
  const addPurchase = useCallback((data) => {
    const p = { ...data, id: uid(), status: 'Received' }
    setPurchases((prev) => [p, ...prev])
    addLog('Purchases', 'Purchase recorded', `${data.itemName} from ${data.supplier} — ₹${data.totalCost}`)
  }, [addLog])

  // ── Assets / Maintenance ───────────────────────────────────────────────────
  const addAsset = useCallback((data) => {
    const a = { ...data, id: uid(), events: [] }
    setAssets((p) => [...p, a])
    addLog('Maintenance', 'Asset added', `${a.name}`)
  }, [addLog])

  const updateAsset = useCallback((id, data) => {
    setAssets((p) => p.map((a) => a.id === id ? { ...a, ...data } : a))
    addLog('Maintenance', 'Asset updated', `ID ${id}`)
  }, [addLog])

  const addAssetEvent = useCallback((assetId, event) => {
    const ev = { ...event, id: uid() }
    const statusMap = { Replacement: 'Good', Damage: 'Damaged', Repair: 'Under Repair', Inspection: 'Good', Maintenance: 'Good' }
    setAssets((p) => p.map((a) => {
      if (a.id !== assetId) return a
      return { ...a, events: [...a.events, ev], status: statusMap[event.type] || a.status, lastChecked: event.date }
    }))
    addLog('Maintenance', `Asset ${event.type}`, `ID ${assetId}: ${event.note}`)
  }, [addLog])

  // ── Audit revert ───────────────────────────────────────────────────────────
  const revertLog = useCallback((logId) => {
    const entry = auditLog.find((l) => l.id === logId)
    if (!entry?.prev) return
    if (entry.section === 'Items') {
      setItems((p) => p.map((i) => i.id === entry.prev.id ? { ...i, ...entry.prev } : i))
    }
    addLog(entry.section, 'Reverted', `"${entry.action}" — ${entry.detail}`)
    setAuditLog((l) => l.map((e) => e.id === logId ? { ...e, reverted: true, canRevert: false } : e))
  }, [auditLog, addLog])

  return {
    // State
    items, storage, members, assets, bills, expenses, purchases, auditLog, storageRecs, monthlyData, prevYearData,
    // Items
    addItem, updateItem, deleteItem,
    // Storage
    addStorage, updateStorage, deductStorage, approveRec, rejectRec,
    // Members
    addMember, updateMember, deleteMember,
    // Billing
    addBill,
    // Expenses
    addExpense, deleteExpense,
    // Purchases
    addPurchase,
    // Maintenance
    addAsset, updateAsset, addAssetEvent,
    // Audit
    revertLog,
  }
}

// ── Domain constants ──────────────────────────────────────────────────────────
export const MEMBER_GROUPS     = ['Employee', 'Owner', 'Cashier', 'Partner', 'Security', 'Cleaner', 'Delivery']
export const ASSET_CATEGORIES  = ['Electrical', 'Furniture', 'Appliance', 'Utility', 'IT', 'Safety', 'Other']
export const ITEM_CATEGORIES   = ['Beverages', 'Supplements', 'Snacks', 'Equipment', 'Other']
export const EXPENSE_CATEGORIES = ['Rent', 'Utilities', 'Supplies', 'Marketing', 'Maintenance', 'Salary Advance', 'Logistics', 'Other']
export const PAYMENT_MODES     = ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Cheque']
export const ITEM_EMOJIS       = ['☕','🫘','💧','🥤','🍵','⚡','💊','🫖','🍎','🥗','🧃','🫙','🥛','🍫','🧋','🍊','🫐','🍋','🌿','🥬']
