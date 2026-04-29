import React, { useState } from 'react'
import { PageWrapper, Modal, AuditLog, Empty } from '../../components/ui'
import { EXPENSE_CATEGORIES, PAYMENT_MODES } from '../../store/useStore'
import { formatCurrency } from '../../utils/format'

const CAT_COLORS = { Rent:'#f56565',Utilities:'#5b9cf6',Supplies:'#2dd4aa',Marketing:'#a78bfa',Maintenance:'#f59e3f','Salary Advance':'#f472b6',Logistics:'#34d399',Other:'#94a3b8' }

function ExpenseModal({ onSave, onClose }) {
  const [f, setF] = useState({ date:new Date().toISOString().slice(0,10),category:'Utilities',description:'',amount:'',paidTo:'',paymentMode:'Cash' })
  const set=(k,v)=>setF(p=>({...p,[k]:v}))
  return (
    <Modal title="Add Expense" onClose={onClose}>
      <div className="form-grid-2">
        <div className="form-group"><div className="form-label">Date</div><input type="date" value={f.date} onChange={e=>set('date',e.target.value)}/></div>
        <div className="form-group"><div className="form-label">Category</div><select value={f.category} onChange={e=>set('category',e.target.value)}>{EXPENSE_CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
      </div>
      <div className="form-group"><div className="form-label">Description</div><input value={f.description} onChange={e=>set('description',e.target.value)} placeholder="e.g. Monthly electricity bill"/></div>
      <div className="form-grid-2">
        <div className="form-group"><div className="form-label">Amount (₹)</div><input type="number" value={f.amount} onChange={e=>set('amount',e.target.value)}/></div>
        <div className="form-group"><div className="form-label">Paid To</div><input value={f.paidTo} onChange={e=>set('paidTo',e.target.value)} placeholder="Vendor / Person"/></div>
      </div>
      <div className="form-group"><div className="form-label">Payment Mode</div><select value={f.paymentMode} onChange={e=>set('paymentMode',e.target.value)}>{PAYMENT_MODES.map(m=><option key={m}>{m}</option>)}</select></div>
      <div className="form-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={()=>onSave({...f,amount:Number(f.amount)})}>Add Expense</button>
      </div>
    </Modal>
  )
}

export default function Expenses({ store }) {
  const [showModal, setShowModal] = useState(false)
  const [catFilter, setCatFilter] = useState('All')

  const filtered = store.expenses.filter(e=>catFilter==='All'||e.category===catFilter)
  const total    = store.expenses.reduce((s,e)=>s+e.amount,0)

  const byCategory = EXPENSE_CATEGORIES.map(cat=>({
    cat, amount:store.expenses.filter(e=>e.category===cat).reduce((s,e)=>s+e.amount,0)
  })).filter(c=>c.amount>0).sort((a,b)=>b.amount-a.amount)

  return (
    <PageWrapper
      title="Expenses"
      subtitle="All operating expenses — rent, utilities, supplies, maintenance, marketing"
      actions={<button className="btn btn-primary" onClick={()=>setShowModal(true)}>+ Add Expense</button>}
    >
      <div className="grid-4" style={{ marginBottom:'1.3rem' }}>
        <div className="stat-card"><div className="stat-label">Total Expenses</div><div className="stat-value" style={{ color:'var(--danger)',fontSize:'1.4rem' }}>{formatCurrency(total)}</div></div>
        <div className="stat-card"><div className="stat-label">Entries</div><div className="stat-value">{store.expenses.length}</div></div>
        <div className="stat-card"><div className="stat-label">Largest Category</div><div className="stat-value" style={{ fontSize:'1.1rem',color:'var(--accent-3)' }}>{byCategory[0]?.cat||'—'}</div><div className="stat-sub">{byCategory[0]?formatCurrency(byCategory[0].amount):''}</div></div>
        <div className="stat-card"><div className="stat-label">Avg per Entry</div><div className="stat-value" style={{ fontSize:'1.4rem' }}>{store.expenses.length?formatCurrency(Math.round(total/store.expenses.length)):'—'}</div></div>
      </div>

      <div className="card" style={{ marginBottom:'1.3rem' }}>
        <div style={{ fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:'var(--text-muted)',marginBottom:'1rem' }}>By Category</div>
        <div className="grid-2">
          {byCategory.map(({ cat,amount })=>{
            const pct=Math.round((amount/total)*100)
            const color=CAT_COLORS[cat]||'var(--text-secondary)'
            return (
              <div key={cat}>
                <div style={{ display:'flex',justifyContent:'space-between',marginBottom:4 }}>
                  <span style={{ fontSize:13,color:'var(--text-secondary)' }}>{cat}</span>
                  <span style={{ fontFamily:'var(--font-mono)',fontSize:12,color }}>{formatCurrency(amount)} <span style={{ color:'var(--text-muted)' }}>({pct}%)</span></span>
                </div>
                <div className="progress-track"><div className="progress-fill" style={{ width:`${pct}%`,background:color }}/></div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display:'flex',gap:6,flexWrap:'wrap',marginBottom:'1.1rem' }}>
        {['All',...EXPENSE_CATEGORIES].map(c=><button key={c} className={`chip${catFilter===c?' active':''}`} onClick={()=>setCatFilter(c)}>{c}</button>)}
      </div>

      <div className="card">
        <div className="scroll-x">
          <table>
            <thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th><th>Paid To</th><th>Payment</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {filtered.length===0&&<tr><td colSpan={8}><Empty/></td></tr>}
              {filtered.map(e=>(
                <tr key={e.id}>
                  <td style={{ fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-muted)' }}>{e.date}</td>
                  <td><span style={{ padding:'3px 9px',borderRadius:20,fontSize:11,fontWeight:600,background:`${CAT_COLORS[e.category]||'#94a3b8'}1a`,color:CAT_COLORS[e.category]||'var(--text-secondary)' }}>{e.category}</span></td>
                  <td style={{ color:'var(--text-primary)',fontWeight:500 }}>{e.description}</td>
                  <td style={{ fontFamily:'var(--font-mono)',fontWeight:700,color:'var(--danger)' }}>{formatCurrency(e.amount)}</td>
                  <td style={{ color:'var(--text-secondary)',fontSize:13 }}>{e.paidTo}</td>
                  <td><span className="badge badge-blue">{e.paymentMode}</span></td>
                  <td><span className="badge badge-green">Approved</span></td>
                  <td><button className="btn btn-danger btn-xs" onClick={()=>{if(window.confirm('Delete?'))store.deleteExpense(e.id)}}>Del</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AuditLog logs={store.auditLog} filter="Expenses" onRevert={null}/>
      {showModal&&<ExpenseModal onClose={()=>setShowModal(false)} onSave={data=>{store.addExpense(data);setShowModal(false)}}/>}
    </PageWrapper>
  )
}
