import { defineStore } from 'pinia'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'planforge-theme'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: 'light' as Theme,
    _initialized: false,
  }),

  getters: {
    isDark: (state) => state.theme === 'dark',
  },

  actions: {
    init() {
      if (import.meta.client && !this._initialized) {
        this.loadFromStorage()
        this.applyTheme()
      }
      this._initialized = true
    },

    loadFromStorage() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored && (stored === 'light' || stored === 'dark')) {
          this.theme = stored
        } else {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          this.theme = prefersDark ? 'dark' : 'light'
        }
      } catch (e) {
        console.error('Failed to load theme from storage:', e)
      }
    },

    saveToStorage() {
      try {
        localStorage.setItem(STORAGE_KEY, this.theme)
      } catch (e) {
        console.error('Failed to save theme to storage:', e)
      }
    },

    applyTheme() {
      if (import.meta.client) {
        const root = document.documentElement
        if (this.theme === 'dark') {
          root.classList.add('dark')
        } else {
          root.classList.remove('dark')
        }
      }
    },

    toggle() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
      this.saveToStorage()
      this.applyTheme()
    },

    setTheme(theme: Theme) {
      this.theme = theme
      this.saveToStorage()
      this.applyTheme()
    },
  },
})
