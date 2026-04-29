import React from 'react'

const COLORS = ['#f59e3f','#a78bfa','#2dd4aa','#5b9cf6','#f56565']

export default function ShareBar({ members }) {
  const owners = members.filter(m => m.sharePercent > 0)
  const total  = owners.reduce((s, m) => s + m.sharePercent, 0)
  if (owners.length === 0) return null

  return (
    <div className="card-sm" style={{ marginBottom:'1.1rem' }}>
      <div style={{ fontSize:10, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:7 }}>
        Profit Share Allocation
      </div>
      <div style={{ display:'flex', height:14, borderRadius:7, overflow:'hidden', background:'var(--bg-overlay)', marginBottom:7 }}>
        {owners.map((m, i) => (
          <div key={m.id} style={{ width:`${m.sharePercent}%`, background:COLORS[i%COLORS.length], display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:'#000', fontWeight:700 }}>
            {m.sharePercent > 8 ? `${m.sharePercent}%` : ''}
          </div>
        ))}
        {total < 100 && (
          <div style={{ width:`${100-total}%`, background:'rgba(128,128,128,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:'var(--text-muted)' }}>
            {100-total > 8 ? `${100-total}%` : ''}
          </div>
        )}
      </div>
      <div style={{ display:'flex', gap:10, flexWrap:'wrap', fontSize:11 }}>
        {owners.map((m, i) => (
          <div key={m.id} style={{ display:'flex', alignItems:'center', gap:4 }}>
            <div style={{ width:9, height:9, borderRadius:2, background:COLORS[i%COLORS.length] }}/>
            <span style={{ color:'var(--text-secondary)' }}>{m.name.split(' ')[0]}: {m.sharePercent}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
