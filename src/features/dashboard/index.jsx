import React, { useState, useMemo } from 'react'
import { PageWrapper, ChartTooltip } from '../../components/ui'
import { formatCompact, formatCurrency } from '../../utils/format'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'

const PERIODS = ['Day', 'Week', 'Month', 'Year']

const DAY_DATA = [
  { name:'9am',revenue:4200,expenses:2100},{name:'10am',revenue:7800,expenses:3100},
  {name:'11am',revenue:9200,expenses:3800},{name:'12pm',revenue:14000,expenses:5200},
  {name:'1pm',revenue:11500,expenses:4400},{name:'2pm',revenue:8600,expenses:3200},
  {name:'3pm',revenue:10200,expenses:3900},{name:'4pm',revenue:12400,expenses:4700},
  {name:'5pm',revenue:15800,expenses:5900},{name:'6pm',revenue:18200,expenses:6800},
  {name:'7pm',revenue:13600,expenses:5100},
]

const WEEK_DATA = [
  {name:'Mon',revenue:28000,expenses:16000},{name:'Tue',revenue:34000,expenses:18000},
  {name:'Wed',revenue:31000,expenses:17000},{name:'Thu',revenue:39000,expenses:20000},
  {name:'Fri',revenue:48000,expenses:24000},{name:'Sat',revenue:62000,expenses:30000},
  {name:'Sun',revenue:55000,expenses:27000},
]

function enrich(arr) {
  return arr.map(m => ({
    ...m,
    expenses: m.restock + m.salaries + m.maintenance + (m.opex||0),
    profit:   m.revenue - m.restock - m.salaries - m.maintenance - (m.opex||0),
    name: m.month?.slice(0,3) + ' ' + m.month?.slice(-2),
  }))
}

