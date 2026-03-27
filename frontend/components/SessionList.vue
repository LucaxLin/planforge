<template>
  <div class="flex-1 overflow-y-auto">
    <div class="p-2 space-y-1">
      <div
        v-for="session in sessions"
        :key="session.id"
        class="group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors"
        :class="currentSessionId === session.id
          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'"
      >
        <div class="flex-1 flex items-center gap-2 min-w-0" @click="$emit('select', session.id)">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span class="truncate text-sm">{{ session.title }}</span>
        </div>
        <div v-if="deletingId === session.id" class="flex items-center gap-1">
          <button
            @click.stop="$emit('confirmDelete', session.id)"
            class="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            确认
          </button>
          <button
            @click.stop="$emit('cancelDelete')"
            class="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            取消
          </button>
        </div>
        <button
          v-else
          @click.stop="$emit('startDelete', session.id)"
          class="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all"
        >
          <svg class="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div v-if="sessions.length === 0" class="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
        暂无对话记录
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Session {
  id: string
  title: string
}

defineProps<{
  sessions: Session[]
  currentSessionId: string | null
  deletingId: string | null
}>()

defineEmits<{
  select: [sessionId: string]
  startDelete: [sessionId: string]
  confirmDelete: [sessionId: string]
  cancelDelete: []
}>()
</script>
