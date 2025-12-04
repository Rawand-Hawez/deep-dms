<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSharePointDocuments } from '@/composables/useSharePointDocuments'
import type { DocumentRecord } from '@/stores/documentsStore'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  Button,
  Input,
  Label,
  Badge,
  Textarea,
  Separator
} from '@/components/ui'
import { Search, Edit, X, Save, FileText, Loader2, UploadCloud, File as FileIcon } from 'lucide-vue-next'

const { updateDocument, isLoading } = useSharePointDocuments()

// Search state
const searchQuery = ref('')
const searchResults = ref<Array<DocumentRecord & { library: 'Authoring' | 'Published' }>>([])
const isSearching = ref(false)
const showResults = ref(false)

// Selected document state
const selectedDocument = ref<(DocumentRecord & { library: 'Authoring' | 'Published' }) | null>(null)
const isEditMode = ref(false)

// Edit form state
const editForm = ref({
  title: '',
  keywords: '',
  summary: '',
  revision: ''
})

// File upload state
const selectedFile = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

// All documents from both libraries
const allDocuments = ref<Array<DocumentRecord & { library: 'Authoring' | 'Published' }>>([])

onMounted(async () => {
  await loadAllDocuments()
})

async function loadAllDocuments() {
  isSearching.value = true
  try {
    // Load from both libraries using sharePointService directly
    const sharePointService = await import('@/services/sharePointService')
    const service = sharePointService.default

    const [authoringFiles, publishedFiles] = await Promise.all([
      service.getFilesFromLibrary('DM-Authoring'),
      service.getFilesFromLibrary('DM-Published')
    ])

    // Map files to DocumentRecords
    const FIELD_NAMES = sharePointService.DOCUMENT_REGISTRY_FIELD_NAMES

    const mapToDocumentRecord = (file: any, library: 'Authoring' | 'Published'): DocumentRecord & { library: 'Authoring' | 'Published' } => {
      const fields = file.fields || {}
      return {
        id: file.id,
        sharepointItemId: file.id,
        documentCode: String(fields[FIELD_NAMES.documentCode] || ''),
        title: String(fields.Title || file.name),
        documentType: String(fields[FIELD_NAMES.documentType] || 'Other') as DocumentRecord['documentType'],
        processOrFunction: String(fields[FIELD_NAMES.processOrFunction] || ''),
        departmentOrSite: String(fields[FIELD_NAMES.departmentOrSite] || ''),
        revision: String(fields[FIELD_NAMES.revision] || '0'),
        lifecycleStatus: String(fields[FIELD_NAMES.lifecycleStatus] || 'Draft') as DocumentRecord['lifecycleStatus'],
        owner: {
          id: String(fields[FIELD_NAMES.ownerId] || ''),
          displayName: String(fields[FIELD_NAMES.owner] || ''),
          email: String(fields[FIELD_NAMES.ownerEmail] || ''),
        },
        approver: {
          id: String(fields[FIELD_NAMES.approverId] || ''),
          displayName: String(fields[FIELD_NAMES.approver] || ''),
          email: String(fields[FIELD_NAMES.approverEmail] || ''),
        },
        effectiveDate: fields[FIELD_NAMES.effectiveDate] as string | null,
        nextReviewDate: fields[FIELD_NAMES.nextReviewDate] as string | null,
        supersedesDocumentId: fields[FIELD_NAMES.supersedesDocumentId] as string | null,
        supersededByDocumentId: fields[FIELD_NAMES.supersededByDocumentId] as string | null,
        keywords: String(fields[FIELD_NAMES.keywords] || '').split(';').filter(Boolean),
        summary: String(fields[FIELD_NAMES.summary] || ''),
        createdAt: file.createdDateTime,
        updatedAt: file.lastModifiedDateTime,
        createdBy: { id: '', displayName: 'System', email: '' },
        updatedBy: { id: '', displayName: 'System', email: '' },
        authoringFileUrl: library === 'Authoring' ? file.webUrl : '',
        publishedFileUrl: library === 'Published' ? file.webUrl : '',
        archiveFileUrl: '',
        library
      }
    }

    const authoringDocs = authoringFiles.map(f => mapToDocumentRecord(f, 'Authoring'))
    const publishedDocs = publishedFiles.map(f => mapToDocumentRecord(f, 'Published'))

    allDocuments.value = [...authoringDocs, ...publishedDocs]
  } catch (error) {
    console.error('Failed to load documents:', error)
  } finally {
    isSearching.value = false
  }
}

