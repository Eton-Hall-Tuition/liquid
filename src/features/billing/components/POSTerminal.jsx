import React, { useState } from 'react'
import { PAYMENT_MODES } from '../../../store/useStore'

/**
 * The main POS terminal UI.
 * Left: item tiles grid with search + category filter.
 * Right: live bill panel with quantity controls, discount, payment, change calculator.
 */
export default function POSTerminal({ items, storage, cashier, onBillComplete }) {
  const [lines, setLines]           = useState([])
  const [discount, setDiscount]     = useState('')
  const [paymentMode, setPaymentMode] = useState('Cash')
  const [cashGiven, setCashGiven]   = useState('')
  const [catFilter, setCatFilter]   = useState('All')
  const [searchQ, setSearchQ]       = useState('')

  const cats = ['All', ...new Set(items.filter(i => i.active).map(i => i.category))]
  const visibleItems = items.filter(i =>
    i.active &&
    (catFilter === 'All' || i.category === catFilter) &&
    (!searchQ || i.name.toLowerCase().includes(searchQ.toLowerCase()))
  )

  const addLine = (item) => setLines(l => {
    const ex = l.find(x => x.itemId === item.id)
    if (ex) return l.map(x => x.itemId === item.id ? { ...x, qty: x.qty + 1 } : x)
    return [...l, { itemId: item.id, name: item.name, emoji: item.emoji, qty: 1, price: item.sellPrice }]
  })

  const setQty = (itemId, qty) => {
    if (qty <= 0) setLines(l => l.filter(x => x.itemId !== itemId))
    else setLines(l => l.map(x => x.itemId === itemId ? { ...x, qty } : x))
  }

  const clearBill = () => {
    setLines([]); setDiscount(''); setCashGiven(''); setPaymentMode('Cash')
  }

  const subtotal    = lines.reduce((s, x) => s + x.qty * x.price, 0)
  const discountAmt = Math.min(Number(discount) || 0, subtotal)
  const total       = subtotal - discountAmt
  const cashPaid    = Number(cashGiven) || 0
  const change      = paymentMode === 'Cash' && cashPaid >= total ? cashPaid - total : 0
  const canPay      = lines.length > 0 && total > 0 && (paymentMode !== 'Cash' || cashPaid >= total)

  const handlePay = () => {
    onBillComplete({ items: lines, subtotal, discount: discountAmt, total, paymentMode, cashier, change })
    clearBill()
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16, alignItems: 'start' }}>
      {/* ── Item grid ── */}
      <div>
        {/* Search + category filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          <input
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder="Search items..."
            style={{ flex: 1, minWidth: 140 }}
          />
          {cats.map(c => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`chip${catFilter === c ? ' active' : ''}`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Item tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
          {visibleItems.map(item => {
            const inCart = lines.find(l => l.itemId === item.id)
            const stock  = storage.find(s => s.itemId === item.id)
            return (
              <button
                key={item.id}
                onClick={() => addLine(item)}
                style={{
                  background: inCart
                    ? 'color-mix(in srgb, var(--accent) 14%, transparent)'
                    : 'var(--bg-raised)',
                  border: `1px solid ${inCart ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 12, padding: '14px 10px',
                  cursor: 'pointer', textAlign: 'center',
                  transition: 'all 0.15s', position: 'relative',
                }}
              >
                {inCart && (
                  <div style={{
                    position: 'absolute', top: 6, right: 8,
                    background: 'var(--accent)', color: 'var(--bg-base)',
                    borderRadius: '50%', width: 20, height: 20,
                    fontSize: 11, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    {inCart.qty}
                  </div>
                )}
                <div style={{ fontSize: 28, marginBottom: 6 }}>{item.emoji}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 4 }}>
                  {item.name}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>
                  ₹{item.sellPrice}
                </div>
                {stock && (
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                    {stock.currentQty} left
                  </div>
                )}
              </button>
            )
          })}
          {visibleItems.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: 13 }}>
              No items found
            </div>
          )}
        </div>
      </div>

      {/* ── Bill panel ── */}
      <div style={{
        background: 'var(--bg-raised)',
        border: '1px solid var(--border)',
        borderRadius: 18, overflow: 'hidden',
        position: 'sticky', top: '1rem',
      }}>
        {/* Bill header */}
        <div style={{
          padding: '13px 18px', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', fontSize: 15 }}>
            Current Bill
          </span>
          {lines.length > 0 && (
            <button
              onClick={clearBill}
              style={{
                fontSize: 11, color: 'var(--danger)',
                background: 'color-mix(in srgb, var(--danger) 10%, transparent)',
                border: '1px solid color-mix(in srgb, var(--danger) 25%, transparent)',
                borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Line items */}
        <div style={{ minHeight: 160, maxHeight: 280, overflowY: 'auto', padding: '6px 0' }}>
          {lines.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              ← Tap items to add
            </div>
          ) : lines.map(l => (
            <div key={l.itemId} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 16px',
              borderBottom: '1px solid color-mix(in srgb, var(--border) 40%, transparent)',
            }}>
              <span style={{ fontSize: 18 }}>{l.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {l.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>₹{l.price} each</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button onClick={() => setQty(l.itemId, l.qty - 1)} style={{ width: 24, height: 24, borderRadius: 5, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, minWidth: 18, textAlign: 'center', color: 'var(--text-primary)' }}>{l.qty}</span>
                <button onClick={() => setQty(l.itemId, l.qty + 1)} style={{ width: 24, height: 24, borderRadius: 5, border: '1px solid color-mix(in srgb, var(--accent) 40%, transparent)', background: 'color-mix(in srgb, var(--accent) 8%, transparent)', color: 'var(--accent)', cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', minWidth: 52, textAlign: 'right' }}>
                ₹{(l.qty * l.price).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>

        {/* Discount + totals + payment */}
        <div style={{ padding: '13px 16px', borderTop: '1px solid var(--border)' }}>
          {/* Discount */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', flex: 1 }}>Discount (₹)</span>
            <input
              type="number" value={discount}
              onChange={e => setDiscount(e.target.value)}
              min={0} max={subtotal}
              style={{ width: 90, padding: '6px 10px', textAlign: 'right', fontSize: 13 }}
              placeholder="0"
            />
          </div>

          {/* Subtotal / Total */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 3 }}>
            <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          {discountAmt > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 3 }}>
              <span style={{ color: 'var(--warning)' }}>Discount</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--warning)' }}>−₹{discountAmt}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-primary)' }}>Total</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>₹{total.toLocaleString('en-IN')}</span>
          </div>

          {/* Payment mode */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text-muted)', marginBottom: 6 }}>Payment</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5 }}>
              {PAYMENT_MODES.map(m => (
                <button
                  key={m}
                  onClick={() => setPaymentMode(m)}
                  style={{
                    padding: '7px 4px', borderRadius: 7,
                    border: `1px solid ${paymentMode === m ? 'var(--accent)' : 'var(--border)'}`,
                    background: paymentMode === m ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'transparent',
                    color: paymentMode === m ? 'var(--accent)' : 'var(--text-muted)',
                    cursor: 'pointer', fontSize: 11,
                    fontWeight: paymentMode === m ? 700 : 400,
                    transition: 'all 0.15s', fontFamily: 'var(--font-body)',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Cash mode extras */}
          {paymentMode === 'Cash' && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text-muted)', marginBottom: 6 }}>Cash Given</div>
              <input
                type="number" value={cashGiven}
                onChange={e => setCashGiven(e.target.value)}
                placeholder={`Min ₹${total}`}
                style={{ marginBottom: 7, textAlign: 'right', fontSize: 16 }}
              />
              {/* Quick amounts */}
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {[...new Set([total, Math.ceil(total / 10) * 10, Math.ceil(total / 50) * 50, Math.ceil(total / 100) * 100, 500, 1000])]
                  .filter(v => v >= total)
                  .sort((a, b) => a - b)
                  .slice(0, 5)
                  .map(amt => (
                    <button
                      key={amt}
                      onClick={() => setCashGiven(String(amt))}
                      style={{
                        padding: '5px 10px', borderRadius: 6,
                        border: '1px solid var(--border-strong)',
                        background: 'var(--bg-overlay)', color: 'var(--text-secondary)',
                        cursor: 'pointer', fontSize: 12,
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      ₹{amt}
                    </button>
                  ))
                }
              </div>
              {cashPaid >= total && cashPaid > 0 && (
                <div style={{
                  marginTop: 8, padding: '8px 12px',
                  background: 'color-mix(in srgb, var(--success) 10%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--success) 25%, transparent)',
                  borderRadius: 8, display: 'flex', justifyContent: 'space-between', fontSize: 14,
                }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Change</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--success)', fontSize: 16 }}>
                    ₹{change.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Pay button */}
          <button
            onClick={handlePay}
            disabled={!canPay}
            style={{
              width: '100%', marginTop: 14, padding: '14px', borderRadius: 10, border: 'none',
              background: canPay ? 'var(--accent)' : 'var(--bg-overlay)',
              color: canPay ? 'var(--bg-base)' : 'var(--text-muted)',
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16,
              cursor: canPay ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
            }}
          >
            {lines.length === 0
              ? 'Add items to start'
              : !canPay && paymentMode === 'Cash'
                ? `Need ₹${(total - cashPaid).toLocaleString('en-IN')} more`
                : `Collect ₹${total.toLocaleString('en-IN')} →`
            }
          </button>
        </div>
      </div>
    </div>
  )
}
