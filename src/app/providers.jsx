import React from 'react'
import { ThemeProvider } from '../context/ThemeContext'
import { AppProvider } from '../context/AppContext'

/**
 * Wraps the entire application with all global context providers.
 * Order matters — ThemeProvider first so AppProvider children can consume theme.
 */
export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <AppProvider>
        {children}
      </AppProvider>
    </ThemeProvider>
  )
}
