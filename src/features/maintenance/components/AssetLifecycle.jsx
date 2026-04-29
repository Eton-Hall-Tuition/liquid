import React from 'react'
import { formatCurrency } from '../../../utils/format'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartTooltip } from '../../../components/ui'

const EVENT_COLORS = {Damage:'#f56565',Repair:'#f59e3f',Replacement:'#2dd4aa',Inspection:'#5b9cf6',Maintenance:'#a78bfa'}

export default function AssetLifecycle({ events, installDate }) {
  if (!events?.length) return <p style={{color:'var(--text-muted)',fontSize:13,padding:'0.4rem 0'}}>No events logged yet.</p>

  const allEvents = [
    { type:'Install', date:installDate, cost:0, note:'Asset installed' },
    ...events,
  ].filter(e=>e.date)

  const totalRepair = events.reduce((s,e)=>s+(e.cost||0),0)
  const chartData   = events.filter(e=>e.cost>0)

  return (
    <div>
      {/* Vertical timeline */}
      <div style={{position:'relative',paddingLeft:22,marginBottom:'1rem'}}>
        <div style={{position:'absolute',left:8,top:0,bottom:0,width:1.5,background:'var(--border)'}}/>
        {allEvents.map((ev,i)=>{
          const color=EVENT_COLORS[ev.type]||'var(--text-muted)'
          return (
            <div key={i} style={{position:'relative',marginBottom:14}}>
              <div style={{position:'absolute',left:-18,top:3,width:11,height:11,borderRadius:'50%',background:color,border:'2px solid var(--bg-raised)'}}/>
              <div style={{fontSize:13}}>
                <span style={{fontWeight:600,color}}>{ev.type}</span>
                <span style={{color:'var(--text-muted)',fontFamily:'var(--font-mono)',fontSize:11,marginLeft:8}}>{ev.date}</span>
                {ev.cost>0&&<span style={{fontFamily:'var(--font-mono)',color:'var(--warning)',marginLeft:8}}>{formatCurrency(ev.cost)}</span>}
              </div>
              {ev.note&&<div style={{fontSize:12,color:'var(--text-secondary)',marginTop:2}}>{ev.note}</div>}
            </div>
          )
        })}
      </div>
      {/* Cost chart */}
      {chartData.length>0&&(
        <div>
          <div style={{fontSize:11,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:7}}>Repair cost breakdown</div>
          <ResponsiveContainer width="100%" height={90}>
            <BarChart data={chartData} margin={{top:0,right:0,left:-20,bottom:0}}>
              <XAxis dataKey="type" tick={{fill:'var(--text-muted)',fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'var(--text-muted)',fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>'₹'+v}/>
              <Tooltip content={<ChartTooltip/>}/>
              <Bar dataKey="cost" radius={[3,3,0,0]} name="Cost (₹)" fill="var(--warning)"/>
            </BarChart>
          </ResponsiveContainer>
          <div style={{fontSize:12,color:'var(--text-muted)',marginTop:5}}>
            Total repair spend: <span style={{color:'var(--warning)',fontFamily:'var(--font-mono)'}}>{formatCurrency(totalRepair)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
