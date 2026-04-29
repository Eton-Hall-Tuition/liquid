import React from 'react'
import { formatCurrency } from '../../../utils/format'
import { PAYMENT_MODES } from '../../../store/useStore'

/**
 * Payment mode split + top items sold analytics panel.
 */
export default function BillingAnalytics({ bills }) {
  const totalRevenue = bills.reduce((s, b) => s + b.total, 0)

  const paymentBreakdown = PAYMENT_MODES.map(m => ({
    mode:  m,
    count: bills.filter(b => b.paymentMode === m).length,
    total: bills.filter(b => b.paymentMode === m).reduce((s, b) => s + b.total, 0),
  })).filter(p => p.count > 0)

  // Aggregate items sold across all bills
  const itemCounts = {}
  bills.forEach(b => b.items.forEach(li => {
    if (!itemCounts[li.name]) itemCounts[li.name] = { name: li.name, emoji: li.emoji, qty: 0, revenue: 0 }
    itemCounts[li.name].qty     += li.qty
    itemCounts[li.name].revenue += li.qty * li.price
  }))
  const topItems = Object.values(itemCounts).sort((a, b) => b.revenue - a.revenue)

  const COLORS = ['var(--accent)', 'var(--info)', 'var(--accent-3)', 'var(--warning)', '#a78bfa']

  return (
    <div className="grid-2">
      {/* Payment mode split */}
      <div className="card">
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Payment Mode Split
        </div>
        {paymentBreakdown.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No data yet.</p>
        )}
        {paymentBreakdown.map((p, i) => {
          const pct = Math.round((p.total / (totalRevenue || 1)) * 100)
          return (
            <div key={p.mode} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {p.mode} <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>({p.count} bills)</span>
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: COLORS[i] }}>
                  {formatCurrency(p.total)} ({pct}%)
                </span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${pct}%`, background: COLORS[i] }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Top items */}
      <div className="card">
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Top Items Sold
        </div>
        {topItems.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No sales recorded yet.</p>
        )}
        {topItems.map((item, i) => (
          <div key={item.name} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid color-mix(in srgb, var(--border) 40%, transparent)', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', minWidth: 18 }}>#{i + 1}</span>
            <span style={{ fontSize: 18 }}>{item.emoji}</span>
            <div style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)' }}>{item.name}</div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>{formatCurrency(item.revenue)}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.qty} units</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
