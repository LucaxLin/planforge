import { useConfigStore } from '~/stores/config'
import { useThemeStore } from '~/stores/theme'

export default defineNuxtPlugin(() => {
  const configStore = useConfigStore()
  const themeStore = useThemeStore()
  
  if (import.meta.client) {
    if (!configStore._initialized) {
      configStore.loadFromStorage()
    }
    
    themeStore.init()
  }
})
