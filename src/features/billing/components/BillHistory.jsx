import React from 'react'
import { formatCurrency } from '../../../utils/format'

/**
 * Displays the full bill history table with summary stats.
 */
export default function BillHistory({ bills }) {
  const totalRevenue = bills.reduce((s, b) => s + b.total, 0)
  const totalDiscount = bills.reduce((s, b) => s + b.discount, 0)
  const avgBill = bills.length ? Math.round(totalRevenue / bills.length) : 0

  return (
    <div>
      {/* Stats row */}
      <div className="grid-4" style={{ marginBottom: '1.3rem' }}>
        {[
          ['Total Bills',    bills.length,              'var(--text-primary)'],
          ['Total Revenue',  formatCurrency(totalRevenue), 'var(--accent)'],
          ['Avg Bill Value', formatCurrency(avgBill),    'var(--accent-3)'],
          ['Discounts Given',formatCurrency(totalDiscount),'var(--warning)'],
        ].map(([label, val, color]) => (
          <div key={label} className="stat-card">
            <div className="stat-label">{label}</div>
            <div className="stat-value" style={{ color, fontSize: '1.4rem' }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card">
        <div className="scroll-x">
          <table>
            <thead>
              <tr>
                <th>Bill No.</th><th>Date</th><th>Cashier</th><th>Items</th>
                <th>Subtotal</th><th>Discount</th><th>Total</th><th>Payment</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bills.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No bills yet.</td></tr>
              )}
              {bills.map(bill => (
                <tr key={bill.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 600 }}>{bill.billNo}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{bill.date}</td>
                  <td>{bill.cashier}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {bill.items.map(l => `${l.emoji}×${l.qty}`).join(' ')}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>₹{bill.subtotal.toLocaleString('en-IN')}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: bill.discount > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>
                    {bill.discount > 0 ? `−₹${bill.discount}` : '—'}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent)' }}>
                    ₹{bill.total.toLocaleString('en-IN')}
                  </td>
                  <td><span className="badge badge-blue">{bill.paymentMode}</span></td>
                  <td><span className="badge badge-green">Paid</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
