<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useDocumentsApi } from '@/composables/useDocumentsApi'
import httpClient from '@/services/httpClient'
import type { DocumentRecord } from '@/stores/documentsStore'
import {
  Card,
  CardContent,
  Button,
  Input,
  Label,
  Textarea,
  Separator,
} from '@/components/ui'
import { Upload, FileText, Loader2, Hash } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const { createDocument, isLoading, error } = useDocumentsApi()

// Form state
const formData = ref({
  title: '',
  documentType: 'Policy' as DocumentRecord['documentType'],
  processOrFunction: 'Quality',
  departmentOrSite: 'Headquarters',
  revision: '00',
  keywords: '',
  summary: '',
  approverEmail: 'Himeshc@outlook.com', // Default for demo
})

const selectedFile = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const nextSequence = ref<number | null>(null)
const manualSequence = ref<string>('') // For manual override
const sequenceLoading = ref(false)
const sequenceError = ref<string | null>(null)

// Document type abbreviations
const typeAbbreviations: Record<string, string> = {
  Standard: 'STD',
  Procedure: 'PRC',
  SOP: 'SOP',
  Policy: 'POL',
  WorkInstruction: 'WI',
  Manual: 'MAN',
  Form: 'FRM',
  Other: 'OTH',
}

// Location abbreviations
const locationAbbreviations: Record<string, string> = {
  Headquarters: 'HQ',
  'Site 1': 'S1',
  'Site 2': 'S2',
  'Site 3': 'S3',
  'All Sites': 'AS',
}

// Process/Function options with abbreviations
const processOptions: Record<string, string> = {
  Quality: 'QMS',
  Engineering: 'ENG',
  IT: 'ITS',
  Manufacturing: 'MAN',
  HR: 'HRS',
  Finance: 'FIN',
  Logistics: 'LOG',
  Safety: 'STY',
  Regulatory: 'REG',
}

// Generate department abbreviation from process/function
const getDepartmentAbbreviation = (processOrFunction: string): string => {
  return processOptions[processOrFunction] || processOrFunction.substring(0, 3).toUpperCase() || 'XXX'
}

// Computed document code pattern (without sequence)
const documentCodePattern = computed(() => {
  const company = 'DPM'
  const location = locationAbbreviations[formData.value.departmentOrSite] || 'HQ'
  const department = getDepartmentAbbreviation(formData.value.processOrFunction)
  const type = typeAbbreviations[formData.value.documentType] || 'OTH'

  return {
    company,
    location,
    department,
    type,
    prefix: `${company}-${location}-${department}-${type}`
  }
})

// Computed document code preview
const documentCodePreview = computed(() => {
  const sequence = nextSequence.value !== null
    ? String(nextSequence.value).padStart(3, '0')
    : (manualSequence.value ? manualSequence.value.padStart(3, '0') : 'xxx')

  return `${documentCodePattern.value.prefix}-${sequence}`
})

// Watch for changes to document code pattern and reset sequence
watch(
  () => documentCodePattern.value.prefix,
  (newPrefix, oldPrefix) => {
    if (oldPrefix && newPrefix !== oldPrefix) {
      console.log('[DocumentNewView] Pattern changed, resetting sequence')
      nextSequence.value = null
      manualSequence.value = ''
      sequenceError.value = null
    }
  }
)

// Fetch next sequence number for the current document code pattern
const fetchNextSequence = async () => {
  sequenceLoading.value = true
  sequenceError.value = null
  // Don't clear manual sequence immediately to allow user to keep their value if retry fails
  
  try {
    const pattern = documentCodePattern.value
    const queryParams = new URLSearchParams({
      location: pattern.location,
      department: pattern.department,
      type: pattern.type
    })

    const url = `/api/documents/next-sequence?${queryParams}`

    console.log('[DocumentNewView] Fetching sequence from:', url)

    const data = await httpClient.get<{ nextSequence: number }>(url)
    nextSequence.value = data.nextSequence
    // Sync manual input with padding
    manualSequence.value = String(data.nextSequence).padStart(3, '0')

    console.log('[DocumentNewView] Received sequence:', data.nextSequence)
  } catch (err) {
    console.error('Failed to fetch next sequence:', err)
    sequenceError.value = 'Unable to fetch sequence. You may enter it manually.'
    nextSequence.value = null
    // We keep manualSequence as is, or if empty, let user type
  } finally {
    sequenceLoading.value = false
  }
}

// File selection
const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    selectedFile.value = input.files[0] || null
  }
}

