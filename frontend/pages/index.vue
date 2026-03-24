<template>
  <div class="h-full flex flex-col">
    <div v-if="!hasApiKey" class="flex-1 flex items-center justify-center px-4">
      <div class="text-center max-w-md">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl tech-gradient flex items-center justify-center">
          <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
          配置您的 AI 提供商
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-4 text-sm">
          要开始使用，请先在设置页面配置您的 AI API 密钥
        </p>
        <NuxtLink
          to="/config"
          class="inline-flex items-center px-5 py-2.5 tech-gradient text-white font-medium rounded-lg hover:opacity-90 transition-all duration-200"
        >
          前往设置
          <svg class="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </NuxtLink>
      </div>
    </div>

    <div v-else class="h-full flex flex-col">
      <div v-if="!conversationStore.hasActiveConversation" class="flex-1 flex items-center justify-center px-4">
        <div class="w-full max-w-2xl">
          <div class="text-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              描述您的需求
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              AI 将帮助您分析和规划项目需求
            </p>
          </div>
          
          <div class="space-y-3">
            <div class="relative">
              <textarea
                v-model="requirementContent"
                rows="4"
                class="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white resize-none transition-all duration-200 text-sm"
                placeholder="请详细描述您的项目需求，例如：我想搭建一个支持多商户入驻的电商平台..."
              ></textarea>
              <div class="absolute bottom-2 right-3 text-xs text-gray-400">
                {{ requirementContent.length }} 字符
              </div>
            </div>
            
            <div
              class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-200 cursor-pointer group"
              @click="triggerFileSelect"
            >
              <input
                ref="fileInput"
                type="file"
                class="hidden"
                accept=".md,.txt,.doc,.docx"
                @change="handleFileSelect"
              />
              <div v-if="selectedFile" class="flex items-center justify-center space-x-2">
                <svg class="h-4 w-4 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span class="text-sm text-gray-700 dark:text-gray-200">{{ selectedFile.name }}</span>
                <button @click.stop="removeFile" class="text-red-600 dark:text-red-400 hover:text-red-500">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div v-else class="text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                <svg class="mx-auto h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p class="text-xs">点击上传文件</p>
              </div>
            </div>

            <button
              @click="startConversation"
              :disabled="isLoading || (!requirementContent.trim() && !selectedFile)"
              class="w-full px-4 py-3 tech-gradient text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-sm"
            >
              <svg v-if="isLoading" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ isLoading ? '启动对话中...' : '开始对话' }}</span>
            </button>
          </div>
        </div>
      </div>

      <div v-else class="h-full flex flex-col">
        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg tech-gradient flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h2 class="text-sm font-semibold text-gray-900 dark:text-white">
                {{ conversationStore.currentConversation?.title }}
              </h2>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ conversationStore.messageCount }} 条消息
              </p>
            </div>
          </div>
          <button
            @click="resetConversation"
            class="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
          >
            新建对话
          </button>
        </div>

        <div ref="chatContainer" class="flex-1 overflow-y-auto chat-scroll p-4 space-y-4">
          <div
            v-for="(msg, index) in conversationStore.currentConversation?.messages"
            :key="index"
            :class="msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'"
          >
            <div v-if="msg.role === 'user'" class="message-bubble message-bubble-user max-w-[80%]">
              <p class="text-sm whitespace-pre-wrap">{{ msg.content }}</p>
            </div>
            
            <div v-else class="max-w-[80%]">
              <div class="flex items-start gap-2">
                <div class="flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                  <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div class="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm p-3">
                  <div class="markdown-content text-sm" v-html="renderMarkdown(msg.content)"></div>
                  <div class="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <button
                      @click="copyToClipboard(msg.content)"
                      class="text-xs text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      复制
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="conversationStore.isLoading && currentAssistantMessage" class="flex justify-start">
            <div class="max-w-[80%]">
              <div class="flex items-start gap-2">
                <div class="flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                  <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div class="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm p-3">
                  <div class="markdown-content text-sm" v-html="renderMarkdown(currentAssistantMessage)"></div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="conversationStore.isLoading && !currentAssistantMessage" class="flex justify-start">
            <div class="max-w-[80%]">
              <div class="flex items-start gap-2">
                <div class="flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                  <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div class="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm p-3">
                  <div class="typing-indicator text-gray-400">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700 p-3 space-y-2 bg-white dark:bg-gray-800">
          <div v-if="conversationStore.messageCount > 0" class="flex gap-2">
            <input
              v-model="userInput"
              type="text"
              placeholder="输入您的回答..."
              class="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white transition-all duration-200 text-sm"
              @keyup.enter="sendMessage"
              :disabled="conversationStore.isLoading"
            />
            <button
              @click="sendMessage"
              :disabled="conversationStore.isLoading || !userInput.trim()"
              class="px-4 py-2 tech-gradient text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>

          <button
            v-if="conversationStore.messageCount > 0"
            @click="generateSolution"
            :disabled="conversationStore.isGeneratingSolution"
            class="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-sm"
          >
            <svg v-if="conversationStore.isGeneratingSolution" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{{ conversationStore.isGeneratingSolution ? '生成方案中...' : '生成完整技术方案' }}</span>
          </button>
        </div>
      </div>

      <div v-if="error" class="fixed bottom-16 left-4 right-4 z-50">
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center gap-2">
          <svg class="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm text-red-800 dark:text-red-300">{{ error }}</p>
          <button @click="error = ''" class="ml-auto text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div v-if="showSuccessToast" class="fixed top-16 right-4 z-50 animate-fade-in">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center gap-2 shadow-lg border border-green-200 dark:border-green-800">
        <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <div>
          <p class="text-sm font-medium text-gray-900 dark:text-white">任务创建成功</p>
          <p class="text-xs text-gray-600 dark:text-gray-400">请到个人中心查看文档</p>
        </div>
        <NuxtLink to="/documents" class="ml-2 px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition-colors">
          查看
        </NuxtLink>
      </div>
    </div>

    <div v-if="isLoading && !conversationStore.hasActiveConversation" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4 text-center">
        <div class="w-12 h-12 mx-auto mb-3 rounded-xl tech-gradient flex items-center justify-center animate-pulse">
          <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <p class="text-base font-medium text-gray-900 dark:text-white mb-1">正在启动对话</p>
        <p class="text-sm text-gray-500 dark:text-gray-400">AI 正在分析您的需求...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  keepalive: true,
})

