import React, { useState } from 'react'
import { Modal } from '../../../components/ui'

export default function StockModal({ item, items, onSave, onClose }) {
  const [f, setF] = useState(item||{itemId:'',itemName:'',supplier:'',boughtQty:'',boughtTotal:'',currentQty:'',purchaseDate:new Date().toISOString().slice(0,10),expiryDate:''})
  const set=(k,v)=>setF(p=>({...p,[k]:v}))
  const costPerUnit=f.boughtQty&&f.boughtTotal?(Number(f.boughtTotal)/Number(f.boughtQty)).toFixed(2):null
  return (
    <Modal title={item?'Edit Stock':'Add Stock'} onClose={onClose} size="lg">
      {!item&&(
        <div className="form-group">
          <div className="form-label">Link to Item</div>
          <select value={f.itemId} onChange={e=>{const it=items.find(i=>i.id===Number(e.target.value));set('itemId',Number(e.target.value));if(it)set('itemName',it.name)}}>
            <option value="">— Select item —</option>
            {items.map(i=><option key={i.id} value={i.id}>{i.emoji} {i.name}</option>)}
          </select>
        </div>
      )}
      <div className="form-grid-2">
        <div className="form-group"><div className="form-label">Item Name</div><input value={f.itemName} onChange={e=>set('itemName',e.target.value)}/></div>
        <div className="form-group"><div className="form-label">Supplier</div><input value={f.supplier} onChange={e=>set('supplier',e.target.value)}/></div>
      </div>
      <div className="form-grid-3">
        <div className="form-group"><div className="form-label">Units Bought</div><input type="number" value={f.boughtQty} onChange={e=>set('boughtQty',e.target.value)}/></div>
        <div className="form-group"><div className="form-label">Total Cost (₹)</div><input type="number" value={f.boughtTotal} onChange={e=>set('boughtTotal',e.target.value)}/></div>
        <div className="form-group"><div className="form-label">Current Stock</div><input type="number" value={f.currentQty} onChange={e=>set('currentQty',e.target.value)}/></div>
      </div>
      {costPerUnit&&<div className="callout callout-blue" style={{marginBottom:'1rem'}}>Cost per unit: <strong>₹{costPerUnit}</strong></div>}
      <div className="form-grid-2">
        <div className="form-group"><div className="form-label">Purchase Date</div><input type="date" value={f.purchaseDate} onChange={e=>set('purchaseDate',e.target.value)}/></div>
        <div className="form-group"><div className="form-label">Expiry Date</div><input type="date" value={f.expiryDate} onChange={e=>set('expiryDate',e.target.value)}/></div>
      </div>
      <div className="form-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={()=>onSave({...f,boughtQty:Number(f.boughtQty),boughtTotal:Number(f.boughtTotal),currentQty:Number(f.currentQty)})}>Save</button>
      </div>
    </Modal>
  )
}
