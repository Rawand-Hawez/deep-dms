import { ref } from 'vue'
import { useDocumentsStore, type DocumentRecord } from '@/stores/documentsStore'
import httpClient from '@/services/httpClient'

/**
 * Composable for Backend API Document Operations
 *
 * Replaces direct SharePoint access with Backend-for-Frontend (BFF) API calls.
 * Uses the centralized httpClient for authentication and request handling.
 */

export function useDocumentsApi() {
  const documentsStore = useDocumentsStore()
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Helper to extract error message
  const getErrorMessage = (err: any): string => {
    if (err?.data && typeof err.data === 'object' && 'error' in err.data) {
      return err.data.error
    }
    if (err?.data && typeof err.data === 'object' && 'message' in err.data) {
      return err.data.message
    }
    return err.message || 'An unexpected error occurred'
  }

  /**
   * Create new document (upload file + metadata)
   */
  async function createDocument(
    file: File,
    metadata: Partial<DocumentRecord>
  ): Promise<DocumentRecord> {
    isLoading.value = true
    error.value = null

    try {
      // Use uploadFile from httpClient. 
      // The backend expects 'metadata' as a JSON string field.
      const response = await httpClient.uploadFile<{ document: DocumentRecord }>(
        '/api/documents',
        file,
        {
          metadata: JSON.stringify(metadata)
        }
      )

      const document = response.document

      // Add to local store
      documentsStore.addDocument(document)

      return document
    } catch (err: any) {
      error.value = getErrorMessage(err)
      console.error('[useDocumentsApi] Create failed:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get all documents with optional filters
   */
  async function getDocuments(
    filters?: {
      lifecycleStatus?: string
      documentType?: string
      search?: string
    },
    pagination?: {
      page?: number
      pageSize?: number
    }
  ): Promise<{
    items: DocumentRecord[]
    total: number
    page: number
    pageSize: number
  }> {
    isLoading.value = true
    error.value = null

    try {
      const params = new URLSearchParams()
      if (filters?.lifecycleStatus) params.append('status', filters.lifecycleStatus)
      if (filters?.documentType) params.append('documentType', filters.documentType)
      if (filters?.search) params.append('search', filters.search)
      if (pagination?.page) params.append('page', pagination.page.toString())
      if (pagination?.pageSize) params.append('pageSize', pagination.pageSize.toString())

      const queryString = params.toString()
      const endpoint = `/api/documents${queryString ? `?${queryString}` : ''}`

      // httpClient returns the parsed body directly
      // Backend returns: { items: [], total: 0, page: 1, pageSize: 25 }
      const result = await httpClient.get<{
        items: DocumentRecord[]
        total: number
        page: number
        pageSize: number
      }>(endpoint)

      // Validate response structure
      if (!result || typeof result.total !== 'number') {
        throw new Error('Invalid response from API: missing required fields')
      }

      // Map backend response to internal structure
      const mappedResult = {
        items: result.items || [],
        total: result.total,
        page: result.page,
        pageSize: result.pageSize
      }

      // Update store
      documentsStore.setDocuments(mappedResult.items)
      documentsStore.setPagination(mappedResult.page, mappedResult.pageSize, mappedResult.total)

      return mappedResult
    } catch (err: any) {
      error.value = getErrorMessage(err)
      console.error('[useDocumentsApi] Load failed:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get single document by ID
   */
  async function getDocumentById(id: string): Promise<DocumentRecord> {
    isLoading.value = true
    error.value = null

    try {
      const response = await httpClient.get<{ document: DocumentRecord }>(`/api/documents/${id}`)
      const document = response.document

      // Update store
      documentsStore.setSelectedDocument(document)

      return document
    } catch (err: any) {
      error.value = getErrorMessage(err)
      console.error('[useDocumentsApi] Load single document failed:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update document metadata
   */
  async function updateDocument(
    id: string,
    updates: Partial<DocumentRecord>
  ): Promise<DocumentRecord> {
    isLoading.value = true
    error.value = null

    try {
      const response = await httpClient.put<{ document: DocumentRecord }>(
        `/api/documents/${id}`,
        updates
      )
      const document = response.document

      // Update store
      documentsStore.updateDocument(id, updates)
      if (documentsStore.selectedDocument?.id === id) {
        documentsStore.setSelectedDocument(document)
      }

      return document
    } catch (err: any) {
      error.value = getErrorMessage(err)
      console.error('[useDocumentsApi] Update failed:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Request approval: Draft → UnderReview
   */
  async function requestApproval(id: string, notes?: string): Promise<DocumentRecord> {
    isLoading.value = true
    error.value = null

    try {
      const response = await httpClient.post<{ document: DocumentRecord }>(
        `/api/documents/${id}/request-approval`,
        { notes: notes || '' }
      )

      const document = response.document

      // Update store
      documentsStore.updateDocument(id, { lifecycleStatus: 'UnderReview' })

      return document
    } catch (err: any) {
      error.value = getErrorMessage(err)
      console.error('[useDocumentsApi] Request approval failed:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Approve document: UnderReview → Approved
   */
  async function approveDocument(
    id: string,
    approvalData: {
      revision: string
      effectiveDate: string
      nextReviewDate: string
    }
  ): Promise<DocumentRecord> {
    isLoading.value = true
    error.value = null

    try {
      const response = await httpClient.post<{ document: DocumentRecord }>(
        `/api/documents/${id}/approve`,
        approvalData
      )
      const document = response.document

      // Update store
      documentsStore.updateDocument(id, {
        lifecycleStatus: 'Approved',
        revision: approvalData.revision,
        effectiveDate: approvalData.effectiveDate,
        nextReviewDate: approvalData.nextReviewDate,
      })

      return document
    } catch (err: any) {
      error.value = getErrorMessage(err)
      console.error('[useDocumentsApi] Approve failed:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Publish document: Approved → Published
   * If pdfFile is provided, it uploads it.
   * If pdfFile is NOT provided, it triggers backend-driven PDF generation.
   */
  async function publishDocument(id: string, pdfFile?: File): Promise<DocumentRecord> {
    isLoading.value = true
    error.value = null

    try {
      let response: { document: DocumentRecord }

      if (pdfFile) {
        // Manual Upload
        response = await httpClient.uploadFile<{ document: DocumentRecord }>(
          `/api/documents/${id}/publish`,
          pdfFile
        )
      } else {
        // Backend-driven generation
        // Backend strictly requires 'multipart/form-data', so we send an empty FormData
        const formData = new FormData()
        // Some backends require at least one field to recognize multipart
        formData.append('autoConvert', 'true') 
        
        response = await httpClient.request<{ document: DocumentRecord }>(
          `/api/documents/${id}/publish?autoConvert=true`,
          {
            method: 'POST',
            body: formData
            // Headers will be handled by browser (setting boundary)
          }
        )
      }

      const document = response.document

      // Update store
      documentsStore.updateDocument(id, {
        lifecycleStatus: 'Published',
        publishedFileUrl: document.publishedFileUrl,
      })

      return document
    } catch (err: any) {
      error.value = getErrorMessage(err)
      console.error('[useDocumentsApi] Publish failed:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Mark document as obsolete
   */
  async function markObsolete(
    id: string,
    data: {
      supersededByDocumentId?: string
      notes?: string
    }
  ): Promise<DocumentRecord> {
    isLoading.value = true
    error.value = null

    try {
      const response = await httpClient.post<{ document: DocumentRecord }>(
        `/api/documents/${id}/mark-obsolete`,
        data
      )
      const document = response.document

      // Update store
      documentsStore.updateDocument(id, {
        lifecycleStatus: 'Obsolete',
        supersededByDocumentId: data.supersededByDocumentId,
      })

      return document
    } catch (err: any) {
      error.value = getErrorMessage(err)
      console.error('[useDocumentsApi] Mark obsolete failed:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete document
   */
  async function deleteDocument(id: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      await httpClient.delete(`/api/documents/${id}`)

      // Update store
      documentsStore.removeDocument(id)
    } catch (err: any) {
      error.value = getErrorMessage(err)
      console.error('[useDocumentsApi] Delete failed:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    createDocument,
    getDocuments,
    getDocumentById,
    updateDocument,
    requestApproval,
    approveDocument,
    publishDocument,
    markObsolete,
    deleteDocument,
  }
}