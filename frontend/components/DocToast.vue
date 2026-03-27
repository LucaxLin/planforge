<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="show" class="fixed top-4 right-4 z-[200] px-4 py-3 bg-gray-900 dark:bg-gray-800 text-white rounded-lg shadow-lg flex items-center gap-3 text-sm max-w-sm">
        <div class="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
          <svg class="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-medium">{{ message }}</p>
        </div>
        <NuxtLink to="/documents" class="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 rounded-md text-white text-xs font-medium transition-colors whitespace-nowrap">
          查看
        </NuxtLink>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
  message: string
}>()
</script>

<style scoped>
.toast-enter-active {
  animation: slideIn 0.3s ease-out;
}

.toast-leave-active {
  animation: slideOut 0.3s ease-in;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
</style>
