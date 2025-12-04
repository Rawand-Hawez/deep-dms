<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSharePointDocuments } from '@/composables/useSharePointDocuments'
import { useAuthStore } from '@/stores/authStore'
import type { DocumentRecord } from '@/stores/documentsStore'
import Button from '@/components/ui/Button.vue'

/**
 * SharePoint Connection Test View
 *
 * Component for testing SharePoint document upload and management functionality
 * Allows uploading files and viewing uploaded documents
 */

const authStore = useAuthStore()
const {
  isLoading,
  error,
  uploadDocument,
  loadDocuments
} = useSharePointDocuments()

// Form state
const selectedFile = ref<File | null>(null)
const uploadForm = ref({
  title: '',
  documentType: 'Other' as DocumentRecord['documentType'],
  locationCode: 'HQ',
  departmentCode: 'QMS',
  sequenceNumber: '001',
  revision: '1.0',
  keywords: '',
  summary: ''
})

const locationOptions = [
  { value: 'HQ', label: 'HQ (Default)' },
  { value: 'L1', label: 'Location 1' },
  { value: 'S1', label: 'Site 1' },
  { value: 'S2', label: 'Site 2' },
]

const departmentOptions = [
  { value: 'QMS', label: 'QMS (Default)' },
  { value: 'ITS', label: 'IT' },
  { value: 'HRS', label: 'HR' },
  { value: 'OPS', label: 'Operations' },
  { value: 'FIN', label: 'Finance' },
]

const docTypeCodes: Record<DocumentRecord['documentType'] | 'Other', string> = {
  Standard: 'STD',
  Procedure: 'PRO',
  SOP: 'SOP',
  Policy: 'POL',
  WorkInstruction: 'WNS',
  Manual: 'MAN',
  Form: 'FRM',
  Other: 'OTH',
}

const docCode = computed(() => {
  const loc = (uploadForm.value.locationCode || 'HQ').toUpperCase()
  const dept = (uploadForm.value.departmentCode || 'QMS').toUpperCase()
  const typeCode = docTypeCodes[uploadForm.value.documentType] || 'OTH'
  const seq = (uploadForm.value.sequenceNumber || '001').toString().padStart(3, '0')
  return `DPM-${loc}-${dept}-${typeCode}-${seq}`
})

// Document list state
const documents = ref<DocumentRecord[]>([])
const showDocuments = ref(false)

// File input ref
const fileInput = ref<HTMLInputElement | null>(null)

// Validation
const isFormValid = computed(() => {
  return (
    selectedFile.value !== null &&
    docCode.value.trim().length > 0 &&
    uploadForm.value.sequenceNumber.trim().length > 0
  )
})

// Status messages
const statusMessage = ref<string | null>(null)
const statusType = ref<'success' | 'error' | 'info'>('info')

// Environment configuration
const sharepointSiteUrl = computed(() => import.meta.env.VITE_SHAREPOINT_SITE_URL || 'Not configured')
const authoringLibrary = computed(() => import.meta.env.VITE_SHAREPOINT_AUTHORING_LIBRARY || 'DM-Authoring')
const publishedLibrary = computed(() => import.meta.env.VITE_SHAREPOINT_PUBLISHED_LIBRARY || 'DM-Published')
const registryList = computed(() => import.meta.env.VITE_SHAREPOINT_REGISTRY_LIST || 'DM-DocumentRegistry')

/**
 * Handle file selection
 */
function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    if (file) {
      selectedFile.value = file
      // Auto-populate title if empty
      if (!uploadForm.value.title) {
        uploadForm.value.title = file.name.replace(/\.[^/.]+$/, '')
      }
    }
  }
}

/**
 * Clear file selection
 */
