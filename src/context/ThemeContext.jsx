import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { COLOR_THEMES, FONT_THEMES } from '../styles/themes'

const ThemeContext = createContext(null)

/**
 * Applies CSS custom properties to :root and sets data attributes on <html>
 * so CSS selectors like [data-mode="light"] work for light mode overrides.
 */
function applyTheme(colorKey, mode, fontKey) {
  const root = document.documentElement
  const palette = COLOR_THEMES[colorKey]
  const fontSet = FONT_THEMES[fontKey]

  // Apply color tokens
  const tokens = palette[mode] || palette.dark
  Object.entries(tokens).forEach(([prop, value]) => {
    root.style.setProperty(prop, value)
  })

  // Set data attributes for CSS targeting
  root.setAttribute('data-theme', colorKey)
  root.setAttribute('data-mode', mode)

  // Apply font tokens
  root.style.setProperty('--font-display', fontSet.display)
  root.style.setProperty('--font-body', fontSet.body)
  root.style.setProperty('--font-mono', fontSet.mono)

  // Inject / update Google Fonts link
  const existingLink = document.getElementById('ll-google-fonts')
  const href = `https://fonts.googleapis.com/css2?family=${fontSet.googleFonts}&display=swap`
  if (existingLink) {
    existingLink.href = href
  } else {
    const link = document.createElement('link')
    link.id = 'll-google-fonts'
    link.rel = 'stylesheet'
    link.href = href
    document.head.appendChild(link)
  }
}

export function ThemeProvider({ children }) {
  const [colorTheme, setColorTheme] = useState(
    () => localStorage.getItem('ll-color-theme') || 'ocean'
  )
  const [mode, setMode] = useState(
    () => localStorage.getItem('ll-mode') || 'dark'
  )
  const [fontTheme, setFontTheme] = useState(
    () => localStorage.getItem('ll-font-theme') || 'syne'
  )

  // Apply on mount and whenever anything changes
  useEffect(() => {
    applyTheme(colorTheme, mode, fontTheme)
  }, [colorTheme, mode, fontTheme])

  const changeColorTheme = useCallback((key) => {
    setColorTheme(key)
    localStorage.setItem('ll-color-theme', key)
  }, [])

  const toggleMode = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('ll-mode', next)
      return next
    })
  }, [])

  const setModeExplicit = useCallback((m) => {
    setMode(m)
    localStorage.setItem('ll-mode', m)
  }, [])

  const changeFontTheme = useCallback((key) => {
    setFontTheme(key)
    localStorage.setItem('ll-font-theme', key)
  }, [])

  return (
    <ThemeContext.Provider value={{
      colorTheme, mode, fontTheme,
      changeColorTheme, toggleMode, setModeExplicit, changeFontTheme,
      isDark: mode === 'dark',
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

/** Custom hook — throws if used outside <ThemeProvider> */
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
