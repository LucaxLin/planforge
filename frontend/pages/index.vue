<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-y-auto">
    <NuxtLayout>
      <div class="px-2 sm:px-4 py-6 max-w-6xl mx-auto">
        <div class="text-center mb-4 flex-shrink-0">
          <h1 class="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
            AI 智能需求分析
          </h1>
          <p class="mt-2 text-base sm:text-xl text-gray-600 dark:text-gray-300">
            通过问答对话，精准理解您的需求
          </p>
        </div>

        <div v-if="!hasApiKey" class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 text-center flex-1 flex flex-col justify-center">
          <div class="mb-6">
            <svg class="mx-auto h-16 w-16 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            配置您的 AI 提供商
          </h2>
          <p class="text-gray-600 dark:text-gray-300 mb-6">
            要开始使用，请先在设置页面配置您的 AI API 密钥
          </p>
          <NuxtLink
            to="/config"
            class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            前往设置
          </NuxtLink>
        </div>

        <div v-else class="space-y-4">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
            <div v-if="!currentRequirement">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                描述您的需求
              </h2>
              <textarea
                v-model="requirementContent"
                rows="5"
                class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white mb-4 resize-none"
                placeholder="请详细描述您的项目需求，例如：我想搭建一个支持多商户入驻的电商平台..."
              ></textarea>
              
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  或上传文档
                </label>
                <div
                  class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors cursor-pointer"
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
                    <svg class="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span class="text-sm text-gray-700 dark:text-gray-200">{{ selectedFile.name }}</span>
                    <button @click.stop="removeFile" class="text-red-600 dark:text-red-400 hover:text-red-500">
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div v-else>
                    <svg class="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">点击上传文件或拖拽到此处</p>
                    <p class="text-xs text-gray-500 dark:text-gray-500">支持 .md, .txt, .doc, .docx 格式</p>
                  </div>
                </div>
              </div>

              <button
                @click="startConversation"
                :disabled="isLoading || (!requirementContent.trim() && !selectedFile)"
                class="w-full px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
              >
                <span v-if="isLoading" class="flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  启动对话中...
                </span>
                <span v-else>开始对话</span>
              </button>
            </div>

            <div v-else>
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                  {{ currentRequirement.title }}
                </h2>
                <button
                  @click="resetConversation"
                  class="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  新建对话
                </button>
              </div>

              <div class="max-h-[60vh] overflow-y-auto chat-scroll mb-4 space-y-3">
                <div
                  v-for="(msg, index) in messages"
                  :key="index"
                  :class="msg.role === 'user' ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'bg-gray-50 dark:bg-gray-700'"
                  class="p-4 rounded-lg w-full group relative"
                >
                  <button
                    @click="copyToClipboard(msg.content)"
                    class="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="复制内容"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <div class="flex items-start space-x-3">
                    <div class="flex-shrink-0">
                      <div v-if="msg.role === 'user'" class="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                        <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div v-else class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                        <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                    </div>
                    <div class="flex-1 min-w-0 text-left">
                      <p class="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        {{ msg.role === 'user' ? '您' : 'AI 助手' }}
                      </p>
                      <div class="text-gray-700 dark:text-gray-200 text-sm markdown-content text-left" v-html="renderMarkdown(msg.content)"></div>
                    </div>
                  </div>
                </div>

                <div v-if="isLoading && currentAssistantMessage" class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg w-full group relative">
                  <button
                    @click="copyToClipboard(currentAssistantMessage)"
                    class="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="复制内容"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <div class="flex items-start space-x-3">
                    <div class="flex-shrink-0">
                      <div class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                        <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                    </div>
                    <div class="flex-1 min-w-0 text-left">
                      <p class="text-sm font-medium text-gray-900 dark:text-white mb-1">AI 助手</p>
                      <div class="text-gray-700 dark:text-gray-200 text-sm markdown-content text-left" v-html="renderMarkdown(currentAssistantMessage)"></div>
                    </div>
                  </div>
                </div>

                <div v-if="isLoading && !currentAssistantMessage" class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <svg class="animate-spin h-5 w-5 text-indigo-600 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span class="text-gray-600 dark:text-gray-300">AI 正在思考...</span>
                  </div>
                </div>
              </div>

              <div v-if="!isLoading && messages.length > 0" class="flex space-x-3 flex-shrink-0">
                <input
                  v-model="userInput"
                  type="text"
                  placeholder="输入您的回答..."
                  class="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  @keyup.enter="sendMessage"
                  :disabled="isLoading"
                />
                <button
                  @click="sendMessage"
                  :disabled="isLoading || !userInput.trim()"
                  class="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  发送
                </button>
              </div>

              <div v-if="messages.length > 0" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                <button
                  @click="generateSolution"
                  :disabled="isGeneratingSolution"
                  class="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <span v-if="isGeneratingSolution" class="flex items-center justify-center">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    生成方案中...
                  </span>
                  <span v-else>生成完整技术方案</span>
                </button>
              </div>
            </div>
          </div>

          <div v-if="isGeneratingSolution && generatingContent" class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 max-h-96 overflow-y-auto chat-scroll">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">正在生成技术方案...</h3>
              <span class="text-sm text-gray-500 dark:text-gray-400">{{ generatingContent.length }} 字符</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
              <div class="bg-indigo-600 h-2 rounded-full transition-all duration-300" :style="{ width: '100%' }"></div>
            </div>
            <div class="markdown-content text-sm text-left" v-html="renderMarkdown(generatingContent)"></div>
          </div>

          <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex-shrink-0">
            <div class="flex">
              <svg class="h-5 w-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="ml-3 text-red-800 dark:text-red-300">{{ error }}</p>
            </div>
          </div>
        </div>
      </div>
    </NuxtLayout>

    <div v-if="isLoading && !currentRequirement" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md mx-4">
        <div class="flex flex-col items-center">
          <svg class="animate-spin h-12 w-12 text-indigo-600 dark:text-indigo-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-lg font-medium text-gray-900 dark:text-white mb-2">正在启动对话</p>
          <p class="text-sm text-gray-500 dark:text-gray-400 text-center">AI 正在分析您的需求...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.chat-scroll::-webkit-scrollbar {
  width: 6px;
}