function clearFile() {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

/**
 * Upload document to SharePoint
 */
async function handleUpload() {
  if (!selectedFile.value || !isFormValid.value) {
    statusMessage.value = 'Please select a file and fill in required fields'
    statusType.value = 'error'
    return
  }

  try {
    statusMessage.value = 'Uploading document to SharePoint...'
    statusType.value = 'info'

  const metadata: Partial<DocumentRecord> = {
    title: docCode.value,
    documentType: uploadForm.value.documentType,
    processOrFunction: uploadForm.value.departmentCode,
    keywords: uploadForm.value.keywords.split(',').map(k => k.trim()).filter(Boolean),
    summary: uploadForm.value.summary,
    revision: uploadForm.value.revision,
    owner: authStore.user!,
    approver: authStore.user!,
  }

  if (selectedFile.value) {
    const result = await uploadDocument(selectedFile.value, metadata)
    
    statusMessage.value = `Document uploaded successfully! Document Code: ${result.documentCode}`
    statusType.value = 'success'

    // Reset form
    uploadForm.value = {
      title: '',
      documentType: 'Other',
      locationCode: 'HQ',
      departmentCode: 'QMS',
      sequenceNumber: '001',
      revision: '1.0',
      keywords: '',
      summary: ''
    }
    clearFile()

    // Reload documents
    await loadDocumentsList()
  }
  } catch (err) {
    statusMessage.value = `Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`
    statusType.value = 'error'
  }
}

/**
 * Load documents from SharePoint
 */
async function loadDocumentsList() {
  try {
    statusMessage.value = 'Loading documents from SharePoint...'
    statusType.value = 'info'

    const docs = await loadDocuments()
    documents.value = docs
    showDocuments.value = true

    statusMessage.value = `Loaded ${docs.length} document(s) from SharePoint`
    statusType.value = 'success'
  } catch (err) {
    statusMessage.value = `Failed to load documents: ${err instanceof Error ? err.message : 'Unknown error'}`
    statusType.value = 'error'
  }
}

// Load documents on view load
onMounted(() => {
  loadDocumentsList()
})

/**
 * Format file size
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Format date
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString()
}
</script>

<template>
  <div class="container py-10 max-w-[1600px] mx-auto space-y-8">
    <!-- Header -->
    <div class="space-y-2">
      <h1 class="text-3xl font-bold tracking-tight">SharePoint Connection Test</h1>
      <p class="text-muted-foreground">
        Test document upload and management integration with SharePoint Online
      </p>
    </div>

    <!-- Status Messages -->
    <div
      v-if="statusMessage"
      :class="[
        'rounded-lg border p-4',
        statusType === 'success' ? 'border-green-200 bg-green-50 text-green-800' : '',
        statusType === 'error' ? 'border-red-200 bg-red-50 text-red-800' : '',
        statusType === 'info' ? 'border-blue-200 bg-blue-50 text-blue-800' : ''
      ]"
    >
      <p class="text-sm font-medium">{{ statusMessage }}</p>
    </div>

    <!-- Error Display -->
    <div
      v-if="error"
      class="rounded-lg border border-red-200 bg-red-50 p-4"
    >
      <p class="text-sm font-medium text-red-800">{{ error }}</p>
    </div>

    <!-- Upload Form -->
    <div class="rounded-lg border bg-card p-6 space-y-6">
      <h2 class="text-xl font-semibold">Upload Document</h2>

      <!-- File Selection -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Select File</label>
        <input
          ref="fileInput"
          type="file"
          accept=".doc,.docx,.xls,.xlsx,.pdf,.txt"
          @change="handleFileSelect"
          class="block w-full text-sm border rounded-md p-2"
        />
        <p
          v-if="selectedFile"
          class="text-sm text-muted-foreground"
        >
          Selected: {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
        </p>
      </div>

      <!-- Document Details -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <label class="text-sm font-medium">Document Code (auto)</label>
          <input
            :value="docCode"
            type="text"
            class="w-full border rounded-md p-2 text-sm bg-muted/50"
            readonly
          />
          <p class="text-xs text-muted-foreground">Format: DPM-LL-AAA-BBB-xxx</p>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">Version</label>
          <input
            v-model="uploadForm.revision"
            type="text"
            placeholder="e.g., 1.0"
            class="w-full border rounded-md p-2 text-sm"
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">Location (LL)</label>
          <select
            v-model="uploadForm.locationCode"
            class="w-full border rounded-md p-2 text-sm"
          >
            <option
              v-for="loc in locationOptions"
              :key="loc.value"
              :value="loc.value"
            >
              {{ loc.label }}
            </option>
          </select>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">Department (AAA)</label>
          <select
            v-model="uploadForm.departmentCode"
            class="w-full border rounded-md p-2 text-sm"
          >
            <option
              v-for="dept in departmentOptions"
              :key="dept.value"
              :value="dept.value"
            >
              {{ dept.label }}
            </option>
          </select>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">Document Type (BBB)</label>
          <select
            v-model="uploadForm.documentType"
            class="w-full border rounded-md p-2 text-sm"
          >
            <option value="Policy">Policy (POL)</option>
            <option value="WorkInstruction">Work Instruction (WNS)</option>
            <option value="Procedure">Procedure (PRO)</option>
            <option value="Standard">Standard (STD)</option>
            <option value="SOP">SOP</option>
            <option value="Manual">Manual</option>
            <option value="Form">Form (FRM)</option>
            <option value="Other">Other (OTH)</option>
          </select>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">Sequence (xxx)</label>
          <input
            v-model="uploadForm.sequenceNumber"
            type="text"
            placeholder="001"
            class="w-full border rounded-md p-2 text-sm"
          />
          <p class="text-xs text-muted-foreground">Left-padded to 3 digits</p>
        </div>

        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium">Keywords</label>
          <input
            v-model="uploadForm.keywords"
            type="text"
            placeholder="Comma-separated keywords"
            class="w-full border rounded-md p-2 text-sm"
          />
          <p class="text-xs text-muted-foreground">Separate multiple keywords with commas</p>
        </div>
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium">Summary</label>
        <textarea
          v-model="uploadForm.summary"
          placeholder="Brief description of the document"
          rows="3"
          class="w-full border rounded-md p-2 text-sm"
        />
      </div>

      <!-- Actions -->
      <div class="flex gap-3">
        <Button
          @click="handleUpload"
          :disabled="!isFormValid || isLoading"
          class="flex-1"
        >
          {{ isLoading ? 'Uploading...' : 'Upload to SharePoint' }}
        </Button>
        <Button
          v-if="selectedFile"
          @click="clearFile"
          variant="outline"
        >
          Clear
        </Button>
      </div>
    </div>

    <!-- Load Documents Section -->
    <div class="rounded-lg border bg-card p-6 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold">Documents in SharePoint</h2>
        <Button
          @click="loadDocumentsList"
          :disabled="isLoading"
          variant="outline"
        >
          {{ isLoading ? 'Loading...' : 'Refresh Documents' }}
        </Button>
      </div>

      <!-- Documents List -->
      <div v-if="showDocuments && documents.length > 0" class="space-y-3">
        <div
          v-for="doc in documents"
          :key="doc.id"
          class="rounded-lg border p-4 space-y-2"
        >
          <div class="flex items-start justify-between">
            <div class="space-y-1">
              <h3 class="font-semibold">{{ doc.title }}</h3>
              <p class="text-sm text-muted-foreground">
                Code: {{ doc.documentCode }} | Type: {{ doc.documentType }} | Rev: {{ doc.revision }}
              </p>
            </div>
            <span
              :class="[
                'text-xs px-2 py-1 rounded-full',
                doc.lifecycleStatus === 'Draft' ? 'bg-gray-100 text-gray-800' : '',
                doc.lifecycleStatus === 'Published' ? 'bg-green-100 text-green-800' : ''
              ]"
            >
              {{ doc.lifecycleStatus }}
            </span>
          </div>

          <div v-if="doc.summary" class="text-sm">
            {{ doc.summary }}
          </div>

          <div v-if="doc.keywords.length > 0" class="flex flex-wrap gap-1">
            <span
              v-for="keyword in doc.keywords"
              :key="keyword"
              class="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700"
            >
              {{ keyword }}
            </span>
          </div>

          <div class="text-xs text-muted-foreground space-y-1">
            <p>Owner: {{ doc.owner.displayName }}</p>
            <p>Created: {{ formatDate(doc.createdAt) }}</p>
            <p v-if="doc.authoringFileUrl">
              <a :href="doc.authoringFileUrl" target="_blank" class="text-blue-600 hover:underline">
                View in SharePoint
              </a>
            </p>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="showDocuments && documents.length === 0" class="text-center py-8 text-muted-foreground">
        <p>No documents found in SharePoint</p>
      </div>

      <!-- Initial State -->
      <div v-else class="text-center py-8 text-muted-foreground">
        <p>Click "Refresh Documents" to load documents from SharePoint</p>
      </div>
    </div>

    <!-- Connection Info -->
    <div class="rounded-lg border bg-card p-6 space-y-3">
      <h2 class="text-xl font-semibold">Connection Information</h2>
      <div class="space-y-2 text-sm">
        <p>
          <span class="font-medium">SharePoint Site:</span>
          <span class="text-muted-foreground ml-2">{{ sharepointSiteUrl }}</span>
        </p>
        <p>
          <span class="font-medium">Authoring Library:</span>
          <span class="text-muted-foreground ml-2">{{ authoringLibrary }}</span>
        </p>
        <p>
          <span class="font-medium">Published Library:</span>
          <span class="text-muted-foreground ml-2">{{ publishedLibrary }}</span>
        </p>
        <p>
          <span class="font-medium">Registry List:</span>
          <span class="text-muted-foreground ml-2">{{ registryList }}</span>
        </p>
        <p>
          <span class="font-medium">Current User:</span>
          <span class="text-muted-foreground ml-2">{{ authStore.user?.displayName }} ({{ authStore.user?.email }})</span>
        </p>
        <p>
          <span class="font-medium">User Roles:</span>
          <span class="text-muted-foreground ml-2">{{ authStore.roles.join(', ') }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Use Tailwind utilities exclusively */
</style>