export default function Dashboard({ store }) {
  const [period, setPeriod] = useState('Month')
  const [compareMode, setCompareMode] = useState(false)
  const [comparePeriod, setComparePeriod] = useState('Month')

  const current  = useMemo(() => enrich(store.monthlyData), [store.monthlyData])
  const previous = useMemo(() => enrich(store.prevYearData), [store.prevYearData])

  const chartData = useMemo(() => {
    if (period === 'Day')  return DAY_DATA.map(d => ({ ...d, profit: d.revenue - d.expenses }))
    if (period === 'Week') return WEEK_DATA.map(d => ({ ...d, profit: d.revenue - d.expenses }))
    if (period === 'Month') return current
    return current
  }, [period, current])

  const compareData = useMemo(() => {
    if (!compareMode) return []
    return current.map((m, i) => ({
      name: m.name,
      'Current': m.revenue,
      'Previous': previous[i]?.revenue || 0,
    }))
  }, [compareMode, current, previous])

  const agg = useMemo(() => {
    const src = ['Day','Week'].includes(period)
      ? (period === 'Day' ? DAY_DATA : WEEK_DATA)
      : current
    return {
      revenue: src.reduce((s,m) => s+(m.revenue||0), 0),
      expenses: src.reduce((s,m) => s+(m.expenses||0), 0),
      profit: src.reduce((s,m) => s+(m.profit||m.revenue-m.expenses||0), 0),
    }
  }, [period, current])

  const prevAgg = useMemo(() => {
    if (!compareMode) return null
    const src = previous
    return { revenue: src.reduce((s,m) => s+m.revenue,0), profit: src.reduce((s,m) => s+m.profit,0) }
  }, [compareMode, previous])

  const salaryTotal = store.members.filter(m=>m.status==='Active').reduce((s,m)=>s+(m.salary||0),0)
  const assetTotal  = store.assets.reduce((s,a)=>s+a.totalCost,0)

  const topItems = useMemo(() => {
    const counts = {}
    store.bills.forEach(b => b.items.forEach(li => {
      if (!counts[li.name]) counts[li.name] = { name:li.name, emoji:li.emoji, qty:0, revenue:0 }
      counts[li.name].qty += li.qty
      counts[li.name].revenue += li.qty * li.price
    }))
    return Object.values(counts).sort((a,b)=>b.revenue-a.revenue).slice(0,5)
  }, [store.bills])

  const expBreakdown = useMemo(() => {
    const last = current[current.length-1] || {}
    const total = (last.expenses||1)
    return [
      { name:'Restock', val:last.restock||0, color:'var(--accent-2)' },
      { name:'Salaries', val:last.salaries||0, color:'var(--danger)' },
      { name:'Maintenance', val:last.maintenance||0, color:'var(--warning)' },
      { name:'Other', val:last.opex||0, color:'var(--text-muted)' },
    ].map(e => ({ ...e, pct:Math.round((e.val/total)*100) }))
  }, [current])

  return (
    <PageWrapper
      title="Dashboard & Shop Health"
      subtitle={`Since 01 Mar 2019 · ${compareMode ? 'Comparison mode' : 'Single period view'}`}
      actions={
        <>
          <div style={{ display:'flex', gap:3, background:'var(--bg-overlay)', border:'1px solid var(--border)', borderRadius:10, padding:3 }}>
            {PERIODS.map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                style={{ padding:'6px 14px', borderRadius:8, border:'none', background:period===p?'var(--bg-raised)':'transparent',
                  color:period===p?'var(--text-primary)':'var(--text-muted)', fontFamily:'var(--font-body)', fontSize:13, cursor:'pointer', fontWeight:period===p?600:400, transition:'all 0.15s' }}>
                {p}
              </button>
            ))}
          </div>
          <button className={`btn btn-sm ${compareMode ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setCompareMode(c=>!c)}>
            ⇄ Compare
          </button>
        </>
      }
    >
      {compareMode && (
        <div className="callout callout-blue" style={{ marginBottom:'1.2rem', display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
          <span style={{ fontSize:13 }}>Comparing <strong>{period}</strong> with previous year:</span>
          <div style={{ display:'flex', gap:3, background:'rgba(91,156,246,0.1)', borderRadius:8, padding:3 }}>
            {PERIODS.map(p => (
              <button key={p} onClick={() => setComparePeriod(p)}
                style={{ padding:'5px 12px', borderRadius:6, border:'none', background:comparePeriod===p?'rgba(91,156,246,0.25)':'transparent',
                  color:comparePeriod===p?'var(--info)':'var(--text-muted)', fontSize:12, cursor:'pointer', transition:'all 0.15s' }}>
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* KPI row */}
      <div className="grid-4" style={{ marginBottom:'1.3rem' }}>
        <div className="stat-card">
          <div className="stat-label">Revenue · {period}</div>
          <div className="stat-value" style={{ color:'var(--accent)', fontSize:'1.5rem' }}>{formatCompact(agg.revenue)}</div>
          {prevAgg && <div className="stat-sub" style={{ color: agg.revenue>prevAgg.revenue?'var(--success)':'var(--danger)' }}>
            vs {formatCompact(prevAgg.revenue)} · {agg.revenue>prevAgg.revenue?'+':''}{Math.round(((agg.revenue-prevAgg.revenue)/prevAgg.revenue)*100)}%
          </div>}
        </div>
        <div className="stat-card">
          <div className="stat-label">Net Profit · {period}</div>
          <div className="stat-value" style={{ color:agg.profit>=0?'var(--accent-3)':'var(--danger)', fontSize:'1.5rem' }}>{formatCompact(agg.profit)}</div>
          {agg.revenue > 0 && <div className="stat-sub">{Math.round((agg.profit/agg.revenue)*100)}% margin</div>}
        </div>
        <div className="stat-card">
          <div className="stat-label">Monthly Salary Bill</div>
          <div className="stat-value" style={{ color:'var(--danger)', fontSize:'1.4rem' }}>{formatCompact(salaryTotal)}</div>
          <div className="stat-sub">{store.members.filter(m=>m.status==='Active').length} active members</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Asset Value</div>
          <div className="stat-value" style={{ color:'var(--info)', fontSize:'1.4rem' }}>{formatCompact(assetTotal)}</div>
          <div className="stat-sub">{store.assets.length} assets</div>
        </div>
      </div>

      {/* Main chart */}
      <div className="card" style={{ marginBottom:'1.3rem' }}>
        <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-muted)', marginBottom:'1.1rem' }}>
          {compareMode ? `Revenue — Current ${period} vs Previous ${comparePeriod}` : `Revenue · Expenses · Profit — ${period} view`}
        </div>
        <ResponsiveContainer width="100%" height={230}>
          {compareMode ? (
            <BarChart data={compareData} margin={{ top:0, right:10, left:-10, bottom:0 }}>
              <XAxis dataKey="name" tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={formatCompact} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize:12, color:'var(--text-secondary)' }} />
              <Bar dataKey="Current" fill="var(--accent)" radius={[4,4,0,0]} />
              <Bar dataKey="Previous" fill="var(--accent-2)" radius={[4,4,0,0]} opacity={0.7} />
            </BarChart>
          ) : (
            <AreaChart data={chartData} margin={{ top:0, right:10, left:-10, bottom:0 }}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.16}/>
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gPro" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-3)" stopOpacity={0.14}/>
                  <stop offset="95%" stopColor="var(--accent-3)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={formatCompact} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize:12, color:'var(--text-secondary)' }} />
              <Area type="monotone" dataKey="revenue"  stroke="var(--accent)"   strokeWidth={2} fill="url(#gRev)" name="Revenue" />
              <Area type="monotone" dataKey="expenses" stroke="var(--accent-2)" strokeWidth={1.5} fill="none" strokeDasharray="5 3" name="Expenses" />
              <Area type="monotone" dataKey="profit"   stroke="var(--accent-3)" strokeWidth={2} fill="url(#gPro)" name="Profit" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Second row */}
      <div className="grid-2" style={{ marginBottom:'1.3rem' }}>
        <div className="card">
          <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-muted)', marginBottom:'1rem' }}>
            Expense breakdown · last month
          </div>
          {expBreakdown.map(e => (
            <div key={e.name} style={{ marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:13, color:'var(--text-secondary)' }}>{e.name}</span>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:12, color:e.color }}>{formatCurrency(e.val)} <span style={{ color:'var(--text-muted)' }}>({e.pct}%)</span></span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width:`${e.pct}%`, background:e.color }} />
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-muted)', marginBottom:'1rem' }}>
            Top items by revenue
          </div>
          {topItems.length === 0
            ? <p style={{ color:'var(--text-muted)', fontSize:13 }}>No bills yet.</p>
            : topItems.map((item, i) => (
              <div key={item.name} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid color-mix(in srgb, var(--border) 50%, transparent)' }}>
                <div style={{ width:22, height:22, borderRadius:'50%', background:'var(--bg-overlay)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontFamily:'var(--font-mono)', color:'var(--text-muted)', flexShrink:0 }}>
                  {i+1}
                </div>
                <span style={{ fontSize:18 }}>{item.emoji}</span>
                <div style={{ flex:1, fontSize:13, color:'var(--text-primary)', fontWeight:500 }}>{item.name}</div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--accent)' }}>{formatCurrency(item.revenue)}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>{item.qty} units</div>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* Monthly table */}
      <div className="card">
        <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-muted)', marginBottom:'1rem' }}>
          Month-by-month breakdown
        </div>
        <div className="scroll-x">
          <table>
            <thead><tr>
              <th>Month</th><th>Revenue</th><th>Restock</th><th>Salaries</th>
              <th>Maintenance</th><th>Op. Expenses</th><th>Total Exp.</th><th>Net Profit</th><th>Margin</th>
              {compareMode && <><th>Prev. Revenue</th><th>Δ</th></>}
            </tr></thead>
            <tbody>
              {current.map((m, i) => (
                <tr key={m.month}>
                  <td style={{ color:'var(--text-primary)', fontWeight:600 }}>{m.month}</td>
                  <td style={{ fontFamily:'var(--font-mono)', color:'var(--accent)' }}>{formatCurrency(m.revenue)}</td>
                  <td style={{ fontFamily:'var(--font-mono)', color:'var(--accent-2)', fontSize:12 }}>{formatCurrency(m.restock)}</td>
                  <td style={{ fontFamily:'var(--font-mono)', color:'var(--danger)', fontSize:12 }}>{formatCurrency(m.salaries)}</td>
                  <td style={{ fontFamily:'var(--font-mono)', fontSize:12 }}>{formatCurrency(m.maintenance)}</td>
                  <td style={{ fontFamily:'var(--font-mono)', fontSize:12 }}>{formatCurrency(m.opex||0)}</td>
                  <td style={{ fontFamily:'var(--font-mono)', color:'var(--info)', fontSize:12 }}>{formatCurrency(m.expenses)}</td>
                  <td style={{ fontFamily:'var(--font-mono)', fontWeight:700, color:m.profit>=0?'var(--success)':'var(--danger)' }}>{formatCurrency(m.profit)}</td>
                  <td><span className={`badge ${m.profit>=0?'badge-green':'badge-red'}`}>{Math.round((m.profit/m.revenue)*100)}%</span></td>
                  {compareMode && <td style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--text-muted)' }}>{formatCurrency(previous[i]?.revenue||0)}</td>}
                  {compareMode && (() => { const d=m.revenue-(previous[i]?.revenue||0); return <td style={{ fontFamily:'var(--font-mono)', fontSize:12, color:d>=0?'var(--success)':'var(--danger)' }}>{d>=0?'+':''}{formatCurrency(d)}</td> })()}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  )
}
