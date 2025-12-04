<script setup lang="ts">
import { type HTMLAttributes } from 'vue'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <thead :class="['[&_tr]:border-b', props.class]">
    <slot />
  </thead>
</template>
