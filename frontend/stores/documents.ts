import { defineStore } from 'pinia'

interface Document {
  id: string
  title: string
  content: string
  createdAt: number
  expiresAt: number
}

const STORAGE_KEY = 'planforge-documents'
const EXPIRY_TIME = 24 * 60 * 60 * 1000

export const useDocumentStore = defineStore('document', {
  state: () => ({
    documents: [] as Document[],
    _initialized: false,
  }),

  getters: {
    validDocuments: (state) => {
      const now = Date.now()
      return state.documents.filter(doc => doc.expiresAt > now)
    },

    expiredDocuments: (state) => {
      const now = Date.now()
      return state.documents.filter(doc => doc.expiresAt <= now)
    },
  },

  actions: {
    async init() {
      if (this._initialized) return

      this.loadFromStorage()
      this.cleanExpiredDocuments()
      this._initialized = true
    },

    loadFromStorage() {
      if (typeof window === 'undefined') return

      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          this.documents = JSON.parse(stored)
        }
      } catch (e) {
        console.error('Failed to load documents from storage:', e)
      }
    },

    saveToStorage() {
      if (typeof window === 'undefined') return

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.documents))
      } catch (e) {
        console.error('Failed to save documents to storage:', e)
      }
    },

    cleanExpiredDocuments() {
      const now = Date.now()
      const before = this.documents.length
      this.documents = this.documents.filter(doc => doc.expiresAt > now)

      if (this.documents.length !== before) {
        this.saveToStorage()
      }
    },

    addDocument(title: string, content: string): string {
      const now = Date.now()
      const id = `doc_${now}_${Math.random().toString(36).substr(2, 9)}`

      const document: Document = {
        id,
        title,
        content,
        createdAt: now,
        expiresAt: now + EXPIRY_TIME,
      }

      this.documents.unshift(document)
      this.saveToStorage()

      return id
    },

    getDocument(id: string): Document | undefined {
      return this.validDocuments.find(doc => doc.id === id)
    },

    deleteDocument(id: string) {
      this.documents = this.documents.filter(doc => doc.id !== id)
      this.saveToStorage()
    },

    getTimeRemaining(expiresAt: number): string {
      const now = Date.now()
      const remaining = expiresAt - now

      if (remaining <= 0) return '已过期'

      const hours = Math.floor(remaining / (1000 * 60 * 60))
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))

      if (hours > 0) {
        return `${hours}小时${minutes}分钟`
      }
      return `${minutes}分钟`
    },
  },
})
