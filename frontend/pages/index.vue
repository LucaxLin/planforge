<template>
  <div class="h-full flex">
    <aside class="w-64 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-900 hidden lg:flex">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          @click="startNewConversation"
          class="w-full flex items-center justify-center gap-2 px-4 py-2.5 tech-gradient text-white rounded-lg hover:opacity-90 transition-opacity font-medium text-sm"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          新建对话
        </button>
      </div>

      <div class="flex-1 overflow-y-auto">
        <div class="p-2 space-y-1">
          <div
            v-for="session in conversationStore.sortedSessions"
            :key="session.id"
            @click="loadConversation(session.id)"
            class="group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors"
            :class="conversationStore.currentSessionId === session.id
              ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'"
          >
            <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span class="flex-1 truncate text-sm">{{ session.title }}</span>
            <button
              @click.stop="deleteConversation(session.id)"
              class="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all"
            >
              <svg class="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <div v-if="conversationStore.sortedSessions.length === 0" class="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
            暂无对话记录
          </div>
        </div>
      </div>

      <div class="p-3 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-2">
          <NuxtLink to="/config" class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            设置
          </NuxtLink>
          <NuxtLink to="/documents" class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            文档
          </NuxtLink>
        </div>
      </div>
    </aside>

    <main class="flex-1 flex flex-col h-full overflow-hidden">
      <header class="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 lg:hidden">
        <button @click="showMobileSidebar = true" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 class="font-medium text-gray-900 dark:text-white">{{ conversationStore.currentSession?.title || '新对话' }}</h1>
        <NuxtLink to="/documents" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </NuxtLink>
      </header>

      <div class="hidden lg:flex lg:items-center lg:justify-between lg:px-6 lg:h-14 lg:border-b lg:border-gray-200 dark:lg:border-gray-700 lg:bg-white dark:lg:bg-gray-900">
        <h1 class="text-lg font-semibold text-gray-900 dark:text-white truncate pr-4">
          {{ conversationStore.currentSession?.title || '新对话' }}
        </h1>
        <div class="flex items-center gap-2 flex-shrink-0">
          <button
            v-if="conversationStore.currentMessages.length > 0"
            @click="generateDocument"
            :disabled="isGeneratingDoc || !hasApiKey"
            class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
            :class="hasApiKey
              ? 'tech-gradient text-white hover:opacity-90'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'"
          >
            {{ isGeneratingDoc ? '生成中...' : '生成完整方案' }}
          </button>
        </div>
      </div>

      <div ref="chatContainer" class="flex-1 overflow-y-auto chat-scroll">
        <div class="max-w-3xl mx-auto px-4 py-6">
          <div v-if="conversationStore.currentMessages.length === 0" class="flex flex-col items-center justify-center h-full text-center">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              有什么可以帮您的？
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-8">
              描述您的项目需求，我可以帮您分析并生成详细的技术实现方案
            </p>
            <div class="grid grid-cols-2 gap-2 max-w-md">
              <button
                v-for="example in examples"
                :key="example"
                @click="startWithExample(example)"
                class="px-4 py-2.5 text-sm text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors text-gray-700 dark:text-gray-300"
              >
                {{ example }}
              </button>
            </div>
          </div>

          <div v-else class="space-y-6">
            <div
              v-for="(message, index) in conversationStore.currentMessages"
              :key="index"
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
              <div class="flex-1 max-w-2xl">
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

            <div v-if="conversationStore.isLoading" class="flex gap-3">
              <div class="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div class="flex-1 max-w-2xl">
                <div class="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm">
                  <div class="flex gap-1">
                    <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
                    <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
                    <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
        <div class="max-w-3xl mx-auto">
          <div v-if="!hasApiKey" class="text-center py-3">
            <span class="text-sm text-gray-500 dark:text-gray-400">请先</span>
            <NuxtLink to="/config" class="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mx-1">配置 AI</NuxtLink>
            <span class="text-sm text-gray-500 dark:text-gray-400">开始对话</span>
          </div>
          <div v-else class="flex gap-3">
            <input
              v-model="userInput"
              type="text"
              @keydown.enter="sendMessage"
              :disabled="conversationStore.isLoading"
              placeholder="输入您的需求..."
              class="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <button
              @click="sendMessage"
              :disabled="!userInput.trim() || conversationStore.isLoading"
              class="px-5 py-3 tech-gradient text-white rounded-xl font-medium text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              发送
            </button>
          </div>
        </div>
      </div>
    </main>

    <Teleport to="body">
      <div
        v-if="showMobileSidebar"
        class="fixed inset-0 z-50 lg:hidden"
      >
        <div class="absolute inset-0 bg-black/50" @click="showMobileSidebar = false"></div>
        <aside class="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-900 flex flex-col">
          <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <span class="font-semibold text-gray-900 dark:text-white">对话历史</span>
            <button @click="showMobileSidebar = false" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
              <svg class="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-4">
            <button
              @click="startNewConversation(); showMobileSidebar = false"
              class="w-full flex items-center justify-center gap-2 px-4 py-2.5 tech-gradient text-white rounded-lg hover:opacity-90 transition-opacity font-medium text-sm"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              新建对话
            </button>
          </div>
          <div class="flex-1 overflow-y-auto px-2">
            <div
              v-for="session in conversationStore.sortedSessions"
              :key="session.id"
              @click="loadConversation(session.id); showMobileSidebar = false"
              class="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm mb-1"
              :class="conversationStore.currentSessionId === session.id ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : ''"
            >
              {{ session.title }}
            </div>
          </div>
          <div class="p-3 border-t border-gray-200 dark:border-gray-700 space-y-1">
            <NuxtLink
              to="/config"
              @click="showMobileSidebar = false"
              class="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              AI 设置
            </NuxtLink>
            <NuxtLink
              to="/documents"
              @click="showMobileSidebar = false"
              class="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              我的文档
            </NuxtLink>
          </div>
        </aside>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showDocToast" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 bg-gray-900 dark:bg-gray-800 text-white rounded-lg shadow-lg flex items-center gap-3 text-sm">
        <svg class="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span>{{ docToastMessage }}</span>
        <NuxtLink to="/documents" class="text-indigo-400 hover:underline">查看</NuxtLink>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useConfigStore } from '~/stores/config'
