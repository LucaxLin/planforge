import { defineStore } from 'pinia'

type AIProvider = 'minimax' | 'zai' | 'custom'

interface AIConfig {
  provider: AIProvider
  apiKey: string
  baseURL?: string
  model: string
}

const STORAGE_KEY = 'planforge-ai-config'

export const useConfigStore = defineStore('config', {
  state: () => ({
    provider: 'minimax' as AIProvider,
    apiKey: '',
    baseURL: '' as string | undefined,
    model: 'MiniMax-M2.7',
    _initialized: false,
  }),

  getters: {
    isConfigured: (state) => !!state.apiKey && !!state.model,
    
    config: (state): AIConfig => ({
      provider: state.provider,
      apiKey: state.apiKey,
      baseURL: state.baseURL,
      model: state.model,
    }),
  },

  actions: {
    loadFromStorage() {
      if (typeof window === 'undefined') return
      
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const config = JSON.parse(stored) as AIConfig
          this.provider = config.provider
          this.apiKey = config.apiKey
          this.baseURL = config.baseURL
          this.model = config.model
        }
      } catch (e) {
        console.error('Failed to load config from storage:', e)
      }
      
      this._initialized = true
    },

    setConfig(config: AIConfig) {
      this.provider = config.provider
      this.apiKey = config.apiKey
      this.baseURL = config.baseURL
      this.model = config.model

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
        } catch (e) {
          console.error('Failed to save config to storage:', e)
        }
      }
    },

    clearConfig() {
      this.provider = 'minimax'
      this.apiKey = ''
      this.baseURL = ''
      this.model = 'MiniMax-M2.7'

      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(STORAGE_KEY)
        } catch (e) {
          console.error('Failed to clear config from storage:', e)
        }
      }
    },
  },
})