// Search documents
const performSearch = () => {
  const query = searchQuery.value.trim().toLowerCase()

  if (query.length < 2) {
    searchResults.value = []
    showResults.value = false
    return
  }

  searchResults.value = allDocuments.value.filter(doc => {
    return (
      doc.documentCode.toLowerCase().includes(query) ||
      doc.title.toLowerCase().includes(query) ||
      doc.keywords?.some(k => k.toLowerCase().includes(query)) ||
      doc.summary?.toLowerCase().includes(query)
    )
  })

  showResults.value = true
}

const selectDocument = async (doc: DocumentRecord & { library: 'Authoring' | 'Published' }) => {
  selectedDocument.value = doc
  showResults.value = false
  searchQuery.value = doc.documentCode
  isEditMode.value = false
  selectedFile.value = null
}

const enterEditMode = () => {
  if (!selectedDocument.value) return

  editForm.value = {
    title: selectedDocument.value.title,
    keywords: selectedDocument.value.keywords?.join(', ') || '',
    summary: selectedDocument.value.summary || '',
    revision: selectedDocument.value.revision
  }

  isEditMode.value = true
}

const cancelEdit = () => {
  isEditMode.value = false
  editForm.value = {
    title: '',
    keywords: '',
    summary: '',
    revision: ''
  }
  selectedFile.value = null
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  showResults.value = false
  selectedDocument.value = null
  isEditMode.value = false
  selectedFile.value = null
}

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    const file = input.files[0]
    if (file) {
      selectedFile.value = file
    }
  }
}

