<template>
  <div class="h-14 px-4 flex items-center bg-white dark:bg-gray-900">
    <div class="max-w-3xl mx-auto flex items-center gap-3 w-full">
      <ClientOnly>
        <div v-if="!hasApiKey" class="text-center py-3">
          <span class="text-sm text-gray-500 dark:text-gray-400">请先</span>
          <NuxtLink to="/config" class="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mx-1">配置 AI</NuxtLink>
          <span class="text-sm text-gray-500 dark:text-gray-400">开始对话</span>
        </div>
        <div v-else class="flex gap-3 w-full">
          <input
            :value="modelValue"
            type="text"
            @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
            @keydown.enter="$emit('send')"
            :disabled="disabled"
            placeholder="输入您的需求..."
            class="flex-1 h-9 px-4 bg-gray-100 dark:bg-gray-800 border-0 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          <button
            @click="$emit('send')"
            :disabled="!modelValue.trim() || disabled"
            class="h-9 px-4 tech-gradient text-white rounded-lg font-medium text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex-shrink-0"
          >
            发送
          </button>
        </div>
        <template #fallback>
          <div class="flex gap-3 w-full">
            <div class="flex-1 h-9 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
            <div class="w-16 h-9 tech-gradient rounded-lg animate-pulse flex-shrink-0"></div>
          </div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  hasApiKey: boolean
  disabled: boolean
}>()

defineEmits<{
  'update:modelValue': [value: string]
  send: []
}>()
</script>
