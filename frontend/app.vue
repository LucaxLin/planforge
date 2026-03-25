<template>
  <div class="h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()

if (process.client) {
  (window as any).__RUNTIME_CONFIG__ = {
    apiBaseUrl: config.public.apiBaseUrl
  }
}

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - PlanForge` : 'PlanForge'
  },
})
</script>
