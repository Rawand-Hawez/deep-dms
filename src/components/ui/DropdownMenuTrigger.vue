<script setup lang="ts">
import { DropdownMenuTrigger, type DropdownMenuTriggerProps, useForwardProps } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps<DropdownMenuTriggerProps & { class?: string }>()
const forwardedProps = useForwardProps(props)
</script>

<template>
  <DropdownMenuTrigger v-bind="forwardedProps" :class="cn(props.class)">
    <slot />
  </DropdownMenuTrigger>
</template>