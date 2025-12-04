<script setup lang="ts">
import { ref, watch } from 'vue'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button
} from '@/components/ui'
import { X } from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'update:filters', filters: any): void
}>()

const filters = ref({
  types: [] as string[],
  departments: [] as string[]
})

const documentTypes = [
  'Procedure', 'Standard', 'SOP', 'Policy', 'Manual', 'Form', 'WorkInstruction'
]

const departments = [
  'QMS', 'Production', 'Maintenance', 'IT', 'HR', 'Safety', 'Environmental'
]

watch(filters, (newVal) => {
  emit('update:filters', newVal)
}, { deep: true })

const clearFilters = () => {
  filters.value = {
    types: [],
    departments: []
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="font-semibold text-lg text-slate-900">Filters</h3>
      <Button 
        variant="ghost" 
        size="sm" 
        class="h-8 px-2 text-slate-500 hover:text-destructive"
        @click="clearFilters"
        v-if="filters.types.length || filters.departments.length"
      >
        <X class="w-3 h-3 mr-1" />
        Clear
      </Button>
    </div>

    <!-- Document Type -->
    <Card>
      <CardHeader class="pb-3 pt-4 px-4">
        <CardTitle class="text-sm font-medium text-slate-700">Document Type</CardTitle>
      </CardHeader>
      <CardContent class="pb-4 px-4">
        <div class="space-y-2">
          <label v-for="type in documentTypes" :key="type" class="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              :value="type" 
              v-model="filters.types"
              class="rounded border-slate-300 text-primary focus:ring-primary/20 w-4 h-4"
            >
            <span class="text-sm text-slate-600 group-hover:text-slate-900">{{ type }}</span>
          </label>
        </div>
      </CardContent>
    </Card>

    <!-- Department -->
    <Card>
      <CardHeader class="pb-3 pt-4 px-4">
        <CardTitle class="text-sm font-medium text-slate-700">Department</CardTitle>
      </CardHeader>
      <CardContent class="pb-4 px-4">
        <div class="space-y-2">
          <label v-for="dept in departments" :key="dept" class="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              :value="dept" 
              v-model="filters.departments"
              class="rounded border-slate-300 text-primary focus:ring-primary/20 w-4 h-4"
            >
            <span class="text-sm text-slate-600 group-hover:text-slate-900">{{ dept }}</span>
          </label>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
