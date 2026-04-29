import React, { useState } from 'react'
import { Modal } from '../../../components/ui'
import { ITEM_CATEGORIES, ITEM_EMOJIS } from '../../../store/useStore'

/**
 * Modal for adding or editing a product/item.
 * Shows emoji picker, pricing fields, and live gain/margin calculator.
 */
export default function ItemModal({ item, onSave, onClose }) {
  const [f, setF] = useState(item || {
    name: '', emoji: '☕', category: 'Beverages',
    fixedCost: '', industryPrice: '', sellPrice: '', active: true,
  })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  const gain   = (Number(f.sellPrice) || 0) - (Number(f.fixedCost) || 0)
  const margin = f.sellPrice ? Math.round((gain / Number(f.sellPrice)) * 100) : 0

  return (
    <Modal title={item ? `Edit — ${item.name}` : 'Add New Item'} onClose={onClose} size="lg">
      {/* Emoji picker */}
      <div className="form-group">
        <div className="form-label">Emoji / Icon</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {ITEM_EMOJIS.map(e => (
            <button
              key={e}
              onClick={() => set('emoji', e)}
              style={{
                fontSize: 20, padding: 5, borderRadius: 7,
                border: f.emoji === e ? '2px solid var(--accent)' : '1px solid transparent',
                background: f.emoji === e
                  ? 'color-mix(in srgb, var(--accent) 12%, transparent)'
                  : 'var(--bg-overlay)',
                cursor: 'pointer', transition: 'var(--transition)',
              }}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Name + Category */}
      <div className="form-grid-2">
        <div className="form-group">
          <div className="form-label">Item Name</div>
          <input value={f.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Cold Brew Coffee" />
        </div>
        <div className="form-group">
          <div className="form-label">Category</div>
          <select value={f.category} onChange={e => set('category', e.target.value)}>
            {ITEM_CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Pricing */}
      <div className="form-grid-3">
        <div className="form-group">
          <div className="form-label">Fixed Cost (₹)</div>
          <input type="number" value={f.fixedCost} onChange={e => set('fixedCost', e.target.value)} placeholder="0" />
        </div>
        <div className="form-group">
          <div className="form-label">Industry Price (₹)</div>
          <input type="number" value={f.industryPrice} onChange={e => set('industryPrice', e.target.value)} placeholder="0" />
        </div>
        <div className="form-group">
          <div className="form-label">Sell Price (₹)</div>
          <input type="number" value={f.sellPrice} onChange={e => set('sellPrice', e.target.value)} placeholder="0" />
        </div>
      </div>

      {/* Live gain preview */}
      {f.sellPrice && f.fixedCost && (
        <div className={`callout ${gain > 0 ? 'callout-green' : 'callout-red'}`} style={{ marginBottom: '1rem' }}>
          Gain per unit: <strong>₹{gain}</strong> · Margin: <strong>{margin}%</strong>
          {gain <= 0 && ' ⚠ Selling below cost!'}
        </div>
      )}

      <div className="form-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button
          className="btn btn-primary"
          onClick={() => onSave({
            ...f,
            fixedCost:     Number(f.fixedCost),
            industryPrice: Number(f.industryPrice),
            sellPrice:     Number(f.sellPrice),
          })}
        >
          {item ? 'Save Changes' : 'Add Item'}
        </button>
      </div>
    </Modal>
  )
}
