import { ref } from 'vue'

const isAuthenticated = ref(false)
const currentUser = ref<{ id: string; email: string; created_at: number } | null>(null)
let isChecking = false

export const useAuth = () => {
  const checkAuth = async () => {
    if (isChecking) return
    isChecking = true

    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      })

      const data = await response.json()

      if (response.ok && data.isLoggedIn && data.user) {
        isAuthenticated.value = true
        currentUser.value = data.user
      } else {
        isAuthenticated.value = false
        currentUser.value = null
      }
    } catch (error) {
      isAuthenticated.value = false
      currentUser.value = null
    } finally {
      isChecking = false
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      isAuthenticated.value = false
      currentUser.value = null
    }
  }

  return {
    isAuthenticated,
    currentUser,
    checkAuth,
    logout,
  }
}
