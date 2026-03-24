import { useThemeStore } from '~/stores/theme'

export default defineNuxtPlugin(async () => {
  const themeStore = useThemeStore()

  themeStore.init()
})
