<script setup lang="ts">
import { ref, onMounted } from 'vue'
import sharePointService, { DOCUMENT_REGISTRY_FIELD_NAMES } from '@/services/sharePointService'
import { useToast } from '@/composables/useToast'
import { 
  Card, Button, Badge, SimpleDialog 
} from '@/components/ui'
import { FileText, CheckCircle, Loader2, AlertTriangle } from 'lucide-vue-next'

const { toast } = useToast()
const isLoading = ref(false)
const pendingFiles = ref<any[]>([])
const processingId = ref<string | null>(null)
const showConfirmDialog = ref(false)
const fileToPublish = ref<any>(null)

const PUBLISHED_LIBRARY = import.meta.env.VITE_SHAREPOINT_PUBLISHED_LIBRARY || 'DM-Published'
const AUTHORING_LIBRARY = import.meta.env.VITE_SHAREPOINT_AUTHORING_LIBRARY || 'DM-Authoring'

onMounted(() => {
  fetchPendingFiles()
})

async function fetchPendingFiles() {
  isLoading.value = true
  try {
    // Fetch files from Authoring Library
    // In a real scenario, we might filter by 'UnderReview' status if we trust the columns
    // For now, we list all files in Authoring as "Pending"
    const files = await sharePointService.getFilesFromLibrary(AUTHORING_LIBRARY)
    
    // Map to a friendly format
    pendingFiles.value = files.map(f => {
      const code = f.fields?.[DOCUMENT_REGISTRY_FIELD_NAMES.documentCode] as string || 'No Code'
      const status = f.fields?.[DOCUMENT_REGISTRY_FIELD_NAMES.lifecycleStatus] as string || 'Draft'
      return {
        id: f.id,
        name: f.name,
        code: code,
        status: status,
        modified: f.lastModifiedDateTime,
        webUrl: f.webUrl,
        fields: f.fields
      }
    })
  } catch (error) {
    console.error('Failed to fetch pending files:', error)
  } finally {
    isLoading.value = false
  }
}

function confirmPublish(file: any) {
  fileToPublish.value = file
  showConfirmDialog.value = true
}

async function executePublish() {
  if (!fileToPublish.value) return
  
  const file = fileToPublish.value
  showConfirmDialog.value = false
  processingId.value = file.id
  
  try {
    console.log(`[Admin] Publishing file: ${file.name} (${file.id})`)

    // 1. Move file to Published Library
    const movedFile = await sharePointService.moveFile(
      AUTHORING_LIBRARY,
      file.id,
      PUBLISHED_LIBRARY
    )
    console.log('[Admin] File moved to:', movedFile.webUrl)

    // 2. Update Metadata on the Moved File (in Published Library)
    // We need to set status to 'Published' and ensure other fields are correct
    console.log('[Admin] Updating metadata on published file:', movedFile.id)
    
    // Get the ID of the Published Library to perform the update
    const publishedLibraryId = await sharePointService.getLibraryId(PUBLISHED_LIBRARY)
    
    await sharePointService.updateFileMetadata(publishedLibraryId, movedFile.id, {
      [DOCUMENT_REGISTRY_FIELD_NAMES.lifecycleStatus]: 'Published',
      // Ensure code is set if it wasn't before
      ...(file.code !== 'No Code' ? { [DOCUMENT_REGISTRY_FIELD_NAMES.documentCode]: file.code } : {})
    })

    // Refresh list
    await fetchPendingFiles()
    toast({
      title: 'Success',
      description: 'Document has been approved and published.',
      variant: 'success'
    })

  } catch (error) {
    console.error('Publish failed:', error)
    toast({
      title: 'Publication Failed',
      description: 'An error occurred while publishing. Please check the console.',
      variant: 'destructive'
    })
  } finally {
    processingId.value = null
    fileToPublish.value = null
  }
}
</script>

<template>
  <div class="container py-10 max-w-[1600px] mx-auto space-y-8">
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <h1 class="text-3xl font-bold tracking-tight text-slate-900">Pending Publication</h1>
        <p class="text-slate-600">Review and publish documents from the Authoring workspace.</p>
      </div>
      <Button @click="fetchPendingFiles" variant="outline" :disabled="isLoading">
        Refresh
      </Button>
    </div>

    <div v-if="isLoading" class="flex justify-center py-12">
      <Loader2 class="h-8 w-8 animate-spin text-slate-400" />
    </div>

    <div v-else-if="pendingFiles.length === 0" class="text-center py-16 bg-slate-50 rounded-lg border border-dashed border-slate-200">
      <div class="mx-auto h-12 w-12 text-slate-300 mb-3">
        <CheckCircle class="h-full w-full" />
      </div>
      <h3 class="text-lg font-medium text-slate-900">All Clear</h3>
      <p class="text-slate-500">No documents pending in Authoring.</p>
    </div>

    <div v-else class="grid gap-4">
      <Card v-for="file in pendingFiles" :key="file.id" class="flex flex-row items-center p-4 justify-between">
        <div class="flex items-center gap-4">
          <div class="p-2 bg-blue-50 rounded-lg">
            <FileText class="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h4 class="font-semibold text-slate-900">{{ file.name }}</h4>
              <Badge variant="secondary">{{ file.code }}</Badge>
            </div>
            <p class="text-sm text-slate-500">
              Status: <span class="font-medium text-slate-700">{{ file.status }}</span> • 
              Modified: {{ new Date(file.modified).toLocaleDateString() }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <a :href="file.webUrl" target="_blank" class="text-sm font-medium text-blue-600 hover:underline px-3">
            View
          </a>
          <Button @click="confirmPublish(file)" :disabled="!!processingId">
            <Loader2 v-if="processingId === file.id" class="mr-2 h-4 w-4 animate-spin" />
            Approve & Publish
          </Button>
        </div>
      </Card>
    </div>

    <!-- Confirmation Dialog -->
    <SimpleDialog v-model:open="showConfirmDialog">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <div class="p-2 bg-amber-100 rounded-full">
              <AlertTriangle class="w-5 h-5 text-amber-600" />
            </div>
            <h3 class="text-lg font-semibold">Confirm Publication</h3>
          </div>
          <p class="text-slate-600 text-sm">
            Are you sure you want to publish <span class="font-medium text-slate-900">{{ fileToPublish?.name }}</span>?
          </p>
          <p class="text-slate-500 text-xs">
            This will move the file to the <strong>{{ PUBLISHED_LIBRARY }}</strong> library and update its status to 'Published'.
          </p>
        </div>
        <div class="flex justify-end gap-3 mt-2">
          <Button variant="outline" @click="showConfirmDialog = false">Cancel</Button>
          <Button @click="executePublish">Yes, Publish Document</Button>
        </div>
      </div>
    </SimpleDialog>
  </div>
</template>
