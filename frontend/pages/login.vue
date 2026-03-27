<template>
  <div class="min-h-[calc(100vh-120px)] flex items-center justify-center py-8">
    <div class="w-full max-w-md space-y-5">
      <div class="text-center mb-6">
        <div class="w-12 h-12 rounded-xl tech-gradient flex items-center justify-center mx-auto mb-3">
          <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
        </div>
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">登录账号</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">欢迎回到 PlanForge</p>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">邮箱</label>
          <input
            v-model="form.email"
            type="email"
            class="input"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">密码</label>
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              class="input pr-10"
              placeholder="输入密码"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg v-if="showPassword" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">安全验证</label>
          <SliderVerify @verify="handleSliderVerify" />
        </div>

        <div v-if="error" class="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg">
          <span v-if="error.includes('未注册')">
            {{ error }}
            <NuxtLink to="/register" class="font-medium underline">去注册</NuxtLink>
          </span>
          <span v-else>{{ error }}</span>
        </div>

        <div v-if="success" class="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm rounded-lg">
          {{ success }}
        </div>

        <button
          @click="handleLogin"
          :disabled="loading || !isSliderVerified"
          class="w-full btn-primary tech-gradient"
        >
          <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          {{ loading ? '登录中...' : (isSliderVerified ? '登录' : '请完成安全验证') }}
        </button>

        <p class="text-center text-sm text-gray-500 dark:text-gray-400">
          没有账号？
          <NuxtLink to="/register" class="text-indigo-600 dark:text-indigo-400 hover:underline">立即注册</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '~/utils/api'
import SliderVerify from '~/components/SliderVerify.vue'

definePageMeta({
  layout: 'default',
})

const router = useRouter()

const form = ref({
  email: '',
  password: '',
})

const loading = ref(false)
const error = ref('')
const success = ref('')
const showPassword = ref(false)
const isSliderVerified = ref(false)

const handleSliderVerify = () => {
  isSliderVerified.value = true
}

const handleLogin = async () => {
  error.value = ''
  success.value = ''

  if (!isSliderVerified.value) {
    error.value = '请先完成安全验证'
    return
  }

  if (!form.value.email || !form.value.password) {
    error.value = '请填写邮箱和密码'
    return
  }

  loading.value = true
  try {
    const data = await api.auth.login({
      email: form.value.email,
      password: form.value.password,
    })
    success.value = data.message + '，跳转中...'
    setTimeout(() => router.push('/'), 1000)
  } catch (err: any) {
    error.value = err.message
    isSliderVerified.value = false
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.input {
  @apply w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm;
}
.btn-primary {
  @apply flex items-center justify-center gap-2 px-4 py-2.5 text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition;
}
</style>
