<script setup lang="ts">
import { computed } from 'vue'
import type { DocumentRecord } from '@/stores/documentsStore'
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter,
  Badge,
  Button
} from '@/components/ui'
import { Calendar, ArrowRight } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

const props = defineProps<{
  document: DocumentRecord
}>()

const statusVariant = computed(() => {
  switch (props.document.lifecycleStatus) {
    case 'Published': return 'default' // Primary color (slate-900)
    case 'Approved': return 'secondary'
    case 'Draft': return 'outline'
    case 'Obsolete': return 'destructive'
    default: return 'secondary'
  }
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}
</script>

<template>
  <Card class="h-full flex flex-col hover:shadow-md transition-shadow duration-200 group">
    <CardHeader class="space-y-2 pb-3">
      <div class="flex items-start justify-between gap-2">
        <div class="space-y-1">
          <span class="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
            {{ document.documentCode }}
          </span>
          <Badge :variant="statusVariant" class="ml-2">{{ document.lifecycleStatus }}</Badge>
        </div>
        <div class="text-xs text-slate-400 font-mono">
          Rev {{ document.revision }}
        </div>
      </div>
      <h3 class="font-semibold text-lg leading-tight text-slate-900 group-hover:text-primary transition-colors line-clamp-2">
        {{ document.title }}
      </h3>
    </CardHeader>
    
    <CardContent class="flex-1 pb-3 space-y-4">
      <p class="text-sm text-slate-600 line-clamp-3">
        {{ document.summary }}
      </p>
      
      <div class="flex flex-wrap gap-1">
        <span v-for="keyword in document.keywords.slice(0, 3)" :key="keyword" class="text-xs text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
          #{{ keyword }}
        </span>
        <span v-if="document.keywords.length > 3" class="text-xs text-slate-400 px-1 self-center">
          +{{ document.keywords.length - 3 }}
        </span>
      </div>
    </CardContent>

    <CardFooter class="pt-3 border-t bg-slate-50/50 flex justify-between items-center text-xs text-slate-500">
      <div class="flex items-center gap-2">
        <Calendar class="w-3 h-3" />
        <span>{{ formatDate(document.updatedAt) }}</span>
      </div>
      
      <Button variant="ghost" size="sm" class="h-8 gap-1 hover:bg-white" as-child>
        <RouterLink :to="`/documents/${document.id}`">
          Details
          <ArrowRight class="w-3 h-3" />
        </RouterLink>
      </Button>
    </CardFooter>
  </Card>
</template>
