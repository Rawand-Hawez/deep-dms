<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  SimpleDialog,
  Input,
  Button,
  CardHeader, CardTitle, Badge
} from '@/components/ui'
import { Search, Loader2, FileText } from 'lucide-vue-next'
import { useDocumentsApi } from '@/composables/useDocumentsApi'
import type { DocumentRecord } from '@/stores/documentsStore'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const router = useRouter()
const searchQuery = ref('')
const searchResults = ref<DocumentRecord[]>([])
const isLoadingSearch = ref(false)
const searchError = ref<string | null>(null)

const { getDocuments } = useDocumentsApi()

watch(() => props.open, (newVal) => {
  if (newVal) {
    searchQuery.value = ''
    searchResults.value = []
    searchError.value = null
  }
})

async function performSearch() {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  isLoadingSearch.value = true
  searchError.value = null
  searchResults.value = []

  try {
    const result = await getDocuments({ search: searchQuery.value })
    searchResults.value = result.items
  } catch (error) {
    console.error('Document search failed:', error)
    searchError.value = 'Failed to perform search. Please try again.'
  } finally {
    isLoadingSearch.value = false
  }
}

function selectDocument(doc: DocumentRecord) {
  emit('update:open', false)
  router.push(`/documents/${doc.id}`)
}
</script>

<template>
  <SimpleDialog :open="props.open" @update:open="(val) => emit('update:open', val)">
    <div class="space-y-4">
      <CardHeader class="p-0 pb-4">
        <CardTitle class="text-2xl font-bold">Find Document</CardTitle>
        <p class="text-sm text-muted-foreground">Search for a document by code, name, keywords or summary.</p>
      </CardHeader>
      
      <div class="relative">
        <Input 
          v-model="searchQuery" 
          placeholder="Search documents..." 
          class="pr-10"
          @keyup.enter="performSearch"
          :disabled="isLoadingSearch"
        />
        <Button 
          variant="ghost" 
          size="icon" 
          class="absolute right-1 top-1 h-8 w-8" 
          @click="performSearch"
          :disabled="isLoadingSearch"
        >
          <Loader2 v-if="isLoadingSearch" class="h-4 w-4 animate-spin" />
          <Search v-else class="h-4 w-4" />
        </Button>
      </div>

      <div v-if="searchError" class="text-sm text-destructive">{{ searchError }}</div>

      <div v-if="searchResults.length > 0" class="max-h-80 overflow-y-auto border rounded-md">
        <div v-for="doc in searchResults" :key="doc.id" 
          class="flex items-center justify-between p-3 border-b hover:bg-muted cursor-pointer transition-colors"
          @click="selectDocument(doc)"
        >
          <div class="flex items-center gap-3">
            <FileText class="h-5 w-5 text-blue-600" />
            <div>
              <p class="font-medium text-sm">{{ doc.title }}</p>
              <p class="text-xs text-muted-foreground">{{ doc.documentCode || 'No Code' }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Badge variant="outline">
              {{ doc.lifecycleStatus }}
            </Badge>
          </div>
        </div>
      </div>
      <div v-else-if="searchQuery.trim() && !isLoadingSearch && !searchError" class="text-center py-8 text-muted-foreground text-sm">
        No documents found matching your query.
      </div>
      <div v-else class="text-center py-8 text-muted-foreground text-sm">
        Enter a search term above to find documents.
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <Button variant="outline" @click="emit('update:open', false)">Close</Button>
      </div>
    </div>
  </SimpleDialog>
</template>
