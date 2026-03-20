<template>
  <div>
    <NuxtLayout>
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
              AI 配置
            </h1>
            <p class="mt-2 text-gray-600 dark:text-gray-300">
              配置您的 AI 提供商设置。您的 API 密钥将存储在本地浏览器中。
            </p>
          </div>

          <form @submit.prevent="saveConfig">
            <div class="space-y-6">
              <div>
                <label for="provider" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  AI 提供商
                </label>
                <select
                  id="provider"
                  v-model="form.provider"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="minimax">MiniMax-CN</option>
                  <option value="zai">智谱（Z.AI）</option>
                  <option value="custom">自定义端点</option>
                </select>
              </div>

              <div>
                <label for="apiKey" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  API 密钥
                </label>
                <input
                  id="apiKey"
                  v-model="form.apiKey"
                  type="password"
                  required
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="输入您的 API 密钥"
                />
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  您的 API 密钥存储在本地，不会发送到我们的服务器。
                </p>
              </div>

              <div v-if="form.provider === 'custom'">
                <label for="baseURL" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  API 基础地址
                </label>
                <input
                  id="baseURL"
                  v-model="form.baseURL"
                  type="url"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="https://api.example.com/v1"
                />
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  您的自定义 API 基础地址
                </p>
              </div>

              <div>
                <label for="model" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  模型
                </label>
                <input
                  id="model"
                  v-model="form.model"
                  type="text"
                  list="model-suggestions"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  :placeholder="getModelPlaceholder()"
                />
                <datalist id="model-suggestions">
                  <option v-for="model in getAvailableModels()" :key="model" :value="model" />
                </datalist>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  可从下拉列表选择，也可直接输入自定义模型名称
                </p>
              </div>

              <div class="pt-4">
                <button
                  type="submit"
                  :disabled="isSaving"
                  class="w-full px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {{ isSaving ? '保存中...' : '保存配置' }}
                </button>
              </div>

              <div v-if="successMessage" class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                <p class="text-green-800 dark:text-green-300">{{ successMessage }}</p>
              </div>

              <div v-if="errorMessage" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p class="text-red-800 dark:text-red-300">{{ errorMessage }}</p>
              </div>
            </div>
          </form>

          <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              提供商信息
            </h2>
            <div class="text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <div v-if="form.provider === 'minimax'">
                <p><strong>MiniMax-CN</strong> - 从 <a href="https://www.minimax.chat/user-center/basic-information/interface-key" target="_blank" class="text-indigo-600 dark:text-indigo-400 hover:underline">MiniMax 开放平台</a> 获取您的 API 密钥</p>
                <p class="mt-2 text-gray-500 dark:text-gray-400">API 基础地址：https://api.minimaxi.com/v1</p>
                <p class="text-gray-500 dark:text-gray-400">推荐模型：MiniMax-M2.7, MiniMax-M2.5</p>
              </div>
              <div v-if="form.provider === 'zai'">
                <p><strong>智谱（Z.AI）</strong> - 从 <a href="https://open.bigmodel.cn/usercenter/apikeys" target="_blank" class="text-indigo-600 dark:text-indigo-400 hover:underline">智谱 AI 开放平台</a> 获取您的 API 密钥</p>
                <p class="mt-2 text-gray-500 dark:text-gray-400">API 基础地址：https://open.bigmodel.cn/api/paas/v4/chat/completions</p>
                <p class="text-gray-500 dark:text-gray-400">推荐模型：GLM-5, GLM-4.7, GLM-4.6</p>
              </div>
              <div v-if="form.provider === 'custom'">
                <p><strong>自定义端点</strong> - 使用您自己的 API 端点（例如：本地 LLM、代理服务器）</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useConfigStore } from '~/stores/config'

const configStore = useConfigStore()

const form = ref({
  provider: 'minimax' as 'minimax' | 'zai' | 'custom',
  apiKey: '',
  baseURL: '',
  model: 'MiniMax-M2.7',
})

const isSaving = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const minimaxModels = ['MiniMax-M2.7', 'MiniMax-M2.5']
const zaiModels = ['GLM-5', 'GLM-4.7', 'GLM-4.6']
const customModels: string[] = []

onMounted(() => {
  form.value = {
    provider: configStore.provider as any,
    apiKey: configStore.apiKey,
    baseURL: configStore.baseURL || '',
    model: configStore.model,
  }
})

const getAvailableModels = () => {
  switch (form.value.provider) {
    case 'minimax':
      return minimaxModels
    case 'zai':
      return zaiModels
    case 'custom':
      return customModels
    default:
      return []
  }
}

const getModelPlaceholder = () => {
  if (form.value.provider === 'minimax') {
    return '输入或选择 MiniMax 模型'
  } else if (form.value.provider === 'zai') {
    return '输入或选择智谱模型'
  } else {
    return '输入自定义模型名称'
  }
}

const saveConfig = async () => {
  isSaving.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    let baseURL = ''
    if (form.value.provider === 'minimax') {
      baseURL = 'https://api.minimaxi.com/v1'
    } else if (form.value.provider === 'zai') {
      baseURL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
    } else if (form.value.provider === 'custom') {
      baseURL = form.value.baseURL
    }

    configStore.setConfig({
      provider: form.value.provider,
      apiKey: form.value.apiKey,
      baseURL: baseURL || undefined,
      model: form.value.model,
    })

    successMessage.value = '配置保存成功！'
  } catch (e: any) {
    errorMessage.value = e.message || '保存配置失败'
  } finally {
    isSaving.value = false
  }
}
</script>
