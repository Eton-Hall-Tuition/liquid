import React from 'react'
import { useApp } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'

const NAV_ITEMS = [
  { id: 'dashboard',   icon: '◈', label: 'Dashboard' },
  { id: 'billing',     icon: '⊞', label: 'POS / Billing' },
  { id: 'items',       icon: '⬡', label: 'Products' },
  { id: 'purchases',   icon: '⬇', label: 'Purchases' },
  { id: 'storage',     icon: '▦', label: 'Storage' },
  { id: 'expenses',    icon: '◐', label: 'Expenses' },
  { id: 'members',     icon: '◉', label: 'Members' },
  { id: 'maintenance', icon: '⟁', label: 'Maintenance' },
]

const BOTTOM_ITEMS = [
  { id: 'settings', icon: '⊙', label: 'Settings' },
]

export default function Sidebar() {
  const { activeSection, navigate, sidebarCollapsed, toggleSidebar } = useApp()
  const { isDark, toggleMode } = useTheme()

  const width = sidebarCollapsed ? 60 : 224

  return (
    <aside
      style={{
        width,
        minHeight: '100vh',
        background: 'var(--bg-raised)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        overflow: 'hidden',
        transition: 'width 0.25s ease',
        zIndex: 100,
      }}
    >
      {/* Brand + collapse toggle */}
      <div
        style={{
          padding: sidebarCollapsed ? '1.2rem 0' : '1.4rem 1.2rem 1rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'space-between',
          gap: 8,
        }}
      >
        {!sidebarCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            {/* Logo mark */}
            <div style={{
              width: 34, height: 34, borderRadius: 9, flexShrink: 0,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 17,
              color: 'var(--bg-base)',
            }}>L</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12.5, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                liquid
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 8.5, color: 'var(--accent)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                leviyathan
              </div>
            </div>
          </div>
        )}

        {sidebarCollapsed && (
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 17,
            color: 'var(--bg-base)', flexShrink: 0,
          }}>L</div>
        )}

        {!sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            title="Collapse sidebar"
            style={{
              width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)',
              background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
              transition: 'var(--transition)', flexShrink: 0,
            }}
          >
            ‹
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {sidebarCollapsed && (
        <button
          onClick={toggleSidebar}
          title="Expand sidebar"
          style={{
            margin: '8px auto', width: 36, height: 28, borderRadius: 6,
            border: '1px solid var(--border)', background: 'transparent',
            color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'var(--transition)',
          }}
        >
          ›
        </button>
      )}

      {/* User role badge */}
      {!sidebarCollapsed && (
        <div style={{ padding: '0.7rem 1.2rem', borderBottom: '1px solid rgba(128,128,128,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
              border: '1.5px solid color-mix(in srgb, var(--accent) 35%, transparent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: 'var(--accent)',
              fontFamily: 'var(--font-display)',
            }}>A</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Admin</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Full access</div>
            </div>
          </div>
        </div>
      )}

      {/* Main navigation */}
      <nav style={{ flex: 1, padding: sidebarCollapsed ? '0.5rem 6px' : '0.6rem 8px' }}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id
          return (
            <NavButton
              key={item.id}
              item={item}
              isActive={isActive}
              collapsed={sidebarCollapsed}
              onClick={() => navigate(item.id)}
            />
          )
        })}
      </nav>

      {/* Bottom: dark mode toggle + settings */}
      <div style={{ padding: sidebarCollapsed ? '0.5rem 6px' : '0.6rem 8px', borderTop: '1px solid var(--border)' }}>
        {/* Dark / Light toggle */}
        <button
          onClick={toggleMode}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            width: '100%', padding: sidebarCollapsed ? '9px 0' : '9px 11px',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            borderRadius: 9, border: 'none', background: 'transparent',
            color: 'var(--text-muted)', fontFamily: 'var(--font-body)',
            fontSize: 13, cursor: 'pointer', transition: 'var(--transition)',
            marginBottom: 2,
          }}
        >
          <span style={{ fontSize: 15 }}>{isDark ? '☀' : '☽'}</span>
          {!sidebarCollapsed && <span>{isDark ? 'Light mode' : 'Dark mode'}</span>}
        </button>

        {BOTTOM_ITEMS.map((item) => {
          const isActive = activeSection === item.id
          return (
            <NavButton
              key={item.id}
              item={item}
              isActive={isActive}
              collapsed={sidebarCollapsed}
              onClick={() => navigate(item.id)}
            />
          )
        })}

        {!sidebarCollapsed && (
          <div style={{ padding: '0.6rem 11px', fontSize: 9.5, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
            liquid.leviyathan · v3
          </div>
        )}
      </div>
    </aside>
  )
}

function NavButton({ item, isActive, collapsed, onClick }) {
  return (
    <button
      onClick={onClick}
      title={item.label}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: collapsed ? '9px 0' : '9px 11px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderRadius: 9,
        border: 'none',
        background: isActive ? 'color-mix(in srgb, var(--accent) 14%, transparent)' : 'transparent',
        color: isActive ? 'var(--accent)' : 'var(--text-muted)',
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        fontWeight: isActive ? 600 : 400,
        cursor: 'pointer',
        transition: 'var(--transition)',
        textAlign: 'left',
        marginBottom: 1,
        borderLeft: !collapsed && isActive ? '2px solid var(--accent)' : '2px solid transparent',
      }}
    >
      <span style={{ fontSize: 15, opacity: isActive ? 1 : 0.55, flexShrink: 0 }}>{item.icon}</span>
      {!collapsed && item.label}
    </button>
  )
}
