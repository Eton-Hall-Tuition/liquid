import React, { useState } from 'react'
import { PageWrapper, AuditLog, Empty } from '../../components/ui'
import { formatCurrency } from '../../utils/format'
import MemberModal from './components/MemberModal'
import MemberCard  from './components/MemberCard'
import ShareBar    from './components/ShareBar'

const GROUP_COLORS = {Owner:'#f59e3f',Employee:'#2dd4aa',Cashier:'#5b9cf6',Partner:'#a78bfa',Security:'#f56565',Cleaner:'#fb923c',Delivery:'#34d399'}
const GROUP_ICONS  = {Owner:'♚',Employee:'◎',Cashier:'₹',Partner:'◈',Security:'⬡',Cleaner:'⟁',Delivery:'▦'}

export default function Members({ store }) {
  const [activeGroup, setActiveGroup] = useState('All')
  const [showModal, setShowModal]     = useState(false)
  const [editMember, setEditMember]   = useState(null)

  const groups   = ['All', ...new Set(store.members.map(m => m.group))]
  const filtered = store.members.filter(m => activeGroup === 'All' || m.group === activeGroup)

  const totalSalary = store.members.filter(m => m.status === 'Active' && m.salary > 0).reduce((s, m) => s + m.salary, 0)
  const totalShares = store.members.filter(m => m.sharePercent > 0).reduce((s, m) => s + m.sharePercent, 0)

  const openNew  = ()     => { setEditMember(null); setShowModal(true) }
  const openEdit = (m)    => { setEditMember(m);    setShowModal(true) }
  const closeModal = ()   => { setShowModal(false);  setEditMember(null) }

  const handleSave = (data) => {
    if (editMember) store.updateMember(editMember.id, data)
    else            store.addMember(data)
    closeModal()
  }
  const handleDelete = (id) => {
    if (window.confirm('Remove this member?')) store.deleteMember(id)
  }

  return (
    <PageWrapper
      title="Members"
      subtitle="Employees, owners, cashiers, partners — salary, shares and bio-data."
      actions={<button className="btn btn-primary" onClick={openNew}>+ Add Member</button>}
    >
      <div className="grid-4" style={{ marginBottom:'1.3rem' }}>
        <div className="stat-card"><div className="stat-label">Total</div><div className="stat-value">{store.members.length}</div></div>
        <div className="stat-card"><div className="stat-label">Active</div><div className="stat-value" style={{ color:'var(--success)' }}>{store.members.filter(m=>m.status==='Active').length}</div></div>
        <div className="stat-card"><div className="stat-label">Monthly Payroll</div><div className="stat-value" style={{ color:'var(--danger)',fontSize:'1.3rem' }}>{formatCurrency(totalSalary)}</div></div>
        <div className="stat-card">
          <div className="stat-label">Shares Allocated</div>
          <div className="stat-value" style={{ color:totalShares===100?'var(--success)':'var(--warning)' }}>{totalShares}%</div>
          <div className="stat-sub">{totalShares===100?'Fully allocated':totalShares<100?`${100-totalShares}% free`:'Over-allocated!'}</div>
        </div>
      </div>

      {/* Group filter chips */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:'1.1rem' }}>
        {groups.map(g => {
          const color = GROUP_COLORS[g] || 'var(--accent)'
          const count = g === 'All' ? store.members.length : store.members.filter(m => m.group === g).length
          return (
            <button
              key={g}
              className={`chip${activeGroup === g ? ' active' : ''}`}
              onClick={() => setActiveGroup(g)}
              style={activeGroup === g ? { borderColor:color, color, background:`${color}12` } : {}}
            >
              {GROUP_ICONS[g] || ''} {g} <span style={{ marginLeft:3, opacity:0.6 }}>{count}</span>
            </button>
          )
        })}
      </div>

      {/* Share allocation bar (owners only) */}
      <ShareBar members={store.members} />

      {filtered.length === 0
        ? <Empty />
        : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:13 }}>
            {filtered.map((m, i) => (
              <MemberCard key={m.id} member={m} colorIndex={i} onEdit={openEdit} onDelete={handleDelete} />
            ))}
          </div>
        )
      }

      <AuditLog logs={store.auditLog} filter="Members" onRevert={null} />

      {showModal && <MemberModal member={editMember} onClose={closeModal} onSave={handleSave} />}
    </PageWrapper>
  )
}