import { ref, computed, nextTick, onMounted, onActivated } from 'vue'
import { useConfigStore } from '~/stores/config'
import { useDocumentStore } from '~/stores/documents'
import { useConversationStore } from '~/stores/conversation'
import { marked } from 'marked'

const configStore = useConfigStore()
const documentStore = useDocumentStore()
const conversationStore = useConversationStore()
const config = useRuntimeConfig()

const requirementContent = ref('')
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const userInput = ref('')
const isLoading = ref(false)
const error = ref('')
const currentAssistantMessage = ref('')
const showSuccessToast = ref(false)
const chatContainer = ref<HTMLElement | null>(null)

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
    return `<div class="code-block"><div class="code-header"><span class="code-lang">${language}</span><button class="copy-btn" onclick="navigator.clipboard.writeText(this.closest('.code-block').querySelector('code').textContent)">复制代码</button></div><pre><code class="language-${language}">`
  })
  html = html.replace(/<\/code><\/pre>/g, '</code></pre></div>')
  
  return html
}

onMounted(async () => {
  await documentStore.init()
  conversationStore.init()
})

onActivated(() => {
  scrollToBottom()
})

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

const triggerFileSelect = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    selectedFile.value = file
    
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        requirementContent.value = e.target.result as string
      }
    }
    reader.readAsText(file)
  }
}

const removeFile = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  requirementContent.value = ''
}

const startConversation = async () => {
  if (!requirementContent.value.trim()) return

  isLoading.value = true
  error.value = ''

  try {
    const formData = new FormData()
    formData.append('title', '需求对话')
    formData.append('content', requirementContent.value)
    formData.append('type', 'text')

    const response = await $fetch('/requirements', {
      method: 'POST',
      baseURL: config.public.apiBaseUrl,
      headers: {
        'X-API-Provider': configStore.provider,
        'X-API-Key': configStore.apiKey,
        'X-API-BaseURL': configStore.baseURL || '',
        'X-API-Model': configStore.model,
      },
      body: formData,
    })

    conversationStore.startConversation(
      (response as any).id,
      '需求对话',
      requirementContent.value
    )

    await sendInitialMessage()
  } catch (e: any) {
    error.value = e.data?.message || e.message || '启动对话失败'
  } finally {
    isLoading.value = false
  }
}

