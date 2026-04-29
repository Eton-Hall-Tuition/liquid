import React, { useState } from 'react'
import { PageWrapper, AuditLog } from '../../components/ui'
import ItemModal  from './components/ItemModal'
import ItemsTable from './components/ItemsTable'

export default function Items({ store }) {
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem]   = useState(null)
  const [search, setSearch]       = useState('')
  const [catFilter, setCatFilter] = useState('All')

  const cats     = ['All', ...new Set(store.items.map(i => i.category))]
  const filtered = store.items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) &&
    (catFilter === 'All' || i.category === catFilter)
  )

  const avgMargin = store.items.length
    ? Math.round(store.items.reduce((s, i) => s + ((i.sellPrice - i.fixedCost) / i.sellPrice) * 100, 0) / store.items.length)
    : 0

  const openEdit = (item) => { setEditItem(item); setShowModal(true) }
  const openNew  = ()     => { setEditItem(null); setShowModal(true) }
  const closeModal = ()   => { setShowModal(false); setEditItem(null) }

  const handleSave = (data) => {
    if (editItem) store.updateItem(editItem.id, data)
    else          store.addItem(data)
    closeModal()
  }

  return (
    <PageWrapper
      title="Products"
      subtitle="Catalogue, pricing & costs — admin controlled. Every change is logged with revert support."
      actions={
        <>
          <input style={{ width: 180 }} placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} />
          <button className="btn btn-primary" onClick={openNew}>+ Add Item</button>
        </>
      }
    >
      {/* KPI row */}
      <div className="grid-4" style={{ marginBottom: '1.3rem' }}>
        <div className="stat-card"><div className="stat-label">Total Items</div><div className="stat-value">{store.items.length}</div></div>
        <div className="stat-card"><div className="stat-label">Active</div><div className="stat-value" style={{ color: 'var(--success)' }}>{store.items.filter(i => i.active).length}</div></div>
        <div className="stat-card"><div className="stat-label">Avg Margin</div><div className="stat-value" style={{ color: 'var(--accent-3)' }}>{avgMargin}%</div></div>
        <div className="stat-card"><div className="stat-label">Categories</div><div className="stat-value">{cats.length - 1}</div></div>
      </div>

      {/* Category chips */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '1.1rem' }}>
        {cats.map(c => (
          <button key={c} className={`chip${catFilter === c ? ' active' : ''}`} onClick={() => setCatFilter(c)}>{c}</button>
        ))}
      </div>

      <ItemsTable
        items={filtered}
        storage={store.storage}
        onEdit={openEdit}
        onToggle={(item) => store.updateItem(item.id, { active: !item.active })}
        onDelete={(id) => { if (window.confirm('Delete this item?')) store.deleteItem(id) }}
      />

      <AuditLog logs={store.auditLog} filter="Items" onRevert={store.revertLog} />

      {showModal && (
        <ItemModal item={editItem} onClose={closeModal} onSave={handleSave} />
      )}
    </PageWrapper>
  )
}