.chat-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.chat-scroll::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 3px;
}

.dark .chat-scroll::-webkit-scrollbar-thumb {
  background-color: #4b5563;
}

.chat-scroll::-webkit-scrollbar-thumb:hover {
  background-color: #9ca3af;
}

.dark .chat-scroll::-webkit-scrollbar-thumb:hover {
  background-color: #6b7280;
}

.markdown-content h1 { font-size: 1.5rem; font-weight: bold; margin: 1rem 0 0.5rem 0; }
.markdown-content h2 { font-size: 1.25rem; font-weight: bold; margin: 0.875rem 0 0.5rem 0; }
.markdown-content h3 { font-size: 1.125rem; font-weight: bold; margin: 0.75rem 0 0.5rem 0; }
.markdown-content p { margin: 0.5rem 0; line-height: 1.6; }
.markdown-content ul { list-style-type: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
.markdown-content ol { list-style-type: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
.markdown-content li { margin: 0.25rem 0; }
.markdown-content code { 
  background-color: #f3f4f6; 
  padding: 0.125rem 0.25rem; 
  border-radius: 0.25rem; 
  font-size: 0.875rem;
}
.dark .markdown-content code {
  background-color: #374151;
}
.markdown-content pre { 
  background-color: #f3f4f6; 
  padding: 1rem; 
  border-radius: 0.5rem; 
  overflow-x: auto;
  margin: 0.75rem 0;
}
.dark .markdown-content pre {
  background-color: #1f2937;
}
.markdown-content strong { font-weight: bold; }
.markdown-content em { font-style: italic; }
.markdown-content blockquote {
  border-left: 4px solid #d1d5db;
  padding-left: 1rem;
  margin: 0.75rem 0;
  color: #6b7280;
}
.markdown-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 1rem 0;
}
.markdown-content th, .markdown-content td {
  border: 1px solid #d1d5db;
  padding: 0.5rem 1rem;
  text-align: left;
}
.dark .markdown-content th, .dark .markdown-content td {
  border-color: #4b5563;
}
.markdown-content th {
  background-color: #f3f4f6;
  font-weight: bold;
}
.dark .markdown-content th {
  background-color: #374151;
}
.markdown-content tr:nth-child(even) {
  background-color: #f9fafb;
}
.dark .markdown-content tr:nth-child(even) {
  background-color: #1f2937;
}
</style>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useConfigStore } from '~/stores/config'

