import React from 'react'
import { useApp } from '../context/AppContext'
import { useStore } from '../store/useStore'
import Sidebar from '../components/Sidebar'

// Feature pages — each feature owns its own folder
import Dashboard   from '../features/dashboard/index'
import Billing     from '../features/billing/index'
import Items       from '../features/items/index'
import Purchases   from '../features/purchases/index'
import Storage     from '../features/storage/index'
import Expenses    from '../features/expenses/index'
import Members     from '../features/members/index'
import Maintenance from '../features/maintenance/index'
import Settings    from '../features/settings/index'

const SECTION_MAP = {
  dashboard:   Dashboard,
  billing:     Billing,
  items:       Items,
  purchases:   Purchases,
  storage:     Storage,
  expenses:    Expenses,
  members:     Members,
  maintenance: Maintenance,
  settings:    Settings,
}

export default function App() {
  const { activeSection } = useApp()
  const store = useStore()

  const ActiveSection = SECTION_MAP[activeSection] || Dashboard

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <ActiveSection store={store} />
      </main>
    </div>
  )
}
