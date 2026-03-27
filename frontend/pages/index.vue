<template>
  <div class="h-full flex">
    <aside class="w-64 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-900 hidden lg:flex">
      <div class="h-14 px-4 flex items-center">
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

      <SessionList
        :sessions="conversationStore.sortedSessions"
        :current-session-id="conversationStore.currentSessionId"
        :deleting-id="deletingSessionId"
        @select="loadConversation"
        @start-delete="startDelete"
        @confirm-delete="confirmDelete"
        @cancel-delete="cancelDelete"
      />

      <div class="h-14 px-4 flex items-center">
        <div class="flex items-center gap-2 w-full">
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
        <h1 class="font-medium text-gray-900 dark:text-white truncate">{{ conversationStore.currentSession?.title || '新对话' }}</h1>
        <div class="flex items-center gap-2">
          <button
            v-if="conversationStore.currentMessages.length > 0"
            @click="generateDocument"
            :disabled="isGeneratingDoc || !hasApiKey"
            class="px-2 py-1 text-xs font-medium rounded-md tech-gradient text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isGeneratingDoc ? '生成中...' : '生成方案' }}
          </button>
        </div>
      </header>

      <div class="hidden lg:flex lg:items-center lg:justify-between lg:px-4 lg:h-14 lg:bg-white dark:lg:bg-gray-900">
        <h1 class="text-lg font-semibold text-gray-900 dark:text-white truncate pr-4">
          {{ conversationStore.currentSession?.title || '新对话' }}
        </h1>
        <div class="flex items-center gap-2 flex-shrink-0">
          <button
            v-if="conversationStore.currentMessages.length > 0"
            @click="generateDocument"
            :disabled="isGeneratingDoc || !hasApiKey"
            class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
            :class="hasApiKey ? 'tech-gradient text-white hover:opacity-90' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'"
          >
            {{ isGeneratingDoc ? '生成中...' : '生成完整方案' }}
          </button>
        </div>
      </div>

      <div ref="chatContainer" class="flex-1 overflow-y-auto chat-scroll">
        <div class="max-w-3xl mx-auto px-4 py-6">
          <EmptyState
            v-if="conversationStore.currentMessages.length === 0"
            :examples="examples"
            @select="startWithExample"
          />

          <div v-else class="space-y-6">
            <ChatMessage
              v-for="(message, index) in conversationStore.currentMessages"
              :key="index"
              :message="message"
            />

            <LoadingIndicator v-if="conversationStore.isLoading" />
          </div>
        </div>
      </div>

      <ChatInput
        v-model="userInput"
        :has-api-key="hasApiKey"
        :disabled="conversationStore.isLoading"
        @send="sendMessage"
      />
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
              class="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 text-sm mb-1"
              :class="conversationStore.currentSessionId === session.id ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'"
            >
              <span
                class="flex-1 truncate cursor-pointer"
                @click="loadConversation(session.id); showMobileSidebar = false"
              >
                {{ session.title }}
              </span>
              <button
                @click.stop="startDelete(session.id)"
                class="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all"
              >
                <svg class="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
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

    <DocToast
      :show="showDocToast"
      :message="docToastMessage"
    />

    <ErrorToast
      :show="!!error"
      :message="error"
      @close="error = ''"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useConfigStore } from '~/stores/config'
import { useConversationStore } from '~/stores/conversation'
import { useDocumentStore } from '~/stores/documents'
import EmptyState from '~/components/EmptyState.vue'
import ChatMessage from '~/components/ChatMessage.vue'
import LoadingIndicator from '~/components/LoadingIndicator.vue'
import SessionList from '~/components/SessionList.vue'
import ChatInput from '~/components/ChatInput.vue'
import DocToast from '~/components/DocToast.vue'
import ErrorToast from '~/components/ErrorToast.vue'

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
const error = ref('')
const deletingSessionId = ref<string | null>(null)

const examples = [
  '用户登录注册功能',
  '数据统计报表',
  '在线商城系统',
  '企业内部管理系统',
]

const hasApiKey = computed(() => !!configStore.apiKey)

onMounted(async () => {
  await Promise.all([
    conversationStore.loadSessions(),
    documentStore.init(),
  ])

  if (conversationStore.sortedSessions.length > 0 && !conversationStore.currentSessionId) {
    await conversationStore.loadSession(conversationStore.sortedSessions[0].id)
  }
})

watch(
  () => conversationStore.currentMessages.length,
  () => scrollToBottom()
)

watch(
  () => conversationStore.currentMessages[conversationStore.currentMessages.length - 1]?._streamUpdate,
  () => scrollToBottom()
)

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

const startDelete = (sessionId: string) => {
  deletingSessionId.value = sessionId
}

const confirmDelete = async (sessionId: string) => {
  deletingSessionId.value = null
  await conversationStore.deleteSession(sessionId)
}

const cancelDelete = () => {
  deletingSessionId.value = null
}

const startWithExample = async (example: string) => {
  if (!configStore.apiKey) {
    error.value = '请先配置 API 密钥'
    return
  }
  userInput.value = example
  await sendMessage()
}

const sendMessage = async () => {
  if (!userInput.value.trim() || conversationStore.isLoading) return

  if (!configStore.apiKey) {
    error.value = '请先配置 API 密钥'
    return
  }

  const message = userInput.value.trim()
  userInput.value = ''
  error.value = ''

  const firstMessage = conversationStore.currentMessages.length === 0

  try {
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
  } catch (e: any) {
    error.value = e.message || '发送消息失败'
    console.error('Send message error:', e)
  }

  scrollToBottom()
}

const generateDocument = async () => {
  if (!conversationStore.currentSessionId || isGeneratingDoc.value) return

  isGeneratingDoc.value = true

  try {
    await documentStore.createDocument(
      conversationStore.currentSessionId,
      conversationStore.currentSession?.title || '项目实施计划',
      {
        provider: configStore.provider,
        apiKey: configStore.apiKey,
        baseURL: configStore.baseURL,
        model: configStore.model,
      }
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
</style>