const configStore = useConfigStore()
const config = useRuntimeConfig()

const requirementContent = ref('')
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const currentRequirement = ref<any>(null)
const messages = ref<any[]>([])
const userInput = ref('')
const isLoading = ref(false)
const isGeneratingSolution = ref(false)
const generatingContent = ref('')
const error = ref('')
const currentAssistantMessage = ref('')

const hasApiKey = computed(() => !!configStore.apiKey)

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

import { marked } from 'marked'

marked.setOptions({
  breaks: true,
  gfm: true,
})

const renderMarkdown = (content: string): string => {
  if (!content) return ''
  
  let html = marked.parse(content) as string
  
  html = html
    .replace(/①/g, '<span class="text-indigo-600 dark:text-indigo-400 font-bold">①</span>')
    .replace(/②/g, '<span class="text-indigo-600 dark:text-indigo-400 font-bold">②</span>')
    .replace(/③/g, '<span class="text-indigo-600 dark:text-indigo-400 font-bold">③</span>')
    .replace(/④/g, '<span class="text-indigo-600 dark:text-indigo-400 font-bold">④</span>')
    .replace(/⑤/g, '<span class="text-indigo-600 dark:text-indigo-400 font-bold">⑤</span>')
  
  return html
}

const scrollToBottom = () => {
  nextTick(() => {
    const container = document.querySelector('.chat-scroll')
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  })
}

const startConversation = async () => {
  if (!requirementContent.value.trim()) return

  isLoading.value = true
  error.value = ''
  messages.value = []

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

    currentRequirement.value = response

    await sendInitialMessage()
  } catch (e: any) {
    error.value = e.data?.message || e.message || '启动对话失败'
  } finally {
    isLoading.value = false
  }
}

const sendInitialMessage = async () => {
  if (!currentRequirement.value) return

  isLoading.value = true
  currentAssistantMessage.value = ''

  messages.value.push({
    role: 'user',
    content: requirementContent.value,
  })

  const assistantMsgIndex = messages.value.length
  messages.value.push({
    role: 'assistant',
    content: '',
  })
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
        requirementId: currentRequirement.value.id,
        message: requirementContent.value,
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
              messages.value[assistantMsgIndex].content += data.content
              scrollToBottom()
            }
          }
        }
      }
    }
  } catch (e: any) {
    error.value = e.data?.message || e.message || '发送消息失败'
    messages.value.splice(assistantMsgIndex, 1)
  } finally {
    isLoading.value = false
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
  if (!userInput.value.trim() || !currentRequirement.value || isLoading.value) return

  const message = userInput.value
  userInput.value = ''
  isLoading.value = true
  error.value = ''
  currentAssistantMessage.value = ''

  messages.value.push({
    role: 'user',
    content: message,
  })

  const assistantMsgIndex = messages.value.length
  messages.value.push({
    role: 'assistant',
    content: '',
  })
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
        requirementId: currentRequirement.value.id,
        message: message,
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
              messages.value[assistantMsgIndex].content += data.content
              scrollToBottom()
            }
          }
        }
      }
    }
  } catch (e: any) {
    error.value = e.data?.message || e.message || '发送消息失败'
    messages.value.splice(assistantMsgIndex, 1)
  } finally {
    isLoading.value = false
    currentAssistantMessage.value = ''
  }
}

const generateSolution = async () => {
  if (!currentRequirement.value || isGeneratingSolution.value) return

  isGeneratingSolution.value = true
  generatingContent.value = ''
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
        requirementId: currentRequirement.value.id,
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
              generatingContent.value = fullContent
            }
          }
        }
      }
    }

    if (fullContent) {
      const blob = new Blob([fullContent], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `需求方案_${new Date().toISOString().slice(0, 10)}.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  } catch (e: any) {
    error.value = e.data?.message || e.message || '生成方案失败'
  } finally {
    isGeneratingSolution.value = false
    setTimeout(() => {
      generatingContent.value = ''
    }, 2000)
  }
}

const resetConversation = () => {
  currentRequirement.value = null
  messages.value = []
  userInput.value = ''
  requirementContent.value = ''
  generatingContent.value = ''
  removeFile()
}
</script>
