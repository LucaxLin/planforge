<template>
  <div class="min-h-screen bg-gray-50">
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - PlanForge` : 'PlanForge'
  },
})
</script>
