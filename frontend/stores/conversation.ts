import { defineStore } from 'pinia'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Conversation {
  requirementId: string
  title: string
  messages: Message[]
  requirementContent: string
  isLoading: boolean
  isGeneratingSolution: boolean
}

const STORAGE_KEY = 'planforge-conversation'

export const useConversationStore = defineStore('conversation', {
  state: () => ({
    currentConversation: null as Conversation | null,
    _initialized: false,
    _activeStreamReader: null as ReadableStreamDefaultReader<Uint8Array> | null,
  }),

  getters: {
    hasActiveConversation: (state) => state.currentConversation !== null,
    messageCount: (state) => state.currentConversation?.messages.length || 0,
    isLoading: (state) => state.currentConversation?.isLoading || false,
    isGeneratingSolution: (state) => state.currentConversation?.isGeneratingSolution || false,
  },

  actions: {
    init() {
      if (this._initialized) return
      
      this.loadFromStorage()
      this._initialized = true
    },

    loadFromStorage() {
      if (typeof window === 'undefined') return
      
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          this.currentConversation = JSON.parse(stored)
        }
      } catch (e) {
        console.error('Failed to load conversation from storage:', e)
      }
    },

    saveToStorage() {
      if (typeof window === 'undefined') return
      
      try {
        if (this.currentConversation) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentConversation))
        } else {
          localStorage.removeItem(STORAGE_KEY)
        }
      } catch (e) {
        console.error('Failed to save conversation to storage:', e)
      }
    },

    startConversation(requirementId: string, title: string, requirementContent: string) {
      this.currentConversation = {
        requirementId,
        title,
        messages: [],
        requirementContent,
        isLoading: false,
        isGeneratingSolution: false,
      }
      this.saveToStorage()
    },

    addMessage(role: 'user' | 'assistant', content: string) {
      if (!this.currentConversation) return
      
      this.currentConversation.messages.push({ role, content })
      this.saveToStorage()
    },

    updateLastMessage(content: string) {
      if (!this.currentConversation || this.currentConversation.messages.length === 0) return
      
      const lastMessage = this.currentConversation.messages[this.currentConversation.messages.length - 1]
      lastMessage.content = content
      this.saveToStorage()
    },

    setLoading(loading: boolean) {
      if (!this.currentConversation) return
      this.currentConversation.isLoading = loading
      this.saveToStorage()
    },

    setGeneratingSolution(generating: boolean) {
      if (!this.currentConversation) return
      this.currentConversation.isGeneratingSolution = generating
      this.saveToStorage()
    },

    setActiveStreamReader(reader: ReadableStreamDefaultReader<Uint8Array> | null) {
      this._activeStreamReader = reader
    },

    cancelActiveStream() {
      if (this._activeStreamReader) {
        this._activeStreamReader.cancel()
        this._activeStreamReader = null
      }
    },

    clearConversation() {
      this.cancelActiveStream()
      this.currentConversation = null
      this.saveToStorage()
    },
  },
})
