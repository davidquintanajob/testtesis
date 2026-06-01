<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div :class="[
      'bg-white rounded-lg shadow-lg w-full max-h-[90vh] overflow-hidden',
      sizeClasses[size]
    ]">
      <!-- Header -->
      <div v-if="$slots.title" class="flex justify-between items-center p-6 border-b border-gray-200">
        <div class="text-lg font-semibold text-gray-900">
          <slot name="title"></slot>
        </div>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
        <slot name="content"></slot>
      </div>

      <!-- Footer -->
      <div v-if="$slots.footer" class="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

defineProps({
  show: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'].includes(value)
  }
});

defineEmits(['close']);

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-5xl',
  '3xl': 'max-w-6xl',
  '4xl': 'max-w-7xl',
  '5xl': 'max-w-screen-2xl'
};
</script>
