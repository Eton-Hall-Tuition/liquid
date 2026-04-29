import React from 'react'
import { PageWrapper } from '../../components/ui'
import { useTheme } from '../../context/ThemeContext'
import ColorThemePicker from './components/ColorThemePicker'
import FontPicker       from './components/FontPicker'

export default function Settings() {
  const { mode, setModeExplicit } = useTheme()
  return (
    <PageWrapper title="Settings" subtitle="Appearance, themes, fonts — all preferences saved automatically">
      {/* Dark / Light toggle */}
      <div className="card" style={{ marginBottom:'1.4rem' }}>
        <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--text-muted)', marginBottom:'1.2rem' }}>Display Mode</div>
        <div style={{ display:'flex', gap:10 }}>
          {[
            { key:'dark',  icon:'☽', label:'Dark Mode',  sub:'Easy on the eyes at night' },
            { key:'light', icon:'☀', label:'Light Mode', sub:'Bright and clean for day use' },
          ].map(({ key, icon, label, sub }) => {
            const active = mode === key
            return (
              <button key={key} onClick={() => setModeExplicit(key)} style={{
                flex:1, padding:'1.2rem', borderRadius:'var(--radius-lg)', cursor:'pointer',
                border:`2px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                background: active ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'var(--bg-overlay)',
                textAlign:'left', transition:'all 0.2s',
              }}>
                <div style={{ fontSize:28, marginBottom:8 }}>{icon}</div>
                <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, color:active?'var(--accent)':'var(--text-primary)', marginBottom:3 }}>{label}</div>
                <div style={{ fontSize:12, color:'var(--text-muted)' }}>{sub}</div>
                {active && <div style={{ fontSize:11, color:'var(--accent)', marginTop:8 }}>● Active</div>}
              </button>
            )
          })}
        </div>
      </div>

      <ColorThemePicker />
      <FontPicker />

      {/* App info */}
      <div className="card">
        <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--text-muted)', marginBottom:'1.2rem' }}>About</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {[
            ['Shop Name','Liquid Leviyathan'],['URL','liquid.leviyathan'],
            ['Version','v4.0.0'],['Opening Date','01 Mar 2019'],
            ['Location','Nāgercoil, Tamil Nadu'],['Currency','INR (₹)'],
          ].map(([k,v]) => (
            <div key={k} style={{ padding:'10px 14px', background:'var(--bg-overlay)', borderRadius:'var(--radius-sm)' }}>
              <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-muted)', marginBottom:3 }}>{k}</div>
              <div style={{ color:'var(--text-primary)', fontWeight:500, fontSize:13 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  )
}
