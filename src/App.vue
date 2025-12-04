<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppShell from './components/layout/AppShell.vue'
import ToastProvider from './components/ui/toast/ToastProvider.vue'
</script>

<template>
  <AppShell>
    <RouterView />
  </AppShell>
  <ToastProvider />
</template>
