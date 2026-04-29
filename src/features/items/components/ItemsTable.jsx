import React from 'react'
import { Empty } from '../../../components/ui'

/**
 * Renders the product catalogue as a sortable table.
 * Shows pricing, margin badges, stock level and action buttons.
 */
export default function ItemsTable({ items, storage, onEdit, onToggle, onDelete }) {
  return (
    <div className="card">
      <div className="scroll-x">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Fixed Cost</th>
              <th>Industry Price</th>
              <th>Sell Price</th>
              <th>Gain / unit</th>
              <th>Margin</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={9}><Empty /></td></tr>}
            {items.map(item => {
              const gain   = item.sellPrice - item.fixedCost
              const margin = item.sellPrice ? Math.round((gain / item.sellPrice) * 100) : 0
              const stock  = storage.find(s => s.itemId === item.id)

              return (
                <tr key={item.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 22 }}>{item.emoji}</span>
                      <div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 13 }}>{item.name}</div>
                        {stock && (
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{stock.currentQty} in stock</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-purple">{item.category}</span></td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>₹{item.fixedCost}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)' }}>₹{item.industryPrice}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>₹{item.sellPrice}</td>
                  <td>
                    <span className={`badge ${gain > 0 ? 'badge-green' : 'badge-red'}`}>₹{gain}</span>
                  </td>
                  <td>
                    <span className={`badge ${margin > 30 ? 'badge-green' : margin > 15 ? 'badge-amber' : 'badge-red'}`}>
                      {margin}%
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${item.active ? 'badge-green' : 'badge-gray'}`}>
                      {item.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <button className="btn btn-ghost btn-xs" onClick={() => onEdit(item)}>Edit</button>
                      <button className="btn btn-ghost btn-xs" onClick={() => onToggle(item)}>
                        {item.active ? 'Disable' : 'Enable'}
                      </button>
                      <button className="btn btn-danger btn-xs" onClick={() => onDelete(item.id)}>Del</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