const removeFile = () => {
  selectedFile.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const saveChanges = async () => {
  if (!selectedDocument.value) return

  try {
    const updates: Partial<DocumentRecord> = {
      title: editForm.value.title,
      keywords: editForm.value.keywords.split(',').map(k => k.trim()).filter(Boolean),
      summary: editForm.value.summary,
      revision: editForm.value.revision
    }

    const libraryName = selectedDocument.value.library === 'Authoring' ? 'DM-Authoring' : 'DM-Published'

    await updateDocument(selectedDocument.value.id, libraryName, updates)

    // Update local reference
    Object.assign(selectedDocument.value, updates)

    // Exit edit mode
    isEditMode.value = false
    selectedFile.value = null
  } catch (error) {
    console.error('Failed to save changes:', error)
  }
}

const isFormValid = computed(() => {
  return editForm.value.title.trim().length > 0
})
</script>

<template>
  <div class="container py-10 space-y-8">
    <!-- Header -->
    <div class="space-y-2">
      <h1 class="text-3xl font-bold tracking-tight">Edit Document</h1>
      <p class="text-muted-foreground">
        Search for a document by code, name, keywords, or summary to edit its metadata.
      </p>
    </div>

    <!-- Search Card -->
    <Card>
      <CardHeader>
        <CardTitle>Search Documents</CardTitle>
        <CardDescription>
          Search across both Authoring and Published libraries
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="relative">
          <Search class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            v-model="searchQuery"
            placeholder="Type document code, name, keywords, or summary..."
            class="pl-10 pr-10"
            @input="performSearch"
            @focus="performSearch"
          />
          <Button
            v-if="searchQuery"
            variant="ghost"
            size="icon"
            class="absolute right-1 top-1 h-8 w-8"
            @click="clearSearch"
          >
            <X class="h-4 w-4" />
          </Button>
        </div>

        <!-- Search Results Dropdown -->
        <div v-if="showResults && searchResults.length > 0" class="border rounded-md bg-card shadow-md max-h-80 overflow-y-auto">
          <div
            v-for="doc in searchResults"
            :key="`${doc.library}-${doc.id}`"
            class="flex items-center justify-between p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
            @click="selectDocument(doc)"
          >
            <div class="flex-1 min-w-0 space-y-1">
              <div class="flex items-center gap-2">
                <FileText class="h-4 w-4 text-muted-foreground shrink-0" />
                <span class="font-mono text-sm font-medium">{{ doc.documentCode }}</span>
                <Badge :variant="doc.library === 'Authoring' ? 'secondary' : 'default'">
                  {{ doc.library }}
                </Badge>
              </div>
              <p class="text-sm truncate">{{ doc.title }}</p>
              <p v-if="doc.summary" class="text-xs text-muted-foreground truncate">{{ doc.summary }}</p>
            </div>
          </div>
        </div>

        <!-- No Results -->
        <div v-if="showResults && searchResults.length === 0" class="text-center py-8 text-muted-foreground">
          <p class="text-sm">No documents found matching "{{ searchQuery }}"</p>
        </div>

        <!-- Loading State -->
        <div v-if="isSearching" class="text-center py-8 text-muted-foreground">
          <Loader2 class="h-6 w-6 animate-spin mx-auto mb-2" />
          <p class="text-sm">Loading documents...</p>
        </div>
      </CardContent>
    </Card>

    <!-- Document Details View -->
    <Card v-if="selectedDocument && !isEditMode">
      <CardHeader>
        <div class="flex items-start justify-between">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <CardTitle>{{ selectedDocument.title }}</CardTitle>
              <Badge :variant="selectedDocument.library === 'Authoring' ? 'secondary' : 'default'">
                {{ selectedDocument.library }}
              </Badge>
            </div>
            <CardDescription class="font-mono">{{ selectedDocument.documentCode }}</CardDescription>
          </div>
          <Button @click="enterEditMode">
            <Edit class="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label class="text-muted-foreground">Document Type</Label>
            <p class="text-sm">{{ selectedDocument.documentType }}</p>
          </div>
          <div class="space-y-2">
            <Label class="text-muted-foreground">Revision</Label>
            <p class="text-sm">{{ selectedDocument.revision }}</p>
          </div>
          <div class="space-y-2">
            <Label class="text-muted-foreground">Status</Label>
            <p class="text-sm">{{ selectedDocument.lifecycleStatus }}</p>
          </div>
          <div class="space-y-2">
            <Label class="text-muted-foreground">Owner</Label>
            <p class="text-sm">{{ selectedDocument.owner.displayName }}</p>
          </div>
        </div>

        <Separator />

        <div class="space-y-2">
          <Label class="text-muted-foreground">Keywords</Label>
          <div class="flex flex-wrap gap-2">
            <Badge v-for="keyword in selectedDocument.keywords" :key="keyword" variant="secondary">
              {{ keyword }}
            </Badge>
            <span v-if="!selectedDocument.keywords?.length" class="text-sm text-muted-foreground">No keywords</span>
          </div>
        </div>

        <div class="space-y-2">
          <Label class="text-muted-foreground">Summary</Label>
          <p class="text-sm">{{ selectedDocument.summary || 'No summary available' }}</p>
        </div>
      </CardContent>
    </Card>

    <!-- Edit Form -->
    <Card v-if="selectedDocument && isEditMode">
      <CardHeader>
        <div class="flex items-start justify-between">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <CardTitle>Edit Document</CardTitle>
              <Badge :variant="selectedDocument.library === 'Authoring' ? 'secondary' : 'default'">
                {{ selectedDocument.library }}
              </Badge>
            </div>
            <CardDescription class="font-mono">{{ selectedDocument.documentCode }}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent class="space-y-6">
        <!-- File Upload (Optional) -->
        <div class="space-y-2">
          <Label>Upload New Version (Optional)</Label>
          <div class="border-2 border-dashed rounded-lg p-4 hover:bg-muted/50 transition-colors">
            <input
              ref="fileInputRef"
              type="file"
              class="hidden"
              accept=".docx,.xlsx,.pdf"
              @change="handleFileSelect"
            />
            <div v-if="!selectedFile" class="text-center">
              <Button variant="outline" size="sm" @click="fileInputRef?.click()">
                <UploadCloud class="h-4 w-4 mr-2" />
                Choose File
              </Button>
              <p class="text-xs text-muted-foreground mt-2">DOCX, XLSX, PDF</p>
            </div>
            <div v-else class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <FileIcon class="h-5 w-5 text-primary" />
                <span class="text-sm">{{ selectedFile.name }}</span>
              </div>
              <Button variant="ghost" size="icon" @click="removeFile">
                <X class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        <!-- Metadata Fields -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <Label for="edit-title">Document Title</Label>
            <Input id="edit-title" v-model="editForm.title" />
          </div>

          <div class="space-y-2">
            <Label for="edit-revision">Revision</Label>
            <Input id="edit-revision" v-model="editForm.revision" />
          </div>
        </div>

        <div class="space-y-2">
          <Label for="edit-keywords">Keywords</Label>
          <Input
            id="edit-keywords"
            v-model="editForm.keywords"
            placeholder="safety, iso9001, maintenance"
          />
          <p class="text-xs text-muted-foreground">Separate keywords with commas</p>
        </div>

        <div class="space-y-2">
          <Label for="edit-summary">Summary</Label>
          <Textarea
            id="edit-summary"
            v-model="editForm.summary"
            placeholder="Brief description..."
            :rows="4"
          />
        </div>
      </CardContent>
      <CardFooter class="flex justify-end gap-4">
        <Button variant="outline" @click="cancelEdit">
          <X class="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button @click="saveChanges" :disabled="!isFormValid || isLoading">
          <Save class="h-4 w-4 mr-2" />
          {{ isLoading ? 'Saving...' : 'Save Changes' }}
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>
