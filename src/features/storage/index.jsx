import React, { useState } from 'react'
import { PageWrapper, AuditLog, Empty } from '../../components/ui'
import { formatCurrency, daysUntil } from '../../utils/format'
import StockModal from './components/StockModal'

function expiryBadge(days) {
  if (days === null) return { cls: 'badge-gray',  label: '—' }
  if (days < 0)     return { cls: 'badge-red',   label: 'Expired' }
  if (days <= 30)   return { cls: 'badge-amber', label: `${days}d` }
  if (days <= 90)   return { cls: 'badge-blue',  label: `${days}d` }
  return              { cls: 'badge-green', label: `${days}d` }
}

export default function Storage({ store }) {
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem]   = useState(null)
  const [activeTab, setActiveTab] = useState('stock')

  const totalInvested = store.storage.reduce((s, x) => s + x.boughtTotal, 0)
  const totalUnits    = store.storage.reduce((s, x) => s + x.currentQty, 0)
  const expiringSoon  = store.storage.filter(s => { const d = daysUntil(s.expiryDate); return d !== null && d >= 0 && d <= 60 })
  const expired       = store.storage.filter(s => { const d = daysUntil(s.expiryDate); return d !== null && d < 0 })
  const pendingRecs   = store.storageRecs.filter(r => !r.approved && !r.rejected)

  const openNew    = ()     => { setEditItem(null); setShowModal(true) }
  const openEdit   = (item) => { setEditItem(item); setShowModal(true) }
  const closeModal = ()     => { setShowModal(false); setEditItem(null) }

  const handleSave = (data) => {
    if (editItem) store.updateStorage(editItem.id, data)
    else          store.addStorage(data)
    closeModal()
  }

  return (
    <PageWrapper
      title="Storage"
      subtitle="Stock levels, expiry tracking, restock recommendations"
      actions={<button className="btn btn-primary" onClick={openNew}>+ Add Stock</button>}
    >
      <div className="grid-4" style={{ marginBottom: '1.3rem' }}>
        <div className="stat-card"><div className="stat-label">Stock Entries</div><div className="stat-value">{store.storage.length}</div></div>
        <div className="stat-card"><div className="stat-label">Total Invested</div><div className="stat-value" style={{ color:'var(--info)',fontSize:'1.4rem' }}>{formatCurrency(totalInvested)}</div></div>
        <div className="stat-card"><div className="stat-label">Units in Store</div><div className="stat-value">{totalUnits.toLocaleString()}</div></div>
        <div className="stat-card">
          <div className="stat-label">Expiry Alerts</div>
          <div className="stat-value" style={{ color: expired.length>0?'var(--danger)':expiringSoon.length>0?'var(--warning)':'var(--success)' }}>
            {expired.length>0 ? `${expired.length} exp.` : expiringSoon.length}
          </div>
          <div className="stat-sub">{expiringSoon.length} expiring in 60d</div>
        </div>
      </div>

      <div className="sub-nav">
        <button className={'sub-tab'+(activeTab==='stock'?' active':'')} onClick={()=>setActiveTab('stock')}>Stock Ledger</button>
        <button className={'sub-tab'+(activeTab==='recs'?' active':'')} onClick={()=>setActiveTab('recs')}>
          {'Recommendations'+(pendingRecs.length>0?` (${pendingRecs.length})`:'')}
        </button>
      </div>

      {activeTab === 'stock' && (
        <>
          {(expired.length>0||expiringSoon.length>0) && (
            <div className={`callout ${expired.length>0?'callout-red':'callout-amber'}`} style={{ marginBottom:'1rem' }}>
              {expired.length>0 && <div>⚠ {expired.length} expired: {expired.map(s=>s.itemName).join(', ')}</div>}
              {expiringSoon.length>0 && <div>⏰ {expiringSoon.length} expiring within 60 days</div>}
            </div>
          )}
          <div className="card">
            <div className="scroll-x">
              <table>
                <thead><tr><th>Item</th><th>Supplier</th><th>Bought</th><th>Total Cost</th><th>Cost/unit</th><th>In Stock</th><th>Level</th><th>Purchased</th><th>Expiry</th><th></th></tr></thead>
                <tbody>
                  {store.storage.length===0 && <tr><td colSpan={10}><Empty/></td></tr>}
                  {store.storage.map(item => {
                    const used    = item.boughtQty - item.currentQty
                    const pct     = Math.round((used / item.boughtQty) * 100)
                    const costU   = item.boughtQty ? (item.boughtTotal/item.boughtQty).toFixed(2) : '—'
                    const days    = daysUntil(item.expiryDate)
                    const eb      = expiryBadge(days)
                    const low     = item.currentQty < 50
                    return (
                      <tr key={item.id}>
                        <td style={{ color:'var(--text-primary)',fontWeight:600 }}>{item.itemName}</td>
                        <td style={{ color:'var(--text-muted)',fontSize:12 }}>{item.supplier}</td>
                        <td style={{ fontFamily:'var(--font-mono)' }}>{item.boughtQty}</td>
                        <td style={{ fontFamily:'var(--font-mono)',color:'var(--info)' }}>{formatCurrency(item.boughtTotal)}</td>
                        <td style={{ fontFamily:'var(--font-mono)',fontSize:12 }}>₹{costU}</td>
                        <td style={{ fontFamily:'var(--font-mono)',color:low?'var(--warning)':'var(--success)',fontWeight:600 }}>{item.currentQty}</td>
                        <td>
                          <div style={{ display:'flex',alignItems:'center',gap:6 }}>
                            <div className="progress-track" style={{ width:60 }}>
                              <div className="progress-fill" style={{ width:`${100-pct}%`,background:low?'var(--warning)':'var(--success)' }}/>
                            </div>
                            <span style={{ fontSize:11,fontFamily:'var(--font-mono)',color:'var(--text-muted)' }}>{100-pct}%</span>
                          </div>
                        </td>
                        <td style={{ fontFamily:'var(--font-mono)',fontSize:12 }}>{item.purchaseDate}</td>
                        <td><span className={`badge ${eb.cls}`}>{eb.label}</span></td>
                        <td><button className="btn btn-ghost btn-xs" onClick={()=>openEdit(item)}>Edit</button></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'recs' && (
        <div>
          <div className="callout callout-blue" style={{ marginBottom:'1rem' }}>
            Smart recommendations based on stock and expiry. Admin approval required before any action.
          </div>
          {store.storageRecs.length===0 && <Empty message="No recommendations right now."/>}
          {store.storageRecs.map(rec => (
            <div key={rec.id} className="card-sm" style={{ display:'flex',alignItems:'center',gap:12,flexWrap:'wrap',marginBottom:10,opacity:rec.approved||rec.rejected?0.55:1 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex',gap:8,alignItems:'center',marginBottom:4 }}>
                  <span className={`badge ${rec.type==='restock'?'badge-blue':'badge-amber'}`}>{rec.type==='restock'?'📦 Restock':'🏷️ Offer'}</span>
                  <span style={{ fontWeight:600,color:'var(--text-primary)',fontSize:13 }}>{rec.itemName}</span>
                </div>
                <div style={{ fontSize:12,color:'var(--text-muted)' }}>{rec.reason}</div>
              </div>
              <div style={{ display:'flex',gap:6 }}>
                {rec.approved && <span className="badge badge-green">Approved</span>}
                {rec.rejected && <span className="badge badge-red">Rejected</span>}
                {!rec.approved&&!rec.rejected && (
                  <>
                    <button className="btn btn-primary btn-xs" onClick={()=>store.approveRec(rec.id)}>Approve</button>
                    <button className="btn btn-danger btn-xs"  onClick={()=>store.rejectRec(rec.id)}>Reject</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AuditLog logs={store.auditLog} filter="Storage" onRevert={null}/>

      {showModal && (
        <StockModal item={editItem} items={store.items} onClose={closeModal} onSave={handleSave}/>
      )}
    </PageWrapper>
  )
}
