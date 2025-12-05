<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useDocumentsApi } from '@/composables/useDocumentsApi'
import type { DocumentRecord } from '@/stores/documentsStore'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Badge,
  Separator,
  Input,
  Label,
  Textarea,
} from '@/components/ui'
import {
  ArrowLeft,
  FileText,
  Download,
  User,
  Tag,
  Clock,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Archive,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { getDocumentById, requestApproval, approveDocument, publishDocument, markObsolete, isLoading } = useDocumentsApi()

const documentId = route.params.id as string
const document = ref<DocumentRecord | null>(null)
const error = ref<string | null>(null)

// Action modals
const showApprovalModal = ref(false)
const showPublishModal = ref(false)
const showObsoleteModal = ref(false)

// Approval form data
const approvalForm = ref({
  revision: '1',
  effectiveDate: '',
  nextReviewDate: '',
})

// Obsolete form data
const obsoleteForm = ref({
  supersededByDocumentId: '',
  notes: '',
})

// Load document on mount
onMounted(async () => {
  try {
    error.value = null
    document.value = await getDocumentById(documentId)
  } catch (err: any) {
    error.value = err.response?.data?.error || err.message || 'Failed to load document'
    console.error('Failed to load document:', err)
  }
})

// Computed properties
const lifecycleStatusColor = computed(() => {
  if (!document.value) return 'default'
  const status = document.value.lifecycleStatus
  const colorMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    Draft: 'secondary',
    UnderReview: 'default',
    Approved: 'default',
    Published: 'default',
    Obsolete: 'destructive',
  }
  return colorMap[status] || 'default'
})

const canRequestApproval = computed(() => {
  if (!document.value || !authStore.user) return false
  
  const isDraft = document.value.lifecycleStatus === 'Draft'
  const isOwner = document.value.owner.email === authStore.user.email
  const hasPermission = authStore.isAuthor || authStore.isAdmin || isOwner

  console.log('[Details] Can Request Approval?', { isDraft, isOwner, hasPermission, status: document.value.lifecycleStatus })
  
  return isDraft && hasPermission
})

const canApprove = computed(() => {
  return (
    document.value?.lifecycleStatus === 'UnderReview' &&
    (authStore.isApprover || authStore.isAdmin)
  )
})

const canPublish = computed(() => {
  return (
    document.value?.lifecycleStatus === 'Approved' &&
    authStore.isAdmin
  )
})

const canMarkObsolete = computed(() => {
  return (
    document.value?.lifecycleStatus === 'Published' &&
    authStore.isAdmin
  )
})

// Action handlers
const handleRequestApproval = async () => {
  if (!document.value) return
  try {
    await requestApproval(document.value.id, 'Requesting approval for this document')
    document.value = await getDocumentById(documentId)
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to request approval'
  }
}

const handleApprove = async () => {
  if (!document.value) return
  try {
    await approveDocument(document.value.id, approvalForm.value)
    document.value = await getDocumentById(documentId)
    showApprovalModal.value = false
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to approve document'
  }
}

const handlePublish = async () => {
  if (!document.value) return
  try {
    await publishDocument(document.value.id)
    document.value = await getDocumentById(documentId)
    showPublishModal.value = false
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to publish document'
  }
}

