<script setup lang="ts">
import TopNav from './TopNav.vue'
</script>

<template>
  <div class="min-h-screen bg-background">
    <TopNav />
    <main class="container mx-auto px-6 py-8">
      <slot />
    </main>
  </div>
</template>
