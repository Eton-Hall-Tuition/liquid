import React, { useState } from 'react'
import { Modal } from '../../../components/ui'

const EVENT_TYPES = ['Damage','Repair','Replacement','Inspection','Maintenance']

export default function EventModal({ asset, onSave, onClose }) {
  const [f, setF] = useState({type:'Repair',date:new Date().toISOString().slice(0,10),cost:'',note:''})
  const set=(k,v)=>setF(p=>({...p,[k]:v}))
  return (
    <Modal title={`Log Event — ${asset.name}`} onClose={onClose}>
      <div className="form-grid-2">
        <div className="form-group"><div className="form-label">Event Type</div><select value={f.type} onChange={e=>set('type',e.target.value)}>{EVENT_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
        <div className="form-group"><div className="form-label">Date</div><input type="date" value={f.date} onChange={e=>set('date',e.target.value)}/></div>
      </div>
      <div className="form-group"><div className="form-label">Cost (₹) — 0 if none</div><input type="number" value={f.cost} onChange={e=>set('cost',e.target.value)}/></div>
      <div className="form-group"><div className="form-label">Notes</div><textarea value={f.note} onChange={e=>set('note',e.target.value)} rows={3} placeholder="What happened / what was done…"/></div>
      <div className="form-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={()=>onSave({...f,cost:Number(f.cost)})}>Log Event</button>
      </div>
    </Modal>
  )
}