const handleMarkObsolete = async () => {
  if (!document.value) return
  try {
    await markObsolete(document.value.id, obsoleteForm.value)
    document.value = await getDocumentById(documentId)
    showObsoleteModal.value = false
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to mark document obsolete'
  }
}

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <div class="container py-10 max-w-[1400px] mx-auto space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <Button variant="ghost" @click="router.back()" class="gap-2">
          <ArrowLeft class="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Document Details</h1>
          <p class="text-muted-foreground">View and manage document information</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && !document" class="flex items-center justify-center py-20">
      <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
    </div>

    <!-- Error State -->
    <div
      v-if="error"
      class="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"
    >
      <div class="flex items-center gap-2">
        <AlertCircle class="h-4 w-4" />
        <span>{{ error }}</span>
      </div>
    </div>

    <!-- Document Content -->
    <div v-if="document && !isLoading" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content (Left Column) -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Document Header -->
        <Card>
          <CardHeader>
            <div class="flex items-start justify-between">
              <div class="space-y-2 flex-1">
                <div class="flex items-center gap-2">
                  <Badge :variant="lifecycleStatusColor">
                    {{ document.lifecycleStatus }}
                  </Badge>
                  <Badge variant="outline">{{ document.documentType }}</Badge>
                </div>
                <CardTitle class="text-2xl">{{ document.title }}</CardTitle>
                <CardDescription>
                  <span class="font-mono font-semibold">{{ document.documentCode }}</span>
                  <span v-if="document.revision" class="ml-2">• Revision {{ document.revision }}</span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent class="space-y-4">
            <!-- Summary -->
            <div v-if="document.summary" class="space-y-2">
              <h3 class="text-sm font-semibold">Summary</h3>
              <p class="text-sm text-muted-foreground">{{ document.summary.replace(/<[^>]*>?/gm, '') }}</p>
            </div>

            <!-- Keywords -->
            <div v-if="document.keywords && document.keywords.length > 0" class="space-y-2">
              <h3 class="text-sm font-semibold flex items-center gap-2">
                <Tag class="h-4 w-4" />
                Keywords
              </h3>
              <div class="flex flex-wrap gap-2">
                <Badge v-for="keyword in document.keywords" :key="keyword" variant="secondary">
                  {{ keyword }}
                </Badge>
              </div>
            </div>

            <!-- Metadata Grid -->
            <Separator />
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div class="space-y-1">
                <p class="text-muted-foreground">Process/Function</p>
                <p class="font-medium">{{ document.processOrFunction || 'N/A' }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-muted-foreground">Department/Site</p>
                <p class="font-medium">{{ document.departmentOrSite || 'N/A' }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-muted-foreground">Effective Date</p>
                <p class="font-medium">{{ formatDate(document.effectiveDate) }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-muted-foreground">Next Review Date</p>
                <p class="font-medium">{{ formatDate(document.nextReviewDate) }}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Files Section -->
        <Card>
          <CardHeader>
            <CardTitle class="text-lg flex items-center gap-2">
              <FileText class="h-5 w-5" />
              Document Files
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <!-- Authoring File -->
            <div v-if="document.authoringFileUrl" class="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
              <div class="flex items-center gap-3">
                <FileText class="h-5 w-5 text-muted-foreground" />
                <div>
                  <p class="text-sm font-medium">Source Document</p>
                  <p class="text-xs text-muted-foreground">Authoring Library</p>
                </div>
              </div>
              <Button variant="outline" size="sm" as="a" :href="document.authoringFileUrl" target="_blank" class="gap-2">
                <Download class="h-4 w-4" />
                Download
              </Button>
            </div>

            <!-- Published File -->
            <div v-if="document.publishedFileUrl" class="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
              <div class="flex items-center gap-3">
                <FileCheck class="h-5 w-5 text-green-600" />
                <div>
                  <p class="text-sm font-medium">Published Document (PDF)</p>
                  <p class="text-xs text-muted-foreground">Published Library</p>
                </div>
              </div>
              <Button variant="outline" size="sm" as="a" :href="document.publishedFileUrl" target="_blank" class="gap-2">
                <Download class="h-4 w-4" />
                Download
              </Button>
            </div>

            <!-- Archive File -->
            <div v-if="document.archiveFileUrl" class="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
              <div class="flex items-center gap-3">
                <Archive class="h-5 w-5 text-muted-foreground" />
                <div>
                  <p class="text-sm font-medium">Archived Document</p>
                  <p class="text-xs text-muted-foreground">Archive Library</p>
                </div>
              </div>
              <Button variant="outline" size="sm" as="a" :href="document.archiveFileUrl" target="_blank" class="gap-2">
                <Download class="h-4 w-4" />
                Download
              </Button>
            </div>

            <!-- No Files Message -->
            <div v-if="!document.authoringFileUrl && !document.publishedFileUrl && !document.archiveFileUrl" class="text-center py-8 text-muted-foreground">
              <FileText class="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p class="text-sm">No files available</p>
            </div>
          </CardContent>
        </Card>

        <!-- Document History -->
        <Card>
          <CardHeader>
            <CardTitle class="text-lg flex items-center gap-2">
              <Clock class="h-5 w-5" />
              Document History
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div class="space-y-1">
                <p class="text-muted-foreground">Created</p>
                <p class="font-medium">{{ formatDate(document.createdAt) }}</p>
                <p class="text-xs text-muted-foreground">by {{ document.createdBy.displayName || 'System' }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-muted-foreground">Last Updated</p>
                <p class="font-medium">{{ formatDate(document.updatedAt) }}</p>
                <p class="text-xs text-muted-foreground">by {{ document.updatedBy.displayName || 'System' }}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Sidebar (Right Column) -->
      <div class="space-y-6">
        <!-- Workflow Actions -->
        <Card>
          <CardHeader>
            <CardTitle class="text-lg">Workflow Actions</CardTitle>
            <CardDescription>Manage document lifecycle</CardDescription>
          </CardHeader>
          <CardContent class="space-y-2">
            <!-- Request Approval -->
            <Button
              v-if="canRequestApproval"
              @click="handleRequestApproval"
              :disabled="isLoading"
              class="w-full gap-2"
            >
              <CheckCircle2 class="h-4 w-4" />
              Request Approval
            </Button>

            <!-- Approve -->
            <Button
              v-if="canApprove"
              @click="showApprovalModal = true"
              :disabled="isLoading"
              class="w-full gap-2"
            >
              <CheckCircle2 class="h-4 w-4" />
              Approve Document
            </Button>

            <!-- Publish -->
            <Button
              v-if="canPublish"
              @click="showPublishModal = true"
              :disabled="isLoading"
              variant="default"
              class="w-full gap-2"
            >
              <FileCheck class="h-4 w-4" />
              Publish Document
            </Button>

            <!-- Mark Obsolete -->
            <Button
              v-if="canMarkObsolete"
              @click="showObsoleteModal = true"
              :disabled="isLoading"
              variant="destructive"
              class="w-full gap-2"
            >
              <Archive class="h-4 w-4" />
              Mark Obsolete
            </Button>

            <!-- No Actions Available -->
            <div v-if="!canRequestApproval && !canApprove && !canPublish && !canMarkObsolete" class="text-center py-4 text-muted-foreground text-sm">
              No actions available for current status
            </div>
          </CardContent>
        </Card>

        <!-- People -->
        <Card>
          <CardHeader>
            <CardTitle class="text-lg flex items-center gap-2">
              <User class="h-5 w-5" />
              People
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-1">
              <p class="text-sm text-muted-foreground">Owner</p>
              <p class="font-medium">{{ document.owner.displayName || 'Unassigned' }}</p>
              <p class="text-xs text-muted-foreground">{{ document.owner.email }}</p>
            </div>
            <Separator />
            <div class="space-y-1">
              <p class="text-sm text-muted-foreground">Approver</p>
              <p class="font-medium">{{ document.approver.displayName || 'Unassigned' }}</p>
              <p class="text-xs text-muted-foreground">{{ document.approver.email }}</p>
            </div>
          </CardContent>
        </Card>

        <!-- Related Documents -->
        <Card v-if="document.supersedesDocumentId || document.supersededByDocumentId">
          <CardHeader>
            <CardTitle class="text-lg flex items-center gap-2">
              <ExternalLink class="h-5 w-5" />
              Related Documents
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div v-if="document.supersedesDocumentId" class="space-y-1">
              <p class="text-sm text-muted-foreground">Supersedes</p>
              <Button variant="link" class="h-auto p-0 text-left" @click="router.push(`/documents/${document.supersedesDocumentId}`)">
                Document {{ document.supersedesDocumentId }}
              </Button>
            </div>
            <div v-if="document.supersededByDocumentId" class="space-y-1">
              <p class="text-sm text-muted-foreground">Superseded By</p>
              <Button variant="link" class="h-auto p-0 text-left" @click="router.push(`/documents/${document.supersededByDocumentId}`)">
                Document {{ document.supersededByDocumentId }}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Approval Modal (Simple inline for now) -->
    <div v-if="showApprovalModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card class="w-full max-w-md">
        <CardHeader>
          <CardTitle>Approve Document</CardTitle>
          <CardDescription>Enter approval details</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="revision">Revision Number</Label>
            <Input id="revision" v-model="approvalForm.revision" placeholder="1" />
          </div>
          <div class="space-y-2">
            <Label for="effectiveDate">Effective Date</Label>
            <Input id="effectiveDate" v-model="approvalForm.effectiveDate" type="date" />
          </div>
          <div class="space-y-2">
            <Label for="nextReviewDate">Next Review Date</Label>
            <Input id="nextReviewDate" v-model="approvalForm.nextReviewDate" type="date" />
          </div>
          <div class="flex gap-2 justify-end">
            <Button variant="outline" @click="showApprovalModal = false">Cancel</Button>
            <Button @click="handleApprove" :disabled="isLoading">
              <Loader2 v-if="isLoading" class="h-4 w-4 animate-spin mr-2" />
              Approve
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Obsolete Modal -->
    <div v-if="showObsoleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card class="w-full max-w-md">
        <CardHeader>
          <CardTitle>Mark Document Obsolete</CardTitle>
          <CardDescription>This action will archive the document</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="supersededBy">Superseded By Document ID (optional)</Label>
            <Input id="supersededBy" v-model="obsoleteForm.supersededByDocumentId" placeholder="Document ID" />
          </div>
          <div class="space-y-2">
            <Label for="notes">Notes</Label>
            <Textarea id="notes" v-model="obsoleteForm.notes" placeholder="Reason for obsolescence" />
          </div>
          <div class="flex gap-2 justify-end">
            <Button variant="outline" @click="showObsoleteModal = false">Cancel</Button>
            <Button variant="destructive" @click="handleMarkObsolete" :disabled="isLoading">
              <Loader2 v-if="isLoading" class="h-4 w-4 animate-spin mr-2" />
              Mark Obsolete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Publish Modal -->
    <div v-if="showPublishModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card class="w-full max-w-md">
        <CardHeader>
          <CardTitle>Confirm Publication</CardTitle>
          <CardDescription>
            This will automatically convert the approved document to PDF and publish it.
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <p class="text-sm text-slate-600">
            Are you sure you want to proceed? This action will move the document to the Published library and make it available to all readers.
          </p>
          <div class="flex gap-2 justify-end">
            <Button variant="outline" @click="showPublishModal = false">Cancel</Button>
            <Button @click="handlePublish" :disabled="isLoading">
              <Loader2 v-if="isLoading" class="h-4 w-4 animate-spin mr-2" />
              Confirm Publish
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
