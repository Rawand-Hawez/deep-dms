<script setup lang="ts">
import { X, CheckCircle, AlertCircle, Info } from 'lucide-vue-next'
import { useToast, type Toast } from '@/composables/useToast'

const props = defineProps<{
  toast: Toast
}>()

const { dismiss } = useToast()

const iconMap = {
  default: Info,
  success: CheckCircle,
  destructive: AlertCircle
}
</script>

<template>
  <div
    class="pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full"
    :class="{
      'border-slate-200 bg-white text-slate-950': !props.toast.variant || props.toast.variant === 'default',
      'border-red-200 bg-red-50 text-red-900': props.toast.variant === 'destructive',
      'border-green-200 bg-green-50 text-green-900': props.toast.variant === 'success',
    }"
  >
    <div class="flex gap-3">
      <component 
        :is="iconMap[props.toast.variant || 'default']" 
        class="h-5 w-5 shrink-0"
        :class="{
          'text-slate-500': !props.toast.variant || props.toast.variant === 'default',
          'text-red-500': props.toast.variant === 'destructive',
          'text-green-500': props.toast.variant === 'success',
        }"
      />
      <div class="grid gap-1">
        <div v-if="props.toast.title" class="text-sm font-semibold">
          {{ props.toast.title }}
        </div>
        <div v-if="props.toast.description" class="text-sm opacity-90">
          {{ props.toast.description }}
        </div>
      </div>
    </div>
    <button
      @click="dismiss(props.toast.id)"
      class="absolute right-2 top-2 rounded-md p-1 text-slate-500 opacity-0 transition-opacity hover:text-slate-900 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-hover:text-slate-900"
      :class="{
        'text-red-500 hover:text-red-900': props.toast.variant === 'destructive',
        'text-green-500 hover:text-green-900': props.toast.variant === 'success',
      }"
    >
      <X class="h-4 w-4" />
    </button>
  </div>
</template>
