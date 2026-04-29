import React from 'react'
import { COLOR_THEMES } from '../../../styles/themes'
import { useTheme } from '../../../context/ThemeContext'

export default function ColorThemePicker() {
  const { colorTheme, isDark, changeColorTheme } = useTheme()
  return (
    <div className="card" style={{ marginBottom:'1.4rem' }}>
      <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--text-muted)', marginBottom:'1.2rem' }}>Color Theme</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:10 }}>
        {Object.entries(COLOR_THEMES).map(([key, th]) => {
          const active       = colorTheme === key
          const previewBg    = isDark ? th.previewDark  : th.previewLight
          const previewAccent = isDark ? th.dark['--accent'] : th.light['--accent']
          return (
            <button key={key} onClick={() => changeColorTheme(key)} style={{
              padding:'1rem 1.1rem', borderRadius:'var(--radius-md)', cursor:'pointer', textAlign:'left',
              border:`2px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
              background: active ? 'color-mix(in srgb, var(--accent) 8%, transparent)' : 'var(--bg-overlay)',
              transition:'all 0.2s',
            }}>
              <div style={{ width:'100%', height:32, borderRadius:7, background:previewBg, marginBottom:9, display:'flex', alignItems:'center', gap:6, padding:'0 8px', border:`1px solid ${previewAccent}44` }}>
                <div style={{ width:10, height:10, borderRadius:'50%', background:previewAccent }}/>
                <div style={{ flex:1 }}>
                  <div style={{ height:3, borderRadius:2, background:previewAccent, width:'55%', marginBottom:3 }}/>
                  <div style={{ height:2, borderRadius:2, background:previewAccent+'44', width:'75%' }}/>
                </div>
              </div>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:13, color:active?'var(--accent)':'var(--text-primary)' }}>{th.name}</div>
              {active && <div style={{ fontSize:11, color:'var(--accent)', marginTop:3 }}>Active ✓</div>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
