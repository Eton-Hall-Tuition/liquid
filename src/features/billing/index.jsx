import React, { useState } from 'react'
import { AuditLog } from '../../components/ui'
import POSTerminal      from './components/POSTerminal'
import Receipt          from './components/Receipt'
import BillHistory      from './components/BillHistory'
import BillingAnalytics from './components/BillingAnalytics'

const TABS = [
  { id: 'pos',       label: 'Terminal'  },
  { id: 'history',   label: 'History'   },
  { id: 'analytics', label: 'Analytics' },
]

export default function Billing({ store }) {
  const [activeTab, setActiveTab]         = useState('pos')
  const [completedBill, setCompletedBill] = useState(null)

  const cashier = store.members.find(m => m.group === 'Cashier' && m.status === 'Active')?.name || 'Admin'

  const handleBillComplete = (billData) => {
    const bill = store.addBill(billData)
    setCompletedBill(bill)
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <div className="accent-bar" />
          <h2 className="page-title">POS / Billing</h2>
          <p className="page-subtitle">
            Cashier: <span style={{ color: 'var(--accent-2)' }}>{cashier}</span>
            {' '}· Stock auto-deducted on each sale
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {TABS.map(({ id, label }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`btn btn-sm ${activeTab === id ? 'btn-primary' : 'btn-secondary'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'pos'       && <POSTerminal items={store.items} storage={store.storage} cashier={cashier} onBillComplete={handleBillComplete} />}
      {activeTab === 'history'   && <BillHistory bills={store.bills} />}
      {activeTab === 'analytics' && <BillingAnalytics bills={store.bills} />}

      <AuditLog logs={store.auditLog} filter="Billing" onRevert={null} />

      {completedBill && (
        <Receipt bill={completedBill} onClose={() => setCompletedBill(null)} onNew={() => setCompletedBill(null)} />
      )}
    </div>
  )
}
