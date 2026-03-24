import { useThemeStore } from '~/stores/theme'
import { useConfigStore } from '~/stores/config'

export default defineNuxtPlugin(async () => {
  const themeStore = useThemeStore()
  const configStore = useConfigStore()

  themeStore.init()
  configStore.loadFromStorage()
})
