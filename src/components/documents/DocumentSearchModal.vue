<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  SimpleDialog,
  Input,
  Button,
  CardHeader, CardTitle, Badge
} from '@/components/ui'
import { Search, Loader2, FileText, Folder } from 'lucide-vue-next'
import sharePointService, { DOCUMENT_REGISTRY_FIELD_NAMES } from '@/services/sharePointService'
import type { SharePointFile } from '@/services/sharePointService'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const router = useRouter()
const searchQuery = ref('')
const searchResults = ref<
  (SharePointFile & { library: 'Authoring' | 'Published' })[]
>([])
const isLoadingSearch = ref(false)
const searchError = ref<string | null>(null)

const AUTHORING_LIBRARY = import.meta.env.VITE_SHAREPOINT_AUTHORING_LIBRARY || 'DM-Authoring'
const PUBLISHED_LIBRARY = import.meta.env.VITE_SHAREPOINT_PUBLISHED_LIBRARY || 'DM-Published'

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
    const query = searchQuery.value.toLowerCase()
    
    // Search Authoring Library
    const authoringFiles = await sharePointService.getFilesFromLibrary(AUTHORING_LIBRARY)
    const filteredAuthoring = authoringFiles
      .filter(file => {
        const metadataCode = String(file.fields?.[DOCUMENT_REGISTRY_FIELD_NAMES.documentCode] || '')
        const title = String(file.fields?.Title || file.name)
        const summary = String(file.fields?.summary || '')
        const keywords = String(file.fields?.keywords || '')

        return (
          metadataCode.toLowerCase().includes(query) ||
          title.toLowerCase().includes(query) ||
          file.name.toLowerCase().includes(query) || // Fallback to filename
          summary.toLowerCase().includes(query) ||
          keywords.toLowerCase().includes(query)
        )
      })
      .map(file => ({ ...file, library: 'Authoring' as const }))

    // Search Published Library
    const publishedFiles = await sharePointService.getFilesFromLibrary(PUBLISHED_LIBRARY)
    const filteredPublished = publishedFiles
      .filter(file => {
        const metadataCode = String(file.fields?.[DOCUMENT_REGISTRY_FIELD_NAMES.documentCode] || '')
        const title = String(file.fields?.Title || file.name)
        const summary = String(file.fields?.summary || '')
        const keywords = String(file.fields?.keywords || '')

        return (
          metadataCode.toLowerCase().includes(query) ||
          title.toLowerCase().includes(query) ||
          file.name.toLowerCase().includes(query) || // Fallback to filename
          summary.toLowerCase().includes(query) ||
          keywords.toLowerCase().includes(query)
        )
      })
      .map(file => ({ ...file, library: 'Published' as const }))

    searchResults.value = [...filteredAuthoring, ...filteredPublished]

  } catch (error) {
    console.error('Document search failed:', error)
    searchError.value = 'Failed to perform search. Please try again.'
  } finally {
    isLoadingSearch.value = false
  }
}

function selectDocument(file: SharePointFile & { library: 'Authoring' | 'Published' }) {
  // Navigate to DocumentEditorView with the document ID
  emit('update:open', false) // Close modal
  // We need to pass the library it came from for the editor to know where to fetch from
  router.push({ name: 'document-edit', params: { documentId: file.id, library: file.library } })
}
</script>

<template>
  <SimpleDialog :open="props.open" @update:open="(val) => emit('update:open', val)">
    <div class="space-y-4">
      <CardHeader class="p-0 pb-4">
        <CardTitle class="text-2xl font-bold">Edit Document</CardTitle>
        <p class="text-sm text-muted-foreground">Search for a document by code, name, keywords or summary to edit.</p>
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
        <div v-for="file in searchResults" :key="file.id" 
          class="flex items-center justify-between p-3 border-b hover:bg-muted cursor-pointer transition-colors"
          @click="selectDocument(file)"
        >
          <div class="flex items-center gap-3">
            <FileText class="h-5 w-5 text-blue-600" />
            <div>
              <p class="font-medium text-sm">{{ file.name }}</p>
              <p class="text-xs text-muted-foreground">{{ file.fields?.[DOCUMENT_REGISTRY_FIELD_NAMES.documentCode] || 'No Code' }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Badge variant="outline" :class="file.library === 'Authoring' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'">
              <Folder class="h-3 w-3 mr-1" />
              {{ file.library }}
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
