<template>
  <div>
    <NuxtLayout>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">
            AI 智能需求分析
          </h1>
          <p class="mt-4 text-xl text-gray-600 dark:text-gray-300">
            将您的项目想法转化为详细、可执行的实施方案
          </p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div v-if="!hasApiKey" class="text-center py-8">
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

          <div v-else>
            <div class="mb-6">
              <label for="requirement" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                输入您的项目需求
              </label>
              <textarea
                id="requirement"
                v-model="requirementContent"
                rows="8"
                class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="在此描述您的项目需求... (例如：我想搭建一个支持多商户入驻的电商平台)"
              ></textarea>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <label class="flex items-center">
                  <input
                    v-model="requirementTitle"
                    type="text"
                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="项目标题"
                  />
                </label>
              </div>

              <button
                @click="submitRequirement"
                :disabled="isSubmitting || !requirementContent.trim()"
                class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isSubmitting ? '分析中...' : '分析需求' }}
              </button>
            </div>

            <div v-if="error" class="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p class="text-red-800 dark:text-red-300">{{ error }}</p>
            </div>
          </div>
        </div>

        <div v-if="currentRequirement" class="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ currentRequirement.title }}
              </h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                创建于 {{ formatDate(currentRequirement.createdAt) }}
              </p>
            </div>
            <div class="flex space-x-2">
              <button
                @click="generateQuestions"
                :disabled="isGeneratingQuestions"
                class="px-4 py-2 border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 disabled:opacity-50"
              >
                {{ isGeneratingQuestions ? '生成中...' : '生成问题' }}
              </button>
              <button
                @click="generateSolution"
                :disabled="isGeneratingSolution"
                class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {{ isGeneratingSolution ? '生成中...' : '生成方案' }}
              </button>
            </div>
          </div>

          <div v-if="currentRequirement.analysis" class="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
            <h3 class="text-lg font-semibold mb-3 text-gray-900 dark:text-white">分析结果</h3>
            <div class="space-y-4">
              <div>
                <h4 class="font-medium text-gray-700 dark:text-gray-200">关键实体：</h4>
                <div class="flex flex-wrap gap-2 mt-1">
                  <span
                    v-for="entity in currentRequirement.analysis.entities"
                    :key="entity"
                    class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded"
                  >
                    {{ entity }}
                  </span>
                </div>
              </div>
              <div>
                <h4 class="font-medium text-gray-700 dark:text-gray-200">约束条件：</h4>
                <ul class="list-disc list-inside mt-1 text-gray-600 dark:text-gray-300">
                  <li v-for="constraint in currentRequirement.analysis.constraints" :key="constraint">
                    {{ constraint }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useConfigStore } from '~/stores/config'

const configStore = useConfigStore()

const requirementTitle = ref('')
const requirementContent = ref('')
const isSubmitting = ref(false)
const isGeneratingQuestions = ref(false)
const isGeneratingSolution = ref(false)
const error = ref('')
const currentRequirement = ref<any>(null)

const hasApiKey = computed(() => !!configStore.apiKey)

const submitRequirement = async () => {
  if (!requirementContent.value.trim()) return

  isSubmitting.value = true
  error.value = ''

  try {
    const response = await $fetch('/requirements', {
      method: 'POST',
      baseURL: config.public.apiBaseUrl,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Provider': configStore.provider,
        'X-API-Key': configStore.apiKey,
        'X-API-BaseURL': configStore.baseURL || '',
        'X-API-Model': configStore.model,
      },
      body: {
        title: requirementTitle.value || '未命名需求',
        content: requirementContent.value,
        type: 'text',
      },
    })

    currentRequirement.value = response
    requirementTitle.value = ''
    requirementContent.value = ''

    await generateAnalysis(response.id)
  } catch (e: any) {
    error.value = e.message || '提交需求失败'
  } finally {
    isSubmitting.value = false
  }
}

const generateAnalysis = async (id: string) => {
  try {
    const response = await $fetch(`/requirements/${id}/analyze`, {
      method: 'POST',
      baseURL: config.public.apiBaseUrl,
      headers: {
        'X-API-Provider': configStore.provider,
        'X-API-Key': configStore.apiKey,
        'X-API-BaseURL': configStore.baseURL || '',
        'X-API-Model': configStore.model,
      },
    })

    currentRequirement.value = {
      ...currentRequirement.value,
      ...response,
      analysis: (response as any).analysis,
    }
  } catch (e: any) {
    error.value = e.message || '分析需求失败'
  }
}

const generateQuestions = async () => {
  if (!currentRequirement.value) return

  isGeneratingQuestions.value = true
  error.value = ''

  try {
    const response = await $fetch('/generate/questions', {
      method: 'POST',
      baseURL: config.public.apiBaseUrl,
      headers: {
        'X-API-Provider': configStore.provider,
        'X-API-Key': configStore.apiKey,
        'X-API-BaseURL': configStore.baseURL || '',
        'X-API-Model': configStore.model,
      },
      body: {
        requirementId: currentRequirement.value.id,
      },
    })

    console.log('问题已生成：', response)
  } catch (e: any) {
    error.value = e.message || '生成问题失败'
  } finally {
    isGeneratingQuestions.value = false
  }
}

const generateSolution = async () => {
  if (!currentRequirement.value) return

  isGeneratingSolution.value = true
  error.value = ''

  try {
    const response = await $fetch('/generate/solution', {
      method: 'POST',
      baseURL: config.public.apiBaseUrl,
      headers: {
        'X-API-Provider': configStore.provider,
        'X-API-Key': configStore.apiKey,
        'X-API-BaseURL': configStore.baseURL || '',
        'X-API-Model': configStore.model,
      },
      body: {
        requirementId: currentRequirement.value.id,
      },
    })

    console.log('方案已生成：', response)
  } catch (e: any) {
    error.value = e.message || '生成方案失败'
  } finally {
    isGeneratingSolution.value = false
  }
}

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>