import { useConversationStore } from '~/stores/conversation'
import { useDocumentStore } from '~/stores/documents'
import { marked } from 'marked'

definePageMeta({
  layout: 'default',
})

const configStore = useConfigStore()
const conversationStore = useConversationStore()
const documentStore = useDocumentStore()

const userInput = ref('')
const chatContainer = ref<HTMLElement | null>(null)
const showMobileSidebar = ref(false)
const isGeneratingDoc = ref(false)
const showDocToast = ref(false)
const docToastMessage = ref('')

const examples = [
  '用户登录注册功能',
  '数据统计报表',
  '在线商城系统',
  '企业内部管理系统',
]

const hasApiKey = computed(() => !!configStore.apiKey)

marked.setOptions({
  breaks: true,
  gfm: true,
})

const renderMarkdown = (content: string): string => {
  if (!content) return ''
  let html = marked.parse(content) as string
  html = html.replace(/<pre><code(?: class="language-(\w+)")?>/g, (match, lang) => {
    const language = lang || 'text'
    return `<div class="code-block"><div class="code-header"><span class="code-lang">${language}</span><button class="copy-btn">复制</button></div><pre><code class="language-${language}">`
  })
  html = html.replace(/<\/code><\/pre>/g, '</code></pre></div>')
  return html
}

onMounted(async () => {
  await Promise.all([
    conversationStore.loadSessions(),
    documentStore.init(),
  ])

  if (conversationStore.sortedSessions.length > 0 && !conversationStore.currentSessionId) {
    await conversationStore.loadSession(conversationStore.sortedSessions[0].id)
  }
})

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const startNewConversation = async () => {
  await conversationStore.createSession()
}

const loadConversation = async (sessionId: string) => {
  await conversationStore.loadSession(sessionId)
  scrollToBottom()
}

const deleteConversation = async (sessionId: string) => {
  if (confirm('确定要删除这个对话吗？')) {
    await conversationStore.deleteSession(sessionId)
  }
}

const startWithExample = async (example: string) => {
  if (!hasApiKey.value) return
  userInput.value = example
  await sendMessage()
}

const sendMessage = async () => {
  if (!userInput.value.trim() || conversationStore.isLoading) return

  const message = userInput.value.trim()
  userInput.value = ''

  const firstMessage = conversationStore.currentMessages.length === 0

  await conversationStore.sendMessage(message, {
    provider: configStore.provider,
    apiKey: configStore.apiKey,
    baseURL: configStore.baseURL,
    model: configStore.model,
  })

  if (firstMessage) {
    const title = message.slice(0, 30) + (message.length > 30 ? '...' : '')
    await conversationStore.updateSessionTitle(conversationStore.currentSessionId!, title)
  }

  scrollToBottom()
}

const generateDocument = async () => {
  if (!conversationStore.currentSessionId || isGeneratingDoc.value) return

  isGeneratingDoc.value = true

  try {
    const doc = await documentStore.createDocument(
      conversationStore.currentSessionId,
      conversationStore.currentSession?.title || '项目实施计划'
    )

    docToastMessage.value = '方案生成中，请前往个人中心查看'
    showDocToast.value = true
    setTimeout(() => {
      showDocToast.value = false
    }, 5000)

  } catch (e: any) {
    console.error('Failed to generate document:', e)
  } finally {
    isGeneratingDoc.value = false
  }
}
</script>

<style scoped>
.chat-scroll {
  scroll-behavior: smooth;
}

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
