<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import { useDocumentsApi } from '@/composables/useDocumentsApi'
import type { DocumentRecord } from '@/stores/documentsStore'
import { 
  Card, Button, Badge, SimpleDialog 
} from '@/components/ui'
import { FileText, CheckCircle, Loader2, AlertTriangle } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const { toast } = useToast()
const router = useRouter()
const { getDocuments, approveDocument } = useDocumentsApi()

const isLoading = ref(false)
const pendingDocs = ref<DocumentRecord[]>([])
const processingId = ref<string | null>(null)
const showConfirmDialog = ref(false)
const docToApprove = ref<DocumentRecord | null>(null)

onMounted(() => {
  fetchPendingDocs()
})

async function fetchPendingDocs() {
  isLoading.value = true
  try {
    const result = await getDocuments({ lifecycleStatus: 'UnderReview' })
    pendingDocs.value = result.items
  } catch (error) {
    console.error('Failed to fetch pending documents:', error)
    toast({
      title: 'Error',
      description: 'Failed to load pending approvals.',
      variant: 'destructive'
    })
  } finally {
    isLoading.value = false
  }
}

function confirmApprove(doc: DocumentRecord) {
  docToApprove.value = doc
  showConfirmDialog.value = true
}

async function executeApprove() {
  if (!docToApprove.value) return
  
  const doc = docToApprove.value
  showConfirmDialog.value = false
  processingId.value = doc.id
  
  try {
    console.log(`[Admin] Approving document: ${doc.title} (${doc.id})`)

    // Calculate next revision (simple logic for demo)
    const nextRev = (parseInt(doc.revision) + 1).toString()
    const today = new Date().toISOString().split('T')[0]
    const nextYear = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]

    await approveDocument(doc.id, {
      revision: nextRev,
      effectiveDate: today || '',
      nextReviewDate: nextYear || ''
    })

    // Refresh list
    await fetchPendingDocs()
    toast({
      title: 'Success',
      description: 'Document has been approved.',
      variant: 'success'
    })

  } catch (error) {
    console.error('Approval failed:', error)
    toast({
      title: 'Approval Failed',
      description: 'An error occurred while approving.',
      variant: 'destructive'
    })
  } finally {
    processingId.value = null
    docToApprove.value = null
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}
</script>

<template>
  <div class="container py-10 max-w-[1600px] mx-auto space-y-8">
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <h1 class="text-3xl font-bold tracking-tight text-slate-900">Pending Approvals</h1>
        <p class="text-slate-600">Review and approve documents waiting for publication.</p>
      </div>
      <Button @click="fetchPendingDocs" variant="outline" :disabled="isLoading">
        Refresh
      </Button>
    </div>

    <div v-if="isLoading" class="flex justify-center py-12">
      <Loader2 class="h-8 w-8 animate-spin text-slate-400" />
    </div>

    <div v-else-if="pendingDocs.length === 0" class="text-center py-16 bg-slate-50 rounded-lg border border-dashed border-slate-200">
      <div class="mx-auto h-12 w-12 text-slate-300 mb-3">
        <CheckCircle class="h-full w-full" />
      </div>
      <h3 class="text-lg font-medium text-slate-900">All Clear</h3>
      <p class="text-slate-500">No documents pending approval.</p>
    </div>

    <div v-else class="grid gap-4">
      <Card v-for="doc in pendingDocs" :key="doc.id" class="flex flex-row items-center p-4 justify-between">
        <div class="flex items-center gap-4">
          <div class="p-2 bg-blue-50 rounded-lg">
            <FileText class="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h4 class="font-semibold text-slate-900">{{ doc.title }}</h4>
              <Badge variant="secondary">{{ doc.documentCode }}</Badge>
            </div>
            <p class="text-sm text-slate-500">
              Owner: <span class="font-medium text-slate-700">{{ doc.owner.displayName }}</span> • 
              Created: {{ formatDate(doc.createdAt) }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <Button variant="ghost" @click="router.push(`/documents/${doc.id}`)">
            Review
          </Button>
          <Button @click="confirmApprove(doc)" :disabled="!!processingId">
            <Loader2 v-if="processingId === doc.id" class="mr-2 h-4 w-4 animate-spin" />
            Approve
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
            <h3 class="text-lg font-semibold">Confirm Approval</h3>
          </div>
          <p class="text-slate-600 text-sm">
            Are you sure you want to approve <span class="font-medium text-slate-900">{{ docToApprove?.title }}</span>?
          </p>
          <p class="text-slate-500 text-xs">
            This will set the status to 'Approved'. The document will still need to be published.
          </p>
        </div>
        <div class="flex justify-end gap-3 mt-2">
          <Button variant="outline" @click="showConfirmDialog = false">Cancel</Button>
          <Button @click="executeApprove">Yes, Approve Document</Button>
        </div>
      </div>
    </SimpleDialog>
  </div>
</template>
