import { ref } from 'vue'
import { api } from '~/utils/api'

const isAuthenticated = ref(false)
const currentUser = ref<{ id: string; email: string; created_at: number } | null>(null)
let isChecking = false

export const useAuth = () => {
  const checkAuth = async () => {
    if (isChecking) return
    isChecking = true

    try {
      const data = await api.auth.getCurrentUser()

      if (data.isLoggedIn && data.user) {
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
      await api.auth.logout()
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
