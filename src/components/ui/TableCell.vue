<script setup lang="ts">
import { type HTMLAttributes } from 'vue'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <td :class="['p-4 align-middle [&:has([role=checkbox])]:pr-0', props.class]">
    <slot />
  </td>
</template>
