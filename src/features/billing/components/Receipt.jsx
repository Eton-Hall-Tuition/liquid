import React from 'react'

/**
 * Receipt modal shown after a successful payment.
 * Displays full bill summary with items, totals, payment mode and change.
 */
export default function Receipt({ bill, onClose, onNew }) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 600, backdropFilter: 'blur(8px)',
    }}>
      <div style={{
        background: 'var(--bg-raised)',
        border: '1px solid var(--border-strong)',
        borderRadius: 22, padding: '2rem',
        width: 340, maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.4rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--accent)' }}>
            liquid leviyathan
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            liquid.leviyathan
          </div>
          <div style={{
            marginTop: 8, padding: '6px 0',
            borderTop: '1px dashed var(--border-strong)',
            borderBottom: '1px dashed var(--border-strong)',
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{bill.date} · {bill.cashier}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{bill.billNo}</div>
          </div>
        </div>

        {/* Line items */}
        {bill.items.map((li, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, fontSize: 14 }}>
            <span>
              {li.emoji} {li.name}
              <span style={{ color: 'var(--text-muted)' }}> ×{li.qty}</span>
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
              ₹{(li.qty * li.price).toLocaleString('en-IN')}
            </span>
          </div>
        ))}

        {/* Totals */}
        <div style={{ borderTop: '1px dashed var(--border-strong)', marginTop: 12, paddingTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>₹{bill.subtotal.toLocaleString('en-IN')}</span>
          </div>

          {bill.discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
              <span style={{ color: 'var(--warning)' }}>Discount</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--warning)' }}>−₹{bill.discount}</span>
            </div>
          )}

          <div style={{
            display: 'flex', justifyContent: 'space-between',
            marginTop: 8, paddingTop: 8,
            borderTop: '1px solid var(--border)',
          }}>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 17 }}>Total</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent)', fontSize: 20 }}>
              ₹{bill.total.toLocaleString('en-IN')}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 13 }}>
            <span style={{ color: 'var(--text-muted)' }}>Paid via</span>
            <span style={{ color: 'var(--accent-2)', fontWeight: 600 }}>{bill.paymentMode}</span>
          </div>

          {bill.change > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 13 }}>
              <span style={{ color: 'var(--text-muted)' }}>Change returned</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--success)' }}>₹{bill.change}</span>
            </div>
          )}
        </div>

        <div style={{
          textAlign: 'center', marginTop: '1.3rem', fontSize: 11,
          color: 'var(--text-muted)',
          borderTop: '1px dashed var(--border-strong)', paddingTop: 12,
        }}>
          Thank you for visiting! Come again ✦
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: '1.1rem' }}>
          <button
            onClick={onNew}
            style={{
              flex: 1, padding: '11px', borderRadius: 9, border: 'none',
              background: 'var(--accent)', color: 'var(--bg-base)',
              fontWeight: 700, cursor: 'pointer', fontSize: 14,
              fontFamily: 'var(--font-body)',
            }}
          >
            New Bill
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '11px', borderRadius: 9,
              border: '1px solid var(--border-strong)', background: 'transparent',
              color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14,
              fontFamily: 'var(--font-body)',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
