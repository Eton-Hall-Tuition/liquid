import React from 'react'
import { FONT_THEMES } from '../../../styles/themes'
import { useTheme } from '../../../context/ThemeContext'

export default function FontPicker() {
  const { fontTheme, changeFontTheme } = useTheme()
  return (
    <div className="card" style={{ marginBottom:'1.4rem' }}>
      <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--text-muted)', marginBottom:'1.2rem' }}>Font Style</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:10 }}>
        {Object.entries(FONT_THEMES).map(([key, f]) => {
          const active = fontTheme === key
          return (
            <button key={key} onClick={() => changeFontTheme(key)} style={{
              padding:'1.2rem', borderRadius:'var(--radius-md)', cursor:'pointer', textAlign:'left',
              border:`2px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
              background: active ? 'color-mix(in srgb, var(--accent) 8%, transparent)' : 'var(--bg-overlay)',
              transition:'all 0.2s',
            }}>
              <div style={{ fontFamily:f.display, fontWeight:700, fontSize:26, color:active?'var(--accent)':'var(--text-primary)', marginBottom:5, lineHeight:1 }}>{f.preview}</div>
              <div style={{ fontFamily:f.body, fontWeight:600, fontSize:13, color:active?'var(--accent)':'var(--text-primary)', marginBottom:2 }}>{f.name}</div>
              <div style={{ fontFamily:f.body, fontSize:12, color:'var(--text-muted)', marginBottom:3 }}>The quick brown fox</div>
              <div style={{ fontFamily:f.mono, fontSize:11, color:'var(--text-muted)' }}>₹1,23,456.00</div>
              {active && <div style={{ fontSize:11, color:'var(--accent)', marginTop:6 }}>Active ✓</div>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
