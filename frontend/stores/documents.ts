import { defineStore } from 'pinia'
import api from '../utils/api'

interface Document {
  id: number
  session_id: string
  title: string
  content: string | null
  status: 'pending' | 'generating' | 'completed' | 'failed'
  created_at: number
  updated_at: number
}

interface APIConfig {
  provider: string
  apiKey: string
  baseURL?: string
  model: string
}

export const useDocumentStore = defineStore('document', {
  state: () => ({
    documents: [] as Document[],
    _initialized: false,
  }),

  getters: {
    validDocuments: (state) => {
      return state.documents.filter(doc => doc.status === 'completed')
    },

    generatingDocuments: (state) => {
      return state.documents.filter(doc => doc.status === 'generating')
    },
  },

  actions: {
    async init() {
      if (this._initialized) return
      await this.loadDocuments()
      this._initialized = true
    },

    async loadDocuments() {
      try {
        const data = await api.documents.list()
        this.documents = data.documents || []
      } catch (e) {
        console.error('Failed to load documents:', e)
      }
    },

    async createDocument(sessionId: string, title: string = '项目实施计划', apiConfig?: APIConfig) {
      try {
        const config = apiConfig ? {
          provider: apiConfig.provider,
          apiKey: apiConfig.apiKey,
          model: apiConfig.model,
          ...(apiConfig.baseURL && { baseURL: apiConfig.baseURL }),
        } : {
          provider: '',
          apiKey: '',
          model: '',
        }

        const data = await api.documents.generate(sessionId, title, config)
        
        this.documents.unshift(data.document)
        
        return data.document
      } catch (e: any) {
        throw e
      }
    },

    async refreshDocument(documentId: number) {
      try {
        const data = await api.documents.get(documentId)
        
        const index = this.documents.findIndex(d => d.id === documentId)
        if (index >= 0) {
          this.documents[index] = data.document
        }
        
        return data.document
      } catch (e) {
        console.error('Failed to refresh document:', e)
        return null
      }
    },

    async checkDocumentStatus(documentId: number): Promise<Document | null> {
      try {
        const data = await api.documents.get(documentId)
        
        const index = this.documents.findIndex(d => d.id === documentId)
        if (index >= 0) {
          this.documents[index] = data.document
        }
        
        return data.document
      } catch (e) {
        console.error('Failed to check document status:', e)
        return null
      }
    },

    async deleteDocument(documentId: number) {
      try {
        await api.documents.delete(documentId)
        this.documents = this.documents.filter(d => d.id !== documentId)
      } catch (e) {
        console.error('Failed to delete document:', e)
      }
    },

    getTimeRemaining(updatedAt: number): string {
      const remaining = updatedAt + 24 * 60 * 60 * 1000 - Date.now()
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
