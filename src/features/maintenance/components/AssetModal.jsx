import React, { useState } from 'react'
import { Modal } from '../../../components/ui'
import { ASSET_CATEGORIES } from '../../../store/useStore'
import { formatCurrency } from '../../../utils/format'

const STATUSES = ['Good','Damaged','Under Repair','Replaced','Needs Check']

export default function AssetModal({ asset, onSave, onClose }) {
  const [f, setF] = useState(asset||{name:'',category:'Furniture',count:1,costEach:'',status:'Good',installDate:'',lastChecked:new Date().toISOString().slice(0,10)})
  const set=(k,v)=>setF(p=>({...p,[k]:v}))
  const total=(Number(f.count)||0)*(Number(f.costEach)||0)
  return (
    <Modal title={asset?`Edit — ${asset.name}`:'Add Asset'} onClose={onClose}>
      <div className="form-grid-2">
        <div className="form-group"><div className="form-label">Asset Name</div><input value={f.name} onChange={e=>set('name',e.target.value)}/></div>
        <div className="form-group"><div className="form-label">Category</div><select value={f.category} onChange={e=>set('category',e.target.value)}>{ASSET_CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
      </div>
      <div className="form-grid-3">
        <div className="form-group"><div className="form-label">Count</div><input type="number" value={f.count} onChange={e=>set('count',e.target.value)} min={1}/></div>
        <div className="form-group"><div className="form-label">Cost Each (₹)</div><input type="number" value={f.costEach} onChange={e=>set('costEach',e.target.value)}/></div>
        <div className="form-group"><div className="form-label">Status</div><select value={f.status} onChange={e=>set('status',e.target.value)}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></div>
      </div>
      {total>0&&<div className="callout callout-blue" style={{marginBottom:'1rem'}}>Total value: <strong>{formatCurrency(total)}</strong></div>}
      <div className="form-grid-2">
        <div className="form-group"><div className="form-label">Install Date</div><input type="date" value={f.installDate} onChange={e=>set('installDate',e.target.value)}/></div>
        <div className="form-group"><div className="form-label">Last Checked</div><input type="date" value={f.lastChecked} onChange={e=>set('lastChecked',e.target.value)}/></div>
      </div>
      <div className="form-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={()=>onSave({...f,count:Number(f.count),costEach:Number(f.costEach),totalCost:Number(f.count)*Number(f.costEach)})}>Save</button>
      </div>
    </Modal>
  )
}