const removeFile = () => {
  selectedFile.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

// Form validation
const isFormValid = computed(() => {
  const validSequence = nextSequence.value !== null || (manualSequence.value.length > 0 && !isNaN(Number(manualSequence.value)))
  
  return (
    formData.value.title.trim() !== '' &&
    formData.value.documentType &&
    selectedFile.value !== null &&
    validSequence
  )
})

// Submit handler
const handleSubmit = async () => {
  if (!isFormValid.value) return

      try {
        const metadata: Partial<DocumentRecord> = {
          // ... other fields
          // documentCode: `${documentCodePattern.value.prefix}-${String(finalSequence).padStart(3, '0')}`, 
          // Backend generates code.
          title: formData.value.title,      documentType: formData.value.documentType,
      processOrFunction: formData.value.processOrFunction || undefined,
      // Map full name to abbreviation code for backend validation
      departmentOrSite: locationAbbreviations[formData.value.departmentOrSite] || formData.value.departmentOrSite,
      keywords: formData.value.keywords
        ? formData.value.keywords.split(',').map(k => k.trim()).filter(Boolean)
        : [],
      summary: formData.value.summary || '',
      owner: authStore.user || undefined,
      approver: formData.value.approverEmail ? {
        id: 'manual-approver',
        displayName: formData.value.approverEmail.split('@')[0] || 'Unknown',
        email: formData.value.approverEmail
      } : (authStore.user || undefined),
    }

    const newDocument = await createDocument(selectedFile.value!, metadata)

    // Success - redirect to document details
    router.push(`/documents/${newDocument.id}`)
  } catch (err) {
    console.error('Failed to create document:', err)
  }
}

// Cancel handler
const handleCancel = () => {
  router.back()
}
</script>

<template>
  <div class="container py-10 max-w-[1600px] mx-auto space-y-8">
    <!-- Header -->
    <div class="flex items-start justify-between">
      <div class="space-y-1">
        <h1 class="text-3xl font-bold tracking-tight text-slate-900">Create New Document</h1>
        <p class="text-sm text-slate-600">
          Upload a document source file and provide metadata
        </p>
      </div>
    </div>

    <!-- Error Messages -->
    <Card v-if="error" class="border-red-200 bg-red-50">
      <CardContent class="pt-6">
        <p class="text-sm text-red-800">{{ error }}</p>
      </CardContent>
    </Card>

    <Card v-if="sequenceError" class="border-amber-200 bg-amber-50">
      <CardContent class="pt-6">
        <p class="text-sm text-amber-900">{{ sequenceError }}</p>
      </CardContent>
    </Card>

    <!-- Main Form Card -->
    <Card>
      <CardContent class="pt-6 space-y-6">
        <!-- Source File (Full Width) -->
        <div class="space-y-2">
          <Label for="file-upload">
            Source File <span class="text-red-500">*</span>
          </Label>
          <input
            id="file-upload"
            ref="fileInputRef"
            type="file"
            accept=".docx,.xlsx,.doc,.xls"
            class="hidden"
            @change="handleFileSelect"
          />

          <div v-if="!selectedFile" class="space-y-3">
            <Button
              type="button"
              variant="outline"
              @click="fileInputRef?.click()"
              class="w-full gap-2"
            >
              <Upload class="h-4 w-4" />
              Choose File
            </Button>
            <p class="text-xs text-slate-500 text-center">
              Supported: .docx, .xlsx (max 100MB)
            </p>
          </div>

          <div v-else class="rounded-lg border border-slate-200 bg-slate-100 p-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <FileText class="h-5 w-5 text-slate-600" />
                <div class="space-y-0.5">
                  <p class="text-sm font-medium text-slate-900">{{ selectedFile.name }}</p>
                  <p class="text-xs text-slate-600">
                    {{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                @click="removeFile"
              >
                Remove
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        <!-- Generated Document Code (1/3) + Document Title (2/3) -->
        <div class="grid grid-cols-3 gap-4">
          <div class="col-span-1 space-y-2">
            <Label for="document-code">
              Generated Document Code
            </Label>
            <div class="flex h-10 items-center rounded-md border border-input bg-slate-50 px-3 py-2">
              <span class="font-mono text-sm text-slate-700">
                {{ documentCodePreview }}
              </span>
            </div>
            <p class="text-xs text-slate-500">
              Auto-generated (read-only)
            </p>
          </div>

          <div class="col-span-2 space-y-2">
            <Label for="title">
              Document Title <span class="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              v-model="formData.title"
              placeholder="e.g., Information Security Policy"
              required
            />
          </div>
        </div>

        <!-- Document Type (1/3) + Department/Site (1/3) + Process/Function (1/3) -->
        <div class="grid grid-cols-3 gap-4">
          <div class="space-y-2">
            <Label for="document-type">
              Document Type <span class="text-red-500">*</span>
            </Label>
            <select
              id="document-type"
              v-model="formData.documentType"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="Standard">Standard</option>
              <option value="Procedure">Procedure</option>
              <option value="SOP">SOP</option>
              <option value="Policy">Policy</option>
              <option value="WorkInstruction">Work Instruction</option>
              <option value="Manual">Manual</option>
              <option value="Form">Form</option>
              <option value="Other">Other</option>
            </select>
            <p class="text-xs text-slate-500">
              Code: {{ typeAbbreviations[formData.documentType] }}
            </p>
          </div>

          <div class="space-y-2">
            <Label for="department">Department/Site <span class="text-red-500">*</span></Label>
            <select
              id="department"
              v-model="formData.departmentOrSite"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="Headquarters">Headquarters</option>
              <option value="Site 1">Site 1</option>
              <option value="Site 2">Site 2</option>
              <option value="Site 3">Site 3</option>
              <option value="All Sites">All Sites</option>
            </select>
            <p class="text-xs text-slate-500">
              Code: {{ locationAbbreviations[formData.departmentOrSite] }}
            </p>
          </div>

          <div class="space-y-2">
            <Label for="process">Process/Function <span class="text-red-500">*</span></Label>
            <select
              id="process"
              v-model="formData.processOrFunction"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="Quality">Quality</option>
              <option value="Engineering">Engineering</option>
              <option value="IT">IT</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Logistics">Logistics</option>
              <option value="Safety">Safety</option>
              <option value="Regulatory">Regulatory</option>
            </select>
            <p class="text-xs text-slate-500">
              Code: {{ getDepartmentAbbreviation(formData.processOrFunction) }}
            </p>
          </div>
        </div>

        <!-- Sequence (2/3) + Revision (1/3) -->
        <div class="grid grid-cols-3 gap-4">
          <div class="col-span-2 space-y-2">
            <Label for="sequence">
              Sequence Number
              <span v-if="sequenceError" class="text-xs text-amber-600 ml-2">(Manual Override Enabled)</span>
            </Label>
            <div class="flex gap-2">
              <Input
                id="sequence"
                v-model="manualSequence"
                :readonly="!sequenceError"
                :disabled="!sequenceError && nextSequence === null"
                placeholder="Click Generate ->"
                @blur="manualSequence = manualSequence.padStart(3, '0')"
                :class="sequenceError ? 'font-mono bg-slate-50 border-amber-300 focus-visible:ring-amber-200' : (!sequenceError && nextSequence === null) ? 'font-mono bg-slate-50 cursor-not-allowed opacity-70' : 'font-mono bg-slate-50'"
              />
              <Button 
                type="button" 
                variant="default" 
                @click="fetchNextSequence" 
                :disabled="sequenceLoading"
                class="whitespace-nowrap min-w-[160px] h-10 px-4 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center"
              >
                <Loader2 v-if="sequenceLoading" class="h-3.5 w-3.5 animate-spin mr-2" />
                <Hash v-else class="h-3.5 w-3.5 mr-2" />
                {{ sequenceLoading ? 'Generating...' : 'Generate Sequence' }}
              </Button>
            </div>
            <p class="text-xs text-slate-500">
              {{ sequenceError ? 'Backend unavailable. Enter sequence manually.' : 'Click button to generate unique sequence from server.' }}
            </p>
          </div>

          <div class="space-y-2">
            <Label for="revision">Revision</Label>
            <Input
              id="revision"
              v-model="formData.revision"
              placeholder="00"
              maxlength="5"
            />
            <p class="text-xs text-slate-500">
              e.g., 00, 01, A, B
            </p>
          </div>
        </div>

        <!-- Approver Email -->
        <div class="space-y-2">
          <Label for="approver">Approver Email</Label>
          <Input
            id="approver"
            type="email"
            v-model="formData.approverEmail"
            placeholder="approver@example.com"
          />
          <p class="text-xs text-slate-500">
            The person who will receive the approval notification (Power Automate).
          </p>
        </div>

        <!-- Keywords (Full Width) -->
        <div class="space-y-2">
          <Label for="keywords">Keywords</Label>
          <Input
            id="keywords"
            v-model="formData.keywords"
            placeholder="security, policy, compliance"
          />
          <p class="text-xs text-slate-500">
            Comma-separated keywords for searchability
          </p>
        </div>

        <!-- Summary (Full Width, Textarea) -->
        <div class="space-y-2">
          <Label for="summary">Summary</Label>
          <Textarea
            id="summary"
            v-model="formData.summary"
            placeholder="Brief description of the document content and purpose..."
            rows="6"
          />
          <p class="text-xs text-slate-500">
            Provide a concise overview of the document
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- Action Buttons -->
    <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
      <Button variant="outline" @click="handleCancel" :disabled="isLoading">
        Cancel
      </Button>
      <Button
        @click="handleSubmit"
        :disabled="!isFormValid || isLoading"
        class="gap-2"
      >
        <Loader2 v-if="isLoading" class="h-4 w-4 animate-spin" />
        <Upload v-else class="h-4 w-4" />
        {{ isLoading ? 'Creating...' : 'Create Document' }}
      </Button>
    </div>
  </div>
</template>
