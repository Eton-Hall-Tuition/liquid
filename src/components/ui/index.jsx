import React, { useState } from 'react'

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, size = 'default' }) {
  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal${size === 'lg' ? ' modal-lg' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.4rem' }}>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700 }}>{title}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close modal">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── Audit Log ─────────────────────────────────────────────────────────────────
export function AuditLog({ logs, filter, onRevert }) {
  const [showAll, setShowAll] = useState(false)
  const filtered = filter ? logs.filter((l) => l.section === filter) : logs
  const visible  = showAll ? filtered : filtered.slice(0, 8)

  return (
    <div className="card" style={{ marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
          Activity Log
        </span>
        <span className="badge badge-gray">{filtered.length}</span>
      </div>

      {visible.length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '1rem 0' }}>
          No activity recorded yet.
        </p>
      )}

      {visible.map((log) => (
        <div className="log-row" key={log.id} style={{ opacity: log.reverted ? 0.5 : 1 }}>
          <div className="log-ts">{log.ts}</div>
          <div className="log-who">{log.who}</div>
          <div className="log-what">
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{log.action}</span>
            {log.detail && (
              <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>— {log.detail}</span>
            )}
            {log.reverted && (
              <span style={{ color: 'var(--warning)', marginLeft: 6, fontSize: 10 }}>[reverted]</span>
            )}
          </div>
          <span className="log-tag">{log.section}</span>
          {log.canRevert && onRevert && (
            <button className="btn btn-warning btn-xs" onClick={() => onRevert(log.id)}>
              Revert
            </button>
          )}
        </div>
      ))}

      {filtered.length > 8 && (
        <button
          className="btn btn-ghost btn-sm"
          style={{ marginTop: 8 }}
          onClick={() => setShowAll((s) => !s)}
        >
          {showAll ? '↑ Show less' : `↓ Show all ${filtered.length}`}
        </button>
      )}
    </div>
  )
}

// ── Status Badge ──────────────────────────────────────────────────────────────
const STATUS_MAP = {
  Good: 'badge-green', Active: 'badge-green', Approved: 'badge-green', Received: 'badge-green',
  Damaged: 'badge-red', Resigned: 'badge-gray', Rejected: 'badge-red',
  'Under Repair': 'badge-amber', 'On Leave': 'badge-amber', Pending: 'badge-amber',
  Replaced: 'badge-blue', 'Part-time': 'badge-blue',
}

export function StatusBadge({ status }) {
  return <span className={`badge ${STATUS_MAP[status] || 'badge-gray'}`}>{status}</span>
}

// ── Avatar ────────────────────────────────────────────────────────────────────
const AVATAR_PALETTE = ['#2dd4aa','#5b9cf6','#f59e3f','#f56565','#a78bfa','#fb923c','#34d399','#60a5fa']

export function Avatar({ name = '?', size = 40, colorIndex = 0 }) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
  const color = AVATAR_PALETTE[colorIndex % AVATAR_PALETTE.length]
  return (
    <div
      className="avatar"
      style={{
        width: size, height: size,
        fontSize: size * 0.34,
        color, background: `${color}22`,
        border: `1.5px solid ${color}44`,
      }}
    >
      {initials}
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function Empty({ message = 'Nothing here yet.' }) {
  return (
    <div style={{ padding: '2.5rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
      {message}
    </div>
  )
}

// ── Page wrapper (section layout helper) ──────────────────────────────────────
export function PageWrapper({ title, subtitle, actions, children }) {
  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <div className="accent-bar" />
          <h2 className="page-title">{title}</h2>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        {actions && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  )
}

// ── Recharts custom tooltip ───────────────────────────────────────────────────
export function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-overlay)',
      border: '1px solid var(--border-strong)',
      borderRadius: 10, padding: '10px 16px', fontSize: 13,
    }}>
      <div style={{ color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: <strong>
            {typeof p.value === 'number' && p.value > 999
              ? '₹' + p.value.toLocaleString('en-IN')
              : p.value}
          </strong>
        </div>
      ))}
    </div>
  )
}

// ── Confirm dialog ────────────────────────────────────────────────────────────
export function Confirm({ message, onConfirm, onCancel }) {
  return (
    <div className="overlay">
      <div className="modal" style={{ maxWidth: 360 }}>
        <h3 style={{ marginBottom: '0.8rem', fontSize: '1rem' }}>Confirm</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: '1.4rem', lineHeight: 1.5 }}>{message}</p>
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  )
}
