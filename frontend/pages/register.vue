<template>
  <div class="min-h-[calc(100vh-120px)] flex items-center justify-center py-8">
    <div class="w-full max-w-md space-y-5">
      <div class="text-center mb-6">
        <div class="w-12 h-12 rounded-xl tech-gradient flex items-center justify-center mx-auto mb-3">
          <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">创建账号</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">加入 PlanForge</p>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">邮箱</label>
          <input
            v-model="form.email"
            type="email"
            :disabled="step === 'verify'"
            class="input"
            :class="{ 'opacity-50': step === 'verify' }"
            placeholder="your@email.com"
          />
        </div>

        <template v-if="step === 'input'">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">密码</label>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="input pr-10"
                placeholder="至少 6 位"
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
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">确认密码</label>
            <input
              v-model="form.confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              class="input"
              placeholder="再次输入密码"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">安全验证</label>
            <SliderVerify @verify="handleSliderVerify" />
          </div>
        </template>

        <template v-else>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">邮箱验证码</label>
            <div class="flex gap-2">
              <input
                v-model="form.emailCode"
                type="text"
                maxlength="6"
                class="input flex-1"
                placeholder="输入 6 位验证码"
              />
              <button
                @click="resendCode"
                :disabled="countdown > 0"
                class="btn-secondary"
              >
                {{ countdown > 0 ? `${countdown}s` : '重发' }}
              </button>
            </div>
            <p class="mt-1 text-xs text-gray-500">已发送至 {{ form.email }}</p>
          </div>
        </template>

        <div v-if="error" class="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg">
          <span v-if="error.includes('已被注册')">
            {{ error }}
            <NuxtLink to="/login" class="font-medium underline">去登录</NuxtLink>
          </span>
          <span v-else>{{ error }}</span>
        </div>

        <div v-if="success" class="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm rounded-lg">
          {{ success }}
        </div>

        <button
          @click="handleSubmit"
          :disabled="loading || (step === 'input' && !isSliderVerified)"
          class="w-full btn-primary tech-gradient"
        >
          <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          {{ loading ? '处理中...' : (step === 'verify' ? '注册' : (isSliderVerified ? '注册' : '请完成安全验证')) }}
        </button>

        <p class="text-center text-sm text-gray-500 dark:text-gray-400">
          已有账号？
          <NuxtLink to="/login" class="text-indigo-600 dark:text-indigo-400 hover:underline">立即登录</NuxtLink>
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
  confirmPassword: '',
  emailCode: '',
})

const step = ref<'input' | 'verify'>('input')
const countdown = ref(0)
const loading = ref(false)
const error = ref('')
const success = ref('')
const showPassword = ref(false)
const isSliderVerified = ref(false)

const handleSliderVerify = () => {
  isSliderVerified.value = true
}

const handleSubmit = async () => {
  error.value = ''
  success.value = ''

  if (step.value === 'input') {
    if (!isSliderVerified.value) {
      error.value = '请先完成安全验证'
      return
    }

    if (form.value.password !== form.value.confirmPassword) {
      error.value = '两次密码不一致'
      return
    }

    loading.value = true
    try {
      const data = await api.auth.sendRegisterCode({
        email: form.value.email,
        password: form.value.password,
        confirmPassword: form.value.confirmPassword,
      })
      success.value = data.message
      step.value = 'verify'
      startCountdown()
    } catch (err: any) {
      error.value = err.message
      isSliderVerified.value = false
    } finally {
      loading.value = false
    }
  } else {
    loading.value = true
    try {
      const data = await api.auth.verifyRegister({
        email: form.value.email,
        code: form.value.emailCode,
        password: form.value.password,
      })
      success.value = data.message + '，跳转中...'
      setTimeout(() => router.push('/'), 1000)
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
}

const resendCode = async () => {
  if (countdown.value > 0) return
  error.value = ''
  loading.value = true
  try {
    const data = await api.auth.sendRegisterCode({
      email: form.value.email,
      password: form.value.password,
      confirmPassword: form.value.confirmPassword,
    })
    success.value = data.message
    startCountdown()
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const startCountdown = () => {
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) clearInterval(timer)
  }, 1000)
}
</script>

<style scoped>
.input {
  @apply w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm;
}
.btn-primary {
  @apply flex items-center justify-center gap-2 px-4 py-2.5 text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition;
}
.btn-secondary {
  @apply px-3 py-2 text-sm font-medium rounded-lg transition;
  @apply bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed;
  @apply disabled:bg-gray-100 disabled:dark:bg-gray-700 disabled:text-gray-400;
}
</style>
