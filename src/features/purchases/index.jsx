import React, { useState } from 'react'
import { PageWrapper, Modal, AuditLog, Empty } from '../../components/ui'
import { PAYMENT_MODES } from '../../store/useStore'
import { formatCurrency } from '../../utils/format'

function PurchaseModal({ items, onSave, onClose }) {
  const [f, setF] = useState({ date:new Date().toISOString().slice(0,10),itemId:'',itemName:'',supplier:'',qty:'',unitCost:'',invoiceNo:'',paymentMode:'Bank Transfer' })
  const set=(k,v)=>setF(p=>({...p,[k]:v}))
  const total=(Number(f.qty)||0)*(Number(f.unitCost)||0)
  return (
    <Modal title="Record Purchase" onClose={onClose}>
      <div className="form-grid-2">
        <div className="form-group"><div className="form-label">Date</div><input type="date" value={f.date} onChange={e=>set('date',e.target.value)}/></div>
        <div className="form-group"><div className="form-label">Invoice No.</div><input value={f.invoiceNo} onChange={e=>set('invoiceNo',e.target.value)} placeholder="INV-XXX"/></div>
      </div>
      <div className="form-group">
        <div className="form-label">Link to Item</div>
        <select value={f.itemId} onChange={e=>{ const it=items.find(i=>i.id===Number(e.target.value)); set('itemId',Number(e.target.value)); if(it)set('itemName',it.name) }}>
          <option value="">— Select item —</option>
          {items.map(i=><option key={i.id} value={i.id}>{i.emoji} {i.name}</option>)}
        </select>
      </div>
      <div className="form-group"><div className="form-label">Supplier</div><input value={f.supplier} onChange={e=>set('supplier',e.target.value)}/></div>
      <div className="form-grid-2">
        <div className="form-group"><div className="form-label">Qty Purchased</div><input type="number" value={f.qty} onChange={e=>set('qty',e.target.value)}/></div>
        <div className="form-group"><div className="form-label">Unit Cost (₹)</div><input type="number" value={f.unitCost} onChange={e=>set('unitCost',e.target.value)}/></div>
      </div>
      {total>0&&<div className="callout callout-blue" style={{ marginBottom:'1rem' }}>Total: <strong>{formatCurrency(total)}</strong></div>}
      <div className="form-group"><div className="form-label">Payment Mode</div><select value={f.paymentMode} onChange={e=>set('paymentMode',e.target.value)}>{PAYMENT_MODES.map(m=><option key={m}>{m}</option>)}</select></div>
      <div className="form-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={()=>onSave({...f,qty:Number(f.qty),unitCost:Number(f.unitCost),totalCost:total})}>Record</button>
      </div>
    </Modal>
  )
}

export default function Purchases({ store }) {
  const [showModal, setShowModal] = useState(false)
  const total    = store.purchases.reduce((s,p)=>s+p.totalCost,0)
  const suppliers = [...new Set(store.purchases.map(p=>p.supplier))]

  return (
    <PageWrapper
      title="Purchases"
      subtitle="All stock purchases from suppliers — invoices, costs, payment tracking"
      actions={<button className="btn btn-primary" onClick={()=>setShowModal(true)}>+ Record Purchase</button>}
    >
      <div className="grid-4" style={{ marginBottom:'1.3rem' }}>
        <div className="stat-card"><div className="stat-label">Total Purchases</div><div className="stat-value">{store.purchases.length}</div></div>
        <div className="stat-card"><div className="stat-label">Total Spent</div><div className="stat-value" style={{ color:'var(--info)',fontSize:'1.4rem' }}>{formatCurrency(total)}</div></div>
        <div className="stat-card"><div className="stat-label">Suppliers</div><div className="stat-value">{suppliers.length}</div></div>
        <div className="stat-card"><div className="stat-label">Avg Order</div><div className="stat-value" style={{ fontSize:'1.4rem' }}>{store.purchases.length?formatCurrency(Math.round(total/store.purchases.length)):'—'}</div></div>
      </div>

      <div className="card">
        <div className="scroll-x">
          <table>
            <thead><tr><th>Date</th><th>Invoice</th><th>Item</th><th>Supplier</th><th>Qty</th><th>Unit Cost</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead>
            <tbody>
              {store.purchases.length===0&&<tr><td colSpan={9}><Empty/></td></tr>}
              {store.purchases.map(p=>(
                <tr key={p.id}>
                  <td style={{ fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-muted)' }}>{p.date}</td>
                  <td style={{ fontFamily:'var(--font-mono)',fontSize:12,color:'var(--accent-2)' }}>{p.invoiceNo}</td>
                  <td style={{ color:'var(--text-primary)',fontWeight:600 }}>{p.itemName}</td>
                  <td style={{ color:'var(--text-secondary)',fontSize:13 }}>{p.supplier}</td>
                  <td style={{ fontFamily:'var(--font-mono)' }}>{p.qty}</td>
                  <td style={{ fontFamily:'var(--font-mono)',color:'var(--text-secondary)' }}>₹{p.unitCost}</td>
                  <td style={{ fontFamily:'var(--font-mono)',fontWeight:700,color:'var(--info)' }}>{formatCurrency(p.totalCost)}</td>
                  <td><span className="badge badge-blue">{p.paymentMode}</span></td>
                  <td><span className="badge badge-green">{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AuditLog logs={store.auditLog} filter="Purchases" onRevert={null}/>
      {showModal&&<PurchaseModal items={store.items} onClose={()=>setShowModal(false)} onSave={data=>{store.addPurchase(data);setShowModal(false)}}/>}
    </PageWrapper>
  )
}
