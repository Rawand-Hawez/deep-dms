<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const documentId = route.params.id
</script>

<template>
  <div class="container py-10 max-w-[1600px] mx-auto space-y-6">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Document Details</h1>
      <p class="text-muted-foreground">
        Viewing document: {{ documentId }}
      </p>
    </div>

    <div class="rounded-lg border bg-card p-8 text-center">
      <p class="text-muted-foreground">Document details will be implemented here</p>
    </div>
  </div>
</template>
