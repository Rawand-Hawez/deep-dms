import { defineStore } from 'pinia'
import { ref } from 'vue'

export type LifecycleStatus = 'Draft' | 'UnderReview' | 'Approved' | 'Published' | 'Obsolete'

export type DocumentType =
  | 'Standard'
  | 'Procedure'
  | 'SOP'
  | 'Policy'
  | 'WorkInstruction'
  | 'Manual'
  | 'Form'
  | 'Other'

export interface UserRef {
  id: string
  displayName: string
  email: string
}

export interface DocumentRecord {
  id: string
  sharepointItemId: string
  documentCode: string
  title: string
  documentType: DocumentType
  processOrFunction: string
  departmentOrSite?: string
  revision: string
  lifecycleStatus: LifecycleStatus
  owner: UserRef
  approver: UserRef
  effectiveDate?: string | null
  nextReviewDate?: string | null
  supersedesDocumentId?: string | null
  supersededByDocumentId?: string | null
  keywords: string[]
  summary: string
  createdAt: string
  updatedAt: string
  createdBy: UserRef
  updatedBy: UserRef
  authoringFileUrl?: string
  publishedFileUrl?: string
  archiveFileUrl?: string
}

export const useDocumentsStore = defineStore('documents', () => {
  // State
  const documents = ref<DocumentRecord[]>([])
  const selectedDocument = ref<DocumentRecord | null>(null)
  const currentPage = ref(1)
  const pageSize = ref(25)
  const totalDocuments = ref(0)

  // Actions
  function setDocuments(docs: DocumentRecord[]) {
    documents.value = docs
  }

  function setSelectedDocument(doc: DocumentRecord | null) {
    selectedDocument.value = doc
  }

  function setPagination(page: number, size: number, total: number) {
    currentPage.value = page
    pageSize.value = size
    totalDocuments.value = total
  }

  function addDocument(doc: DocumentRecord) {
    documents.value.unshift(doc)
  }

  function updateDocument(id: string, updates: Partial<DocumentRecord>) {
    const index = documents.value.findIndex((doc) => doc.id === id)
    if (index !== -1) {
      documents.value[index] = { ...documents.value[index], ...updates } as DocumentRecord
    }
    if (selectedDocument.value?.id === id) {
      selectedDocument.value = { ...selectedDocument.value, ...updates } as DocumentRecord
    }
  }

  function removeDocument(id: string) {
    documents.value = documents.value.filter((doc) => doc.id !== id)
    if (selectedDocument.value?.id === id) {
      selectedDocument.value = null
    }
  }

  function loadMockData() {
    // Lazy import to avoid circular dependencies
    import('@/services/mockData').then(({ getMockDocuments }) => {
      const mockDocs = getMockDocuments()
      setDocuments(mockDocs)
      setPagination(1, 25, mockDocs.length)
      console.log('[documentsStore] Loaded mock data:', mockDocs.length, 'documents')
    })
  }

  return {
    // State
    documents,
    selectedDocument,
    currentPage,
    pageSize,
    totalDocuments,
    // Actions
    setDocuments,
    setSelectedDocument,
    setPagination,
    addDocument,
    updateDocument,
    removeDocument,
    loadMockData,
  }
})
