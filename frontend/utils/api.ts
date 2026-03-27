const getApiBase = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3001'
    }
    return (window as any).__RUNTIME_CONFIG__?.apiBaseUrl || 'https://planforge-api.lucaslinn.cc.cd'
  }
  return 'https://planforge-api.lucaslinn.cc.cd'
}

const redirectToLogin = () => {
  if (typeof window !== 'undefined' && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
    window.location.href = '/login'
  }
}

const baseFetch = async (endpoint: string, options: RequestInit = {}) => {
  const baseUrl = getApiBase()
  const url = `${baseUrl}/api${endpoint}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  })

  const data = await response.json()

  if (!response.ok) {
    if (response.status === 401) {
      redirectToLogin()
    }
    throw new Error(data.error || `API Error: ${response.status}`)
  }

  return data
}

export const api = {
  auth: {
    getCurrentUser: () => baseFetch('/auth/me'),

    sendRegisterCode: (data: {
      email: string;
      password: string;
      confirmPassword: string;
    }) => baseFetch('/auth/register/send-code', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

    verifyRegister: (data: {
      email: string;
      code: string;
      password: string;
    }) => baseFetch('/auth/register/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

    login: (data: {
      email: string;
      password: string;
    }) => baseFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

    logout: () => baseFetch('/auth/logout', {
      method: 'POST',
    }),
  },

  sessions: {
    list: () => baseFetch('/sessions'),

    get: (id: string) => baseFetch(`/sessions/${id}`),

    create: (data: { title?: string; requirementContent?: string }) =>
      baseFetch('/sessions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: { title?: string; requirementContent?: string }) =>
      baseFetch(`/sessions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      baseFetch(`/sessions/${id}`, { method: 'DELETE' }),

    getMessages: (sessionId: string) =>
      baseFetch(`/sessions/${sessionId}/messages`),

    addMessage: (sessionId: string, data: { role: string; content: string }) =>
      baseFetch(`/sessions/${sessionId}/messages`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    clearMessages: (sessionId: string) =>
      baseFetch(`/sessions/${sessionId}/messages`, { method: 'DELETE' }),
  },

  documents: {
    list: () => baseFetch('/documents'),

    get: (id: number) => baseFetch(`/documents/${id}`),

    generate: (sessionId: string, title: string, apiConfig: Record<string, string>) =>
      baseFetch('/documents/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-provider': apiConfig.provider,
          'x-api-key': apiConfig.apiKey,
          'x-api-model': apiConfig.model,
          ...(apiConfig.baseURL && { 'x-api-baseurl': apiConfig.baseURL }),
        },
        body: JSON.stringify({ sessionId, title }),
      }),

    update: (id: number, data: Record<string, any>) =>
      baseFetch(`/documents/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    delete: (id: number) =>
      baseFetch(`/documents/${id}`, { method: 'DELETE' }),
  },

  chat: {
    send: (
      requirementId: string,
      message: string,
      apiConfig: { provider: string; apiKey: string; baseURL?: string; model: string }
    ) => {
      const baseUrl = getApiBase()
      return fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-api-provider': apiConfig.provider,
          'x-api-key': apiConfig.apiKey,
          'x-api-model': apiConfig.model,
          ...(apiConfig.baseURL && { 'x-api-baseurl': apiConfig.baseURL }),
        },
        body: JSON.stringify({ requirementId, message }),
      })
    },
  },
}

export default api
