<template>
  <div
    class="flex gap-3"
    :class="message.role === 'user' ? 'flex-row-reverse' : ''"
  >
    <div
      class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
      :class="message.role === 'user'
        ? 'bg-indigo-600'
        : 'bg-gradient-to-br from-indigo-500 to-purple-600'"
    >
      <svg v-if="message.role === 'user'" class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      <svg v-else class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    </div>
    <div class="flex-1 flex max-w-2xl" :class="message.role === 'user' ? ' justify-end' : ''">
      <div
        class="px-4 py-3 rounded-2xl text-sm leading-relaxed"
        :class="message.role === 'user'
          ? 'bg-indigo-600 text-white rounded-tr-sm'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-sm'"
      >
        <div v-if="message.role === 'assistant'" class="markdown-content" v-html="renderMarkdown(message.content)"></div>
        <div v-else>{{ message.content }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  _streamUpdate?: number | string
}

defineProps<{
  message: Message
}>()

marked.setOptions({
  breaks: true,
  gfm: true,
})

const renderMarkdown = (content: string): string => {
  if (!content) return ''
  let html = marked.parse(content) as string
  html = html.replace(/<pre><code(?: class="language-(\w+)")?>/g, (_match, lang) => {
    const language = lang || 'text'
    return `<div class="code-block"><div class="code-header"><span class="code-lang">${language}</span><button class="copy-btn">复制</button></div><pre><code class="language-${language}">`
  })
  html = html.replace(/<\/code><\/pre>/g, '</code></pre></div>')
  return html
}
</script>

<style scoped>
.markdown-content :deep(.code-block) {
  @apply my-3 rounded-lg overflow-hidden bg-gray-900;
}

.markdown-content :deep(.code-header) {
  @apply flex items-center justify-between px-3 py-1.5 bg-gray-800 text-xs;
}

.markdown-content :deep(.code-lang) {
  @apply text-gray-400 font-mono;
}

.markdown-content :deep(.copy-btn) {
  @apply px-2 py-0.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors;
}

.markdown-content :deep(pre) {
  @apply p-3 overflow-x-auto text-sm;
}

.markdown-content :deep(code) {
  @apply font-mono text-gray-100;
}

.markdown-content :deep(pre code) {
  @apply bg-transparent;
}

.markdown-content :deep(p:not(:last-child)) {
  @apply mb-3;
}

.markdown-content :deep(ul), .markdown-content :deep(ol) {
  @apply pl-5 mb-3;
}

.markdown-content :deep(li) {
  @apply mb-1;
}

.markdown-content :deep(h2) {
  @apply text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-white;
}

.markdown-content :deep(h3) {
  @apply text-base font-semibold mt-3 mb-2 text-gray-900 dark:text-white;
}

.markdown-content :deep(p code) {
  @apply px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm text-indigo-600 dark:text-indigo-400;
}
</style>