const sendInitialMessage = async () => {
  if (!conversationStore.currentConversation) return

  conversationStore.setLoading(true)
  currentAssistantMessage.value = ''

  conversationStore.addMessage('user', conversationStore.currentConversation.requirementContent)
  
  conversationStore.addMessage('assistant', '')
  const msgIndex = conversationStore.currentConversation.messages.length - 1
  
  scrollToBottom()

  try {
    const response = await fetch(`${config.public.apiBaseUrl}/sessions/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Provider': configStore.provider,
        'X-API-Key': configStore.apiKey,
        'X-API-BaseURL': configStore.baseURL || '',
        'X-API-Model': configStore.model,
      },
      body: JSON.stringify({
        requirementId: conversationStore.currentConversation.requirementId,
        message: conversationStore.currentConversation.requirementContent,
      }),
    })

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (reader) {
      conversationStore.setActiveStreamReader(reader)
      let fullContent = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))
            if (data.content && !data.done) {
              fullContent += data.content
              conversationStore.currentConversation!.messages[msgIndex].content = fullContent
              conversationStore.saveToStorage()
              scrollToBottom()
            }
          }
        }
      }
      conversationStore.setActiveStreamReader(null)
    }
  } catch (e: any) {
    error.value = e.data?.message || e.message || '发送消息失败'
    conversationStore.currentConversation!.messages.pop()
    conversationStore.saveToStorage()
  } finally {
    conversationStore.setLoading(false)
    currentAssistantMessage.value = ''
  }
}

const copyToClipboard = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content)
  } catch (e: any) {
    console.error('复制失败:', e)
  }
}

const sendMessage = async () => {
  if (!userInput.value.trim() || !conversationStore.currentConversation || conversationStore.isLoading) return

  const message = userInput.value
  userInput.value = ''
  conversationStore.setLoading(true)
  error.value = ''
  currentAssistantMessage.value = ''

  conversationStore.addMessage('user', message)
  conversationStore.addMessage('assistant', '')
  const msgIndex = conversationStore.currentConversation.messages.length - 1
  
  scrollToBottom()

  try {
    const response = await fetch(`${config.public.apiBaseUrl}/sessions/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Provider': configStore.provider,
        'X-API-Key': configStore.apiKey,
        'X-API-BaseURL': configStore.baseURL || '',
        'X-API-Model': configStore.model,
      },
      body: JSON.stringify({
        requirementId: conversationStore.currentConversation.requirementId,
        message: message,
      }),
    })

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (reader) {
      conversationStore.setActiveStreamReader(reader)
      let fullContent = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))
            if (data.content && !data.done) {
              fullContent += data.content
              conversationStore.currentConversation!.messages[msgIndex].content = fullContent
              conversationStore.saveToStorage()
              scrollToBottom()
            }
          }
        }
      }
      conversationStore.setActiveStreamReader(null)
    }
  } catch (e: any) {
    error.value = e.data?.message || e.message || '发送消息失败'
    conversationStore.currentConversation!.messages.pop()
    conversationStore.saveToStorage()
  } finally {
    conversationStore.setLoading(false)
    currentAssistantMessage.value = ''
  }
}

const generateSolution = async () => {
  if (!conversationStore.currentConversation || conversationStore.isGeneratingSolution) return

  conversationStore.setGeneratingSolution(true)
  error.value = ''

  let fullContent = ''

  try {
    const response = await fetch(`${config.public.apiBaseUrl}/sessions/generate-solution`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Provider': configStore.provider,
        'X-API-Key': configStore.apiKey,
        'X-API-BaseURL': configStore.baseURL || '',
        'X-API-Model': configStore.model,
      },
      body: JSON.stringify({
        requirementId: conversationStore.currentConversation.requirementId,
      }),
    })

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))
            if (data.content && !data.done) {
              fullContent += data.content
            }
          }
        }
      }
    }

    if (fullContent) {
      const title = `技术方案_${new Date().toLocaleString('zh-CN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(/\//g, '-')}`
      
      documentStore.addDocument(title, fullContent)
      
      showSuccessToast.value = true
      setTimeout(() => {
        showSuccessToast.value = false
      }, 5000)
    }
  } catch (e: any) {
    error.value = e.data?.message || e.message || '生成方案失败'
  } finally {
    conversationStore.setGeneratingSolution(false)
  }
}

const resetConversation = () => {
  conversationStore.clearConversation()
  userInput.value = ''
  requirementContent.value = ''
  removeFile()
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
