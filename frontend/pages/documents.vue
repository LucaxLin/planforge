<template>
  <div class="h-full overflow-y-auto">
    <div class="max-w-4xl mx-auto px-4 py-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            个人中心
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            管理您生成的所有技术文档
          </p>
        </div>
        <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>文档保留24小时，超时自动删除</span>
        </div>
      </div>

      <div v-if="documentStore.documents.length === 0" class="text-center py-20">
        <div class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
          <svg class="w-10 h-10 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          暂无文档
        </h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
          开始对话并生成技术方案后，文档将显示在这里
        </p>
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 px-5 py-2.5 tech-gradient text-white font-medium rounded-lg hover:opacity-90 transition-all duration-200"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          开始创建
        </NuxtLink>
      </div>

      <div v-else class="space-y-1">
        <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pb-3 border-b border-gray-200 dark:border-gray-700">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span>{{ documentStore.documents.length }} 个文档</span>
        </div>

        <div
          v-for="doc in documentStore.documents"
          :key="doc.id"
          class="group flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
          @click="viewDocument(doc)"
        >
          <div class="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" :class="getStatusIconClass(doc.status)">
            <svg v-if="doc.status === 'completed'" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <svg v-else-if="doc.status === 'generating'" class="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else-if="doc.status === 'failed'" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <svg v-else class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <div class="flex-1 min-w-0">
            <h3 class="text-sm font-medium text-gray-900 dark:text-white truncate">
              {{ doc.title }}
            </h3>
            <div class="flex items-center gap-3 mt-0.5">
              <span class="text-xs text-gray-500 dark:text-gray-400">
                {{ formatDate(doc.created_at) }}
              </span>
              <span v-if="doc.status === 'completed'" class="text-xs text-gray-400 dark:text-gray-500">
                {{ getContentSize(doc.content) }}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-xs px-2 py-1 rounded-full" :class="getStatusBadgeClass(doc.status)">
              {{ getStatusText(doc.status) }}
            </span>

            <button
              v-if="doc.status === 'completed'"
              @click.stop="downloadDocument(doc)"
              class="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all duration-200"
              title="下载文档"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>

            <button
              @click.stop="refreshDocument(doc.id)"
              class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-all duration-200"
              title="刷新状态"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            <button
              @click.stop="deleteDocument(doc.id)"
              class="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200"
              title="删除文档"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedDocument" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click="closeDocument">
      <div class="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl" @click.stop>
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center" :class="getStatusIconClass(selectedDocument.status)">
              <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 class="text-sm font-semibold text-gray-900 dark:text-white">
                {{ selectedDocument.title }}
              </h2>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                创建于 {{ formatDate(selectedDocument.created_at) }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs px-2 py-1 rounded-full" :class="getStatusBadgeClass(selectedDocument.status)">
              {{ getStatusText(selectedDocument.status) }}
            </span>
            <button
              v-if="selectedDocument.status === 'completed'"
              @click="downloadDocument(selectedDocument)"
              class="px-3 py-1.5 text-xs tech-gradient text-white rounded-lg hover:opacity-90 transition-all duration-200 flex items-center gap-1.5"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              下载
            </button>
            <button
              @click="closeDocument"
              class="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto chat-scroll p-5">
          <div v-if="selectedDocument.status === 'generating'" class="flex flex-col items-center justify-center py-20">
            <div class="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">文档生成中</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">请稍候，AI 正在生成您的技术方案...</p>
            <button @click="refreshDocument(selectedDocument.id)" class="mt-4 px-4 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors">
              刷新状态
            </button>
          </div>
          <div v-else-if="selectedDocument.status === 'failed'" class="flex flex-col items-center justify-center py-20">
            <div class="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">生成失败</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">文档生成过程中出现错误，请重试</p>
            <button @click="retryDocument(selectedDocument)" class="mt-4 px-4 py-2 text-sm tech-gradient text-white rounded-lg hover:opacity-90 transition-colors">
              重新生成
            </button>
          </div>
          <div v-else-if="selectedDocument.status === 'completed'" class="markdown-content text-sm" v-html="renderMarkdown(selectedDocument.content)"></div>
          <div v-else class="text-center py-20 text-gray-500 dark:text-gray-400">
            等待生成...
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDocumentStore } from '~/stores/documents'
import { useConversationStore } from '~/stores/conversation'
import { marked } from 'marked'

definePageMeta({
  layout: 'default',
})

const documentStore = useDocumentStore()
const conversationStore = useConversationStore()
const selectedDocument = ref<any>(null)

onMounted(async () => {
  await documentStore.loadDocuments()
  setInterval(() => {
    checkGeneratingDocuments()
  }, 5000)
})

const checkGeneratingDocuments = async () => {
  const generating = documentStore.documents.filter(d => d.status === 'generating')
  for (const doc of generating) {
    await documentStore.refreshDocument(doc.id)
  }
}

marked.setOptions({
  breaks: true,
  gfm: true,
})

const renderMarkdown = (content: string | null): string => {
  if (!content) return ''
  return marked.parse(content) as string
}

const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getContentSize = (content: string | null): string => {
  if (!content) return ''
  const bytes = new Blob([content]).size
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const getStatusIconClass = (status: string): string => {
  switch (status) {
    case 'completed': return 'bg-green-500'
    case 'generating': return 'bg-indigo-500'
    case 'failed': return 'bg-red-500'
    default: return 'bg-gray-400'
  }
}

const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'generating': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
    case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
  }
}

const getStatusText = (status: string): string => {
  switch (status) {
    case 'completed': return '已完成'
    case 'generating': return '生成中'
    case 'failed': return '失败'
    default: return '等待中'
  }
}

const viewDocument = (doc: any) => {
  selectedDocument.value = doc
}

const closeDocument = () => {
  selectedDocument.value = null
}

const refreshDocument = async (docId: number) => {
  await documentStore.refreshDocument(docId)
  if (selectedDocument.value?.id === docId) {
    selectedDocument.value = documentStore.documents.find(d => d.id === docId)
  }
}

const retryDocument = async (doc: any) => {
  closeDocument()
  await documentStore.createDocument(doc.session_id, doc.title)
  await documentStore.loadDocuments()
}

const deleteDocument = async (docId: number) => {
  if (confirm('确定要删除这个文档吗？')) {
    await documentStore.deleteDocument(docId)
    if (selectedDocument.value?.id === docId) {
      closeDocument()
    }
  }
}

const downloadDocument = (doc: any) => {
  if (!doc.content) return
  const blob = new Blob([doc.content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${doc.title}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.chat-scroll {
  scroll-behavior: smooth;
}
</style>
