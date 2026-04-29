import React, { createContext, useContext, useState, useCallback } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem('ll-sidebar-collapsed') === 'true'
  )

  const navigate = useCallback((section) => {
    setActiveSection(section)
  }, [])

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev
      localStorage.setItem('ll-sidebar-collapsed', String(next))
      return next
    })
  }, [])

  return (
    <AppContext.Provider value={{ activeSection, navigate, sidebarCollapsed, toggleSidebar }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
