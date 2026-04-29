import React, { useState } from 'react'
import { Avatar } from '../../../components/ui'
import { formatCurrency } from '../../../utils/format'

const GROUP_COLORS = {Owner:'#f59e3f',Employee:'#2dd4aa',Cashier:'#5b9cf6',Partner:'#a78bfa',Security:'#f56565',Cleaner:'#fb923c',Delivery:'#34d399'}
const GROUP_ICONS  = {Owner:'♚',Employee:'◎',Cashier:'₹',Partner:'◈',Security:'⬡',Cleaner:'⟁',Delivery:'▦'}

export default function MemberCard({ member, colorIndex, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const color   = GROUP_COLORS[member.group] || 'var(--accent)'
  const isOwner = member.group === 'Owner' || member.group === 'Partner'

  return (
    <div className="card" style={{ borderColor: `${color}28` }}>
      <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
        <Avatar name={member.name} size={44} colorIndex={colorIndex} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
            <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, color:'var(--text-primary)' }}>{member.name}</span>
            <span className="badge" style={{ background:`${color}1a`, color }}>{GROUP_ICONS[member.group]} {member.group}</span>
            <span className={`badge ${member.status==='Active'?'badge-green':member.status==='On Leave'?'badge-amber':'badge-gray'}`}>{member.status}</span>
          </div>
          <div style={{ fontSize:12, color:'var(--text-secondary)', marginTop:2 }}>{member.role}</div>
          <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:1 }}>{member.experience} · Joined {member.joined}</div>
        </div>
        <div style={{ textAlign:'right', flexShrink:0 }}>
          {isOwner && member.sharePercent > 0
            ? <div><div style={{ fontFamily:'var(--font-mono)', fontSize:16, fontWeight:700, color }}>{member.sharePercent}%</div><div style={{ fontSize:10, color:'var(--text-muted)' }}>profit share</div></div>
            : member.salary > 0
              ? <div><div style={{ fontFamily:'var(--font-mono)', fontSize:14, fontWeight:700, color:'var(--accent)' }}>{formatCurrency(member.salary)}</div><div style={{ fontSize:10, color:'var(--text-muted)' }}>/month</div></div>
              : null
          }
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop:'1rem', paddingTop:'1rem', borderTop:'1px solid var(--border)' }}>
          {member.bio && <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:'0.8rem', fontStyle:'italic' }}>"{member.bio}"</p>}
          <div className="form-grid-2" style={{ marginBottom:'0.6rem' }}>
            <div><div style={{ fontSize:10, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Email</div><div style={{ fontSize:12, color:'var(--text-secondary)' }}>{member.email}</div></div>
            <div><div style={{ fontSize:10, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Phone</div><div style={{ fontSize:12, color:'var(--text-secondary)' }}>{member.phone}</div></div>
          </div>
          <div style={{ padding:'8px 12px', background:'var(--bg-overlay)', borderRadius:8, fontSize:12, color:'var(--text-muted)' }}>
            📎 Documents — connect file storage to view
          </div>
        </div>
      )}

      <div style={{ display:'flex', gap:6, marginTop:'0.8rem' }}>
        <button className="btn btn-ghost btn-xs" onClick={() => setExpanded(e => !e)}>{expanded ? 'Less ↑' : 'Details ↓'}</button>
        <button className="btn btn-ghost btn-xs" onClick={() => onEdit(member)}>Edit</button>
        <button className="btn btn-danger btn-xs" onClick={() => onDelete(member.id)}>Remove</button>
      </div>
    </div>
  )
}
