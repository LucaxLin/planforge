<template>
  <div class="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <div class="particle-bg">
      <div v-for="i in 20" :key="i" class="particle" :style="getParticleStyle(i)"></div>
    </div>
    
    <header class="relative z-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="flex justify-between items-center h-14">
          <div class="flex items-center space-x-3">
            <div class="w-9 h-9 rounded-lg tech-gradient flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <NuxtLink to="/" class="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              PlanForge
            </NuxtLink>
          </div>
          
          <div class="hidden md:flex items-center space-x-1">
            <NuxtLink 
              to="/" 
              class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              :class="$route.path === '/' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'"
            >
              首页
            </NuxtLink>
            <NuxtLink 
              to="/documents" 
              class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              :class="$route.path === '/documents' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'"
            >
              个人中心
            </NuxtLink>
            <NuxtLink 
              to="/config" 
              class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              :class="$route.path === '/config' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'"
            >
              设置
            </NuxtLink>
          </div>
          
          <div class="flex items-center space-x-2">
            <button
              @click="toggleTheme"
              class="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
              :title="themeStore.isDark ? '切换到亮色模式' : '切换到暗色模式'"
            >
              <svg v-if="themeStore.isDark" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
            
            <button
              @click="showMobileMenu = !showMobileMenu"
              class="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
            >
              <svg v-if="!showMobileMenu" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div v-if="showMobileMenu" class="md:hidden pb-3 space-y-1">
          <NuxtLink 
            to="/" 
            @click="showMobileMenu = false"
            class="block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            :class="$route.path === '/' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'"
          >
            首页
          </NuxtLink>
          <NuxtLink 
            to="/documents" 
            @click="showMobileMenu = false"
            class="block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            :class="$route.path === '/documents' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'"
          >
            个人中心
          </NuxtLink>
          <NuxtLink 
            to="/config" 
            @click="showMobileMenu = false"
            class="block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            :class="$route.path === '/config' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'"
          >
            设置
          </NuxtLink>
        </div>
      </div>
    </header>

    <main class="flex-1 relative z-10 overflow-hidden">
      <slot />
    </main>

    <footer class="relative z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-2">
        <div class="flex items-center justify-between">
          <p class="text-xs text-gray-500 dark:text-gray-400">
            © 2026 PlanForge
          </p>
          <div class="flex items-center space-x-2">
            <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            <span class="text-xs text-gray-500 dark:text-gray-400">系统运行正常</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useThemeStore } from '~/stores/theme'

const themeStore = useThemeStore()
const showMobileMenu = ref(false)

const toggleTheme = () => {
  themeStore.toggle()
}

const getParticleStyle = (index: number) => {
  const seedBasedRandom = (seed: number, min: number, max: number) => {
    const x = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453
    return min + (x - Math.floor(x)) * (max - min)
  }
  
  const left = seedBasedRandom(index, 5, 95)
  const delay = seedBasedRandom(index + 1, 0, 15)
  const size = seedBasedRandom(index + 2, 2, 6)
  const duration = seedBasedRandom(index + 3, 15, 25)
  
  return {
    left: `${left}%`,
    bottom: '-10px',
    width: `${size}px`,
    height: `${size}px`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
  }
}
</script>
