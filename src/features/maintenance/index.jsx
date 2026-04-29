import React, { useState } from 'react'
import { PageWrapper, AuditLog, Empty } from '../../components/ui'
import { ASSET_CATEGORIES } from '../../store/useStore'
import { formatCurrency } from '../../utils/format'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartTooltip } from '../../components/ui'
import AssetModal    from './components/AssetModal'
import EventModal    from './components/EventModal'
import AssetLifecycle from './components/AssetLifecycle'

export default function Maintenance({ store }) {
  const [showAssetModal, setShowAssetModal] = useState(false)
  const [editAsset, setEditAsset]           = useState(null)
  const [eventTarget, setEventTarget]       = useState(null)
  const [expanded, setExpanded]             = useState(null)
  const [catFilter, setCatFilter]           = useState('All')

  const cats     = ['All', ...new Set(store.assets.map(a => a.category))]
  const filtered = store.assets.filter(a => catFilter === 'All' || a.category === catFilter)

  const totalValue  = store.assets.reduce((s,a)=>s+a.totalCost,0)
  const repairTotal = store.assets.reduce((s,a)=>s+(a.events||[]).reduce((r,e)=>r+(e.cost||0),0),0)
  const damaged     = store.assets.filter(a=>['Damaged','Under Repair'].includes(a.status))

  const costByCategory = ASSET_CATEGORIES.map(cat=>({
    name:cat, value:store.assets.filter(a=>a.category===cat).reduce((s,a)=>s+a.totalCost,0),
  })).filter(d=>d.value>0)

  return (
    <PageWrapper
      title="Maintenance"
      subtitle="All shop assets — lifecycle tracking, repair history, replacement journeys"
      actions={
        <>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {cats.map(c=><button key={c} className={`chip${catFilter===c?' active':''}`} onClick={()=>setCatFilter(c)}>{c}</button>)}
          </div>
          <button className="btn btn-primary" onClick={()=>{setEditAsset(null);setShowAssetModal(true)}}>+ Add Asset</button>
        </>
      }
    >
      <div className="grid-4" style={{marginBottom:'1.3rem'}}>
        <div className="stat-card"><div className="stat-label">Assets</div><div className="stat-value">{store.assets.length}</div></div>
        <div className="stat-card"><div className="stat-label">Total Value</div><div className="stat-value" style={{color:'var(--info)',fontSize:'1.4rem'}}>{formatCurrency(totalValue)}</div></div>
        <div className="stat-card"><div className="stat-label">Repair Spend</div><div className="stat-value" style={{color:'var(--warning)',fontSize:'1.4rem'}}>{formatCurrency(repairTotal)}</div></div>
        <div className="stat-card"><div className="stat-label">Needs Attention</div><div className="stat-value" style={{color:damaged.length>0?'var(--danger)':'var(--success)'}}>{damaged.length}</div><div className="stat-sub">{damaged.length>0?damaged.map(d=>d.name).join(', '):'All good'}</div></div>
      </div>

      {damaged.length>0&&<div className="callout callout-red" style={{marginBottom:'1.2rem'}}>⚠ {damaged.length} asset(s) need attention: {damaged.map(d=>`${d.name} (${d.status})`).join(' · ')}</div>}

      {costByCategory.length>1&&(
        <div className="card" style={{marginBottom:'1.3rem'}}>
          <div style={{fontSize:11,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'0.8rem'}}>Asset value by category</div>
          <ResponsiveContainer width="100%" height={110}>
            <BarChart data={costByCategory} margin={{top:0,right:0,left:-10,bottom:0}}>
              <XAxis dataKey="name" tick={{fill:'var(--text-muted)',fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'var(--text-muted)',fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>'₹'+v/1000+'k'}/>
              <Tooltip content={<ChartTooltip/>}/>
              <Bar dataKey="value" fill="var(--accent-2)" radius={[4,4,0,0]} name="Value"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {filtered.length===0&&<Empty/>}
        {filtered.map(asset=>{
          const totalRepair=(asset.events||[]).reduce((s,e)=>s+(e.cost||0),0)
          const isExp=expanded===asset.id
          return (
            <div key={asset.id} className="card" style={{borderColor:['Damaged','Under Repair'].includes(asset.status)?'color-mix(in srgb, var(--danger) 25%, transparent)':'var(--border)'}}>
              <div style={{display:'flex',gap:12,alignItems:'flex-start',flexWrap:'wrap'}}>
                <div style={{flex:1,minWidth:200}}>
                  <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap',marginBottom:4}}>
                    <span style={{fontFamily:'var(--font-display)',fontWeight:700,color:'var(--text-primary)',fontSize:14}}>{asset.name}</span>
                    <span className={`badge ${asset.status==='Good'?'badge-green':asset.status==='Damaged'?'badge-red':asset.status==='Under Repair'?'badge-amber':asset.status==='Replaced'?'badge-blue':'badge-gray'}`}>{asset.status}</span>
                    <span className="badge badge-gray">{asset.category}</span>
                  </div>
                  <div style={{fontSize:12,color:'var(--text-muted)'}}>
                    {asset.count} unit{asset.count>1?'s':''} · ₹{asset.costEach.toLocaleString('en-IN')} each · <strong style={{color:'var(--info)'}}>{formatCurrency(asset.totalCost)}</strong>
                    {totalRepair>0&&<> · Repairs: <strong style={{color:'var(--warning)'}}>{formatCurrency(totalRepair)}</strong></>}
                    {asset.installDate&&<> · Installed: {asset.installDate}</>}
                    {asset.damageDate&&<> · <span style={{color:'var(--danger)'}}>Damaged: {asset.damageDate}</span></>}
                  </div>
                </div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap',alignItems:'center'}}>
                  {asset.status==='Good'&&<button className="btn btn-warning btn-xs" onClick={()=>store.addAssetEvent(asset.id,{type:'Damage',date:new Date().toISOString().slice(0,10),cost:0,note:'Marked as damaged'})}>Mark Damaged</button>}
                  <button className="btn btn-ghost btn-xs" onClick={()=>setEventTarget(asset)}>+ Log Event</button>
                  <button className="btn btn-ghost btn-xs" onClick={()=>{setEditAsset(asset);setShowAssetModal(true)}}>Edit</button>
                  <button className="btn btn-ghost btn-xs" onClick={()=>setExpanded(isExp?null:asset.id)}>{isExp?'Hide':'Lifecycle'}{asset.events?.length>0?` (${asset.events.length})`:''}</button>
                </div>
              </div>
              {isExp&&(
                <div style={{marginTop:'1.2rem',paddingTop:'1.2rem',borderTop:'1px solid var(--border)'}}>
                  <div style={{fontSize:11,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'0.8rem'}}>Full Lifecycle — {asset.name}</div>
                  <AssetLifecycle events={asset.events} installDate={asset.installDate}/>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <AuditLog logs={store.auditLog} filter="Maintenance" onRevert={null}/>

      {showAssetModal&&<AssetModal asset={editAsset} onClose={()=>{setShowAssetModal(false);setEditAsset(null)}} onSave={data=>{if(editAsset)store.updateAsset(editAsset.id,data);else store.addAsset(data);setShowAssetModal(false);setEditAsset(null)}}/>}
      {eventTarget&&<EventModal asset={eventTarget} onClose={()=>setEventTarget(null)} onSave={ev=>{store.addAssetEvent(eventTarget.id,ev);setEventTarget(null)}}/>}
    </PageWrapper>
  )
}
