import { defineStore } from 'pinia'

interface Message {
  id?: number
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at?: number
}

interface Session {
  id: string
  title: string
  requirement_content?: string
  created_at: number
  updated_at: number
}

export const useConversationStore = defineStore('conversation', {
  state: () => ({
    sessions: [] as Session[],
    currentSessionId: null as string | null,
    currentMessages: [] as Message[],
    isLoading: false,
    isGenerating: false,
    error: null as string | null,
  }),

  getters: {
    currentSession: (state) => {
      return state.sessions.find(s => s.id === state.currentSessionId)
    },

    sortedSessions: (state) => {
      return [...state.sessions].sort((a, b) => b.updated_at - a.updated_at)
    },
  },

  actions: {
    async loadSessions() {
      try {
        const response = await fetch('/api/sessions')
        const data = await response.json()
        this.sessions = data.sessions || []
      } catch (e: any) {
        console.error('Failed to load sessions:', e)
      }
    },

    async createSession(title?: string, requirementContent?: string) {
      try {
        const response = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, requirementContent }),
        })
        const data = await response.json()
        this.sessions.unshift(data.session)
        this.currentSessionId = data.session.id
        this.currentMessages = []
        return data.session
      } catch (e: any) {
        this.error = e.message
        throw e
      }
    },

    async loadSession(sessionId: string) {
      try {
        const response = await fetch(`/api/sessions/${sessionId}`)
        const data = await response.json()
        
        this.currentSessionId = sessionId
        
        const existingIndex = this.sessions.findIndex(s => s.id === sessionId)
        if (existingIndex >= 0) {
          this.sessions[existingIndex] = data.session
        } else {
          this.sessions.unshift(data.session)
        }
        
        this.currentMessages = data.messages || []
        
        return data
      } catch (e: any) {
        this.error = e.message
        throw e
      }
    },

    async updateSessionTitle(sessionId: string, title: string) {
      try {
        await fetch(`/api/sessions/${sessionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title }),
        })
        
        const session = this.sessions.find(s => s.id === sessionId)
        if (session) {
          session.title = title
        }
      } catch (e: any) {
        this.error = e.message
      }
    },

    async deleteSession(sessionId: string) {
      try {
        await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' })
        this.sessions = this.sessions.filter(s => s.id !== sessionId)
        
        if (this.currentSessionId === sessionId) {
          this.currentSessionId = null
          this.currentMessages = []
        }
      } catch (e: any) {
        this.error = e.message
      }
    },

    async sendMessage(message: string, apiConfig: { provider: string, apiKey: string, baseURL?: string, model: string }) {
      if (!this.currentSessionId) {
        await this.createSession()
      }

      this.isLoading = true
      this.error = null

      this.currentMessages.push({ role: 'user', content: message })

      try {
        const response = await fetch('/api/sessions/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-provider': apiConfig.provider,
            'x-api-key': apiConfig.apiKey,
            'x-api-baseurl': apiConfig.baseURL || '',
            'x-api-model': apiConfig.model,
          },
          body: JSON.stringify({
            requirementId: this.currentSessionId,
            message,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to send message')
        }

        const reader = response.body?.getReader()
        if (!reader) throw new Error('No response body')

        let fullResponse = ''
        const assistantMessage: Message = { role: 'assistant', content: '' }
        this.currentMessages.push(assistantMessage)

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const text = new TextDecoder().decode(value)
          const lines = text.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.content) {
                  fullResponse += data.content
                  assistantMessage.content = fullResponse
                }
                if (data.done && data.history) {
                  this.currentMessages = data.history.map((h: any) => ({
                    id: Date.now(),
                    role: h.role,
                    content: h.content,
                    created_at: Date.now(),
                  }))
                }
              } catch (e) {
                // Ignore parse errors for partial data
              }
            }
          }
        }

        await this.syncMessages()
        return fullResponse

      } catch (e: any) {
        this.error = e.message
        this.currentMessages = this.currentMessages.filter(m => m.role !== 'assistant' || m.content !== '')
        throw e
      } finally {
        this.isLoading = false
      }
    },

    async syncMessages() {
      if (!this.currentSessionId) return

      try {
        await fetch(`/api/sessions/${this.currentSessionId}/messages`, {
          method: 'DELETE',
        })

        for (const msg of this.currentMessages) {
          if (msg.role === 'system') continue
          await fetch(`/api/sessions/${this.currentSessionId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: msg.role, content: msg.content }),
          })
        }
      } catch (e) {
        console.error('Failed to sync messages:', e)
      }
    },

    clearCurrentConversation() {
      this.currentMessages = []
      if (this.currentSessionId) {
        this.syncMessages()
      }
    },
  },
})
