<template>
  <div class="w-full">
    <div
      ref="containerRef"
      class="relative w-full h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden select-none"
      :class="{ 'cursor-not-allowed opacity-50': disabled }"
    >
      <div
        class="absolute inset-0 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400"
      >
        <span v-if="!isVerified">请向右滑动完成验证</span>
        <span v-else class="text-green-600 dark:text-green-400">验证成功 ✓</span>
      </div>

      <div
        ref="thumbRef"
        class="absolute top-0 left-0 w-12 h-12 flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform duration-100"
        :class="[
          isVerified ? 'bg-green-500' : 'bg-indigo-600',
          disabled ? 'cursor-not-allowed' : ''
        ]"
        :style="{ transform: `translateX(${offset}px)` }"
        @mousedown="onMouseDown"
        @touchstart="onTouchStart"
      >
        <svg
          v-if="!isVerified"
          class="w-5 h-5 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
        <svg
          v-else
          class="w-5 h-5 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <div
        class="absolute top-0 left-0 h-full bg-indigo-200 dark:bg-indigo-900 transition-all duration-100"
        :style="{ width: `${Math.max(0, offset)}px` }"
        :class="{ 'bg-green-200 dark:bg-green-900': isVerified }"
      />
    </div>

    <p v-if="error" class="mt-2 text-sm text-red-600 dark:text-red-400">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

interface Props {
  disabled?: boolean
  successThreshold?: number
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  successThreshold: 0.5,
})

const emit = defineEmits<{
  (e: 'verify'): void
  (e: 'reset'): void
}>()

const containerRef = ref<HTMLElement | null>(null)
const isVerified = ref(false)
const error = ref('')
const isDragging = ref(false)
const currentOffset = ref(0)

let startX = 0

const maxOffset = computed(() => {
  if (!containerRef.value) return 0
  return containerRef.value.offsetWidth - 48
})

const offset = computed(() => {
  if (isVerified.value) return maxOffset.value
  return Math.min(currentOffset.value, maxOffset.value)
})

const onMouseDown = (e: MouseEvent) => {
  if (props.disabled || isVerified.value) return
  isDragging.value = true
  startX = e.clientX
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

const onMouseMove = (e: MouseEvent) => {
  if (!isDragging.value || isVerified.value) return

  const deltaX = e.clientX - startX
  const newOffset = Math.max(0, Math.min(deltaX, maxOffset.value))
  currentOffset.value = newOffset

  const threshold = maxOffset.value * props.successThreshold
  if (newOffset >= threshold) {
    isVerified.value = true
    currentOffset.value = maxOffset.value
    emit('verify')
    cleanup()
  }
}

const onMouseUp = () => {
  if (!isVerified.value) {
    currentOffset.value = 0
  }
  cleanup()
}

const onTouchStart = (e: TouchEvent) => {
  if (props.disabled || isVerified.value) return
  isDragging.value = true
  startX = e.touches[0].clientX
  document.addEventListener('touchmove', onTouchMove)
  document.addEventListener('touchend', onTouchEnd)
}

const onTouchMove = (e: TouchEvent) => {
  if (!isDragging.value || isVerified.value) return

  const deltaX = e.touches[0].clientX - startX
  const newOffset = Math.max(0, Math.min(deltaX, maxOffset.value))
  currentOffset.value = newOffset

  const threshold = maxOffset.value * props.successThreshold
  if (newOffset >= threshold) {
    isVerified.value = true
    currentOffset.value = maxOffset.value
    emit('verify')
    cleanupTouch()
  }
}

const onTouchEnd = () => {
  if (!isVerified.value) {
    currentOffset.value = 0
  }
  cleanupTouch()
}

const cleanup = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
}

const cleanupTouch = () => {
  isDragging.value = false
  document.removeEventListener('touchmove', onTouchMove)
  document.removeEventListener('touchend', onTouchEnd)
}

const reset = () => {
  isVerified.value = false
  currentOffset.value = 0
  error.value = ''
  emit('reset')
}

watch(() => props.disabled, (newVal) => {
  if (newVal) {
    reset()
  }
})

defineExpose({
  reset,
  isVerified: () => isVerified.value,
})

onMounted(() => {
  currentOffset.value = 0
})

onBeforeUnmount(() => {
  cleanup()
  cleanupTouch()
})
</script>

<style scoped>
.cursor-grab {
  cursor: grab;
}

.cursor-grabbing {
  cursor: grabbing;
}
</style>
