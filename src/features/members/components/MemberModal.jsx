import React, { useState } from 'react'
import { Modal } from '../../../components/ui'
import { MEMBER_GROUPS } from '../../../store/useStore'

export default function MemberModal({ member, onSave, onClose }) {
  const [f, setF] = useState(member || { name:'',group:'Employee',role:'',experience:'',salary:'',sharePercent:'',joined:'',phone:'',email:'',status:'Active',bio:'' })
  const set = (k,v) => setF(p=>({...p,[k]:v}))
  const isOwner = f.group==='Owner'||f.group==='Partner'
  return (
    <Modal title={member?`Edit — ${member.name}`:'Add Member'} onClose={onClose} size="lg">
      <div className="form-grid-2">
        <div className="form-group"><div className="form-label">Full Name</div><input value={f.name} onChange={e=>set('name',e.target.value)}/></div>
        <div className="form-group"><div className="form-label">Group</div><select value={f.group} onChange={e=>set('group',e.target.value)}>{MEMBER_GROUPS.map(g=><option key={g}>{g}</option>)}</select></div>
      </div>
      <div className="form-grid-2">
        <div className="form-group"><div className="form-label">Role / Title</div><input value={f.role} onChange={e=>set('role',e.target.value)}/></div>
        <div className="form-group"><div className="form-label">Status</div><select value={f.status} onChange={e=>set('status',e.target.value)}>{['Active','On Leave','Part-time','Resigned'].map(s=><option key={s}>{s}</option>)}</select></div>
      </div>
      <div className="form-grid-3">
        <div className="form-group"><div className="form-label">Experience</div><input value={f.experience} onChange={e=>set('experience',e.target.value)}/></div>
        <div className="form-group"><div className="form-label">{isOwner?'Monthly Draw':'Salary'} (₹)</div><input type="number" value={f.salary} onChange={e=>set('salary',e.target.value)}/></div>
        {isOwner&&<div className="form-group"><div className="form-label">Share % (profit)</div><input type="number" value={f.sharePercent} onChange={e=>set('sharePercent',e.target.value)} min={0} max={100}/></div>}
      </div>
      <div className="form-grid-2">
        <div className="form-group"><div className="form-label">Date Joined</div><input type="date" value={f.joined} onChange={e=>set('joined',e.target.value)}/></div>
        <div className="form-group"><div className="form-label">Phone</div><input value={f.phone} onChange={e=>set('phone',e.target.value)}/></div>
      </div>
      <div className="form-group"><div className="form-label">Email</div><input type="email" value={f.email} onChange={e=>set('email',e.target.value)}/></div>
      <div className="form-group"><div className="form-label">Bio / Notes</div><textarea value={f.bio} onChange={e=>set('bio',e.target.value)} rows={3}/></div>
      <div className="form-group">
        <div className="form-label">Documents</div>
        <div style={{background:'var(--bg-overlay)',border:'1px dashed var(--border-strong)',borderRadius:8,padding:'12px 16px',fontSize:13,color:'var(--text-muted)'}}>
          📎 Aadhaar, PAN, certificates — connect file storage to enable uploads
        </div>
      </div>
      <div className="form-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={()=>onSave({...f,salary:Number(f.salary),sharePercent:Number(f.sharePercent)})}>
          {member?'Save Changes':'Add Member'}
        </button>
      </div>
    </Modal>
  )
}
