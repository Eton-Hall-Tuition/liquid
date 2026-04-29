import React from 'react'

const PERIODS = ['Day', 'Week', 'Month', 'Year']

export default function PeriodSelector({ value, onChange }) {
  return (
    <div style={{ display:'flex', gap:3, background:'var(--bg-overlay)', border:'1px solid var(--border)', borderRadius:10, padding:3 }}>
      {PERIODS.map(p => (
        <button key={p} onClick={() => onChange(p)} style={{
          padding:'6px 14px', borderRadius:8, border:'none',
          background: value===p ? 'var(--bg-raised)' : 'transparent',
          color: value===p ? 'var(--text-primary)' : 'var(--text-muted)',
          fontFamily:'var(--font-body)', fontSize:13, cursor:'pointer',
          fontWeight: value===p ? 600 : 400, transition:'all 0.15s',
        }}>{p}</button>
      ))}
    </div>
  )
}
