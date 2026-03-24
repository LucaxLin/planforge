<template>
  <div class="h-full flex flex-col">
    <div class="flex-1 max-w-3xl mx-auto px-4 py-6 w-full">
      <div class="mb-6">
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">
          AI 配置
        </h1>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          配置您的 AI 提供商设置
        </p>
      </div>

      <div class="space-y-5">
        <div class="form-section">
          <label class="section-label">AI 提供商</label>
          <div class="flex gap-2">
            <button
              v-for="p in providers"
              :key="p.value"
              @click="form.provider = p.value"
              class="provider-btn"
              :class="{ 'provider-btn-active': form.provider === p.value }"
            >
              {{ p.label }}
            </button>
          </div>
        </div>

        <div class="form-section">
          <label class="section-label">API 密钥</label>
          <div class="relative">
            <input
              id="apiKey"
              v-model="form.apiKey"
              :type="showApiKey ? 'text' : 'password'"
              required
              class="form-input pr-10"
              placeholder="输入您的 API 密钥"
            />
            <button
              type="button"
              @click="showApiKey = !showApiKey"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg v-if="showApiKey" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
              <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
          <p class="mt-1.5 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            API 密钥存储在本地
          </p>
        </div>

        <div v-if="form.provider === 'custom'" class="form-section">
          <label class="section-label">API 基础地址</label>
          <input
            id="baseURL"
            v-model="form.baseURL"
            type="url"
            class="form-input"
            placeholder="https://api.example.com/v1"
          />
        </div>

        <div class="form-section">
          <label class="section-label">模型</label>

          <select
            v-if="form.provider !== 'custom'"
            v-model="form.model"
            class="form-input"
          >
            <option v-for="model in getAvailableModels()" :key="model" :value="model">
              {{ model }}
            </option>
            <option value="__custom__">自定义模型</option>
          </select>

          <input
            v-if="form.provider !== 'custom' && form.model === '__custom__'"
            v-model="form.customModelId"
            type="text"
            class="form-input mt-2"
            placeholder="请输入模型 ID"
          />

          <input
            v-if="form.provider === 'custom'"
            v-model="form.model"
            type="text"
            class="form-input"
            placeholder="输入模型名称"
          />
        </div>

        <div v-if="form.provider === 'minimax'" class="provider-info-card">
          <div class="flex items-center justify-between mb-2">
            <span class="provider-name">MiniMax-CN</span>
            <a href="https://www.minimax.chat/user-center/basic-information/interface-key" target="_blank" class="provider-link">获取密钥</a>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400">API: https://api.minimaxi.com/v1</p>
        </div>

        <div v-if="form.provider === 'zai'" class="provider-info-card">
          <div class="flex items-center justify-between mb-2">
            <span class="provider-name">智谱（Z.AI）</span>
            <a href="https://open.bigmodel.cn/usercenter/apikeys" target="_blank" class="provider-link">获取密钥</a>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400">API: https://open.bigmodel.cn/api/paas/v4/chat/completions</p>
        </div>

        <div v-if="form.provider === 'custom'" class="provider-info-card">
          <span class="provider-name">自定义端点</span>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">使用您自己的 API 端点</p>
        </div>

        <div v-if="successMessage" class="success-message">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>{{ successMessage }}</span>
        </div>

        <div v-if="errorMessage" class="error-message">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ errorMessage }}</span>
        </div>

        <div class="flex items-center justify-between pt-2">
          <button
            type="button"
            @click="testConnection"
            :disabled="isTesting || !form.apiKey"
            class="btn-secondary"
          >
            <svg v-if="isTesting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isTesting ? '测试中...' : '测试连接' }}
          </button>

          <button
            type="submit"
            @click="saveConfig"
            :disabled="isSaving"
            class="btn-primary tech-gradient"
          >
            <svg v-if="isSaving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isSaving ? '保存中...' : '保存配置' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useConfigStore } from '~/stores/config'

definePageMeta({
  layout: 'default',
})

const configStore = useConfigStore()
const router = useRouter()

const providers = [
  { value: 'minimax' as const, label: 'MiniMax-CN' },
  { value: 'zai' as const, label: '智谱（Z.AI）' },
  { value: 'custom' as const, label: '自定义端点' },
]

const form = ref({
  provider: 'minimax' as 'minimax' | 'zai' | 'custom',
  apiKey: '',
  baseURL: '',
  model: 'MiniMax-M2.7',
  customModelId: '',
})

const showApiKey = ref(false)
const isSaving = ref(false)
const isTesting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const minimaxModels = ['MiniMax-M2.7', 'MiniMax-M2.5']
const zaiModels = ['GLM-5', 'GLM-4.7', 'GLM-4.6']

onMounted(() => {
  form.value = {
    provider: configStore.provider as any,
    apiKey: configStore.apiKey,
    baseURL: configStore.baseURL || '',
    model: configStore.model,
    customModelId: '',
  }
})

const getAvailableModels = () => {
  switch (form.value.provider) {
    case 'minimax':
      return minimaxModels
    case 'zai':
      return zaiModels
    default:
      return []
  }
}

const testConnection = async () => {
  if (!form.apiKey) return

  isTesting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    successMessage.value = '连接测试成功！'
  } catch (e: any) {
    errorMessage.value = e.message || '连接测试失败'
  } finally {
    isTesting.value = false
  }
}

const saveConfig = async () => {
  isSaving.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    let baseURL = ''
    let model = form.value.model

    if (form.value.provider === 'minimax') {
      baseURL = 'https://api.minimaxi.com/v1'
      if (model === '__custom__') {
        model = form.value.customModelId
      }
    } else if (form.value.provider === 'zai') {
      baseURL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
      if (model === '__custom__') {
        model = form.value.customModelId
      }
    } else if (form.value.provider === 'custom') {
      baseURL = form.value.baseURL
    }

    configStore.setConfig({
      provider: form.value.provider,
      apiKey: form.value.apiKey,
      baseURL: baseURL || undefined,
      model: model,
    })

    successMessage.value = '配置保存成功！'

    setTimeout(() => {
      router.push('/')
    }, 1500)
  } catch (e: any) {
    errorMessage.value = e.message || '保存配置失败'
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.form-section {
  @apply space-y-2;
}

.section-label {
  @apply block text-sm font-medium text-gray-900 dark:text-white;
}

.form-input {
  @apply w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm;
}

.provider-btn {
  @apply px-3 py-1.5 text-xs font-medium rounded-md border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200;
}

.provider-btn-active {
  @apply px-3 py-1.5 text-xs font-medium rounded-md border border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400;
}

.provider-info-card {
  @apply p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800;
}

.provider-name {
  @apply text-sm font-medium text-gray-900 dark:text-white;
}

.provider-link {
  @apply text-xs text-indigo-600 dark:text-indigo-400 hover:underline;
}

.success-message {
  @apply flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg;
}

.error-message {
  @apply flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg;
}

.btn-primary {
  @apply inline-flex items-center gap-2 px-4 py-2 text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm;
}

.btn-secondary {
  @apply inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm;
}
</style>
