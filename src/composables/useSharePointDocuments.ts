import { ref } from 'vue'
import sharePointService, { DOCUMENT_REGISTRY_FIELD_NAMES } from '@/services/sharePointService'
import { useDocumentsStore, type DocumentRecord } from '@/stores/documentsStore'
import { useAuthStore } from '@/stores/authStore'

/**
 * Composable for SharePoint Document Operations
 *
 * Provides methods to interact with SharePoint libraries and lists
 * Uses Microsoft Graph API through the sharePointService
 */

export function useSharePointDocuments() {
  const documentsStore = useDocumentsStore()
  const authStore = useAuthStore()
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const AUTHORING_LIBRARY = import.meta.env.VITE_SHAREPOINT_AUTHORING_LIBRARY || 'DM-Authoring'
  // We now use the Published Library as the Registry source
  const PUBLISHED_LIBRARY = import.meta.env.VITE_SHAREPOINT_PUBLISHED_LIBRARY || 'DM-Published'

  /**
   * Upload document to Authoring library
   */
  async function uploadDocument(file: File, metadata: Partial<DocumentRecord>) {
    isLoading.value = true
    error.value = null

    try {
      // Generate document code (simplified - in production, use backend logic)
      const documentCode = generateDocumentCode(metadata)

      // Prepare SharePoint metadata
      const spMetadata = {
        Title: metadata.title || file.name,
        [DOCUMENT_REGISTRY_FIELD_NAMES.documentCode]: documentCode,
        [DOCUMENT_REGISTRY_FIELD_NAMES.documentType]: metadata.documentType,
        [DOCUMENT_REGISTRY_FIELD_NAMES.processOrFunction]: metadata.processOrFunction,
        [DOCUMENT_REGISTRY_FIELD_NAMES.revision]: metadata.revision || '0',
        [DOCUMENT_REGISTRY_FIELD_NAMES.lifecycleStatus]: metadata.lifecycleStatus || 'Draft',
        [DOCUMENT_REGISTRY_FIELD_NAMES.owner]: metadata.owner?.displayName,
        [DOCUMENT_REGISTRY_FIELD_NAMES.approver]: metadata.approver?.displayName,
        [DOCUMENT_REGISTRY_FIELD_NAMES.keywords]: metadata.keywords?.join(';'),
        [DOCUMENT_REGISTRY_FIELD_NAMES.summary]: metadata.summary,
      }

      // Upload file to Authoring library
      console.log('[useSharePointDocuments] Uploading file to:', AUTHORING_LIBRARY)
      const uploadedFile = await sharePointService.uploadFile(
        AUTHORING_LIBRARY,
        file.name,
        file,
        spMetadata
      )

      console.log('[useSharePointDocuments] File uploaded:', uploadedFile)

      // Create DocumentRecord (local only now, as registry is the file itself)
      const newDocument: DocumentRecord = {
        id: uploadedFile.id,
        sharepointItemId: uploadedFile.id,
        documentCode,
        title: metadata.title || file.name,
        documentType: metadata.documentType || 'Other',
        processOrFunction: metadata.processOrFunction || '',
        revision: '0',
        lifecycleStatus: 'Draft',
        owner: metadata.owner || authStore.user!,
        approver: metadata.approver || authStore.user!,
        keywords: metadata.keywords || [],
        summary: metadata.summary || '',
        createdAt: uploadedFile.createdDateTime,
        updatedAt: uploadedFile.lastModifiedDateTime,
        createdBy: authStore.user!,
        updatedBy: authStore.user!,
        authoringFileUrl: uploadedFile.webUrl,
      }

      // Add to local store
      documentsStore.addDocument(newDocument)

      return newDocument
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to upload document'
      console.error('[useSharePointDocuments] Upload failed:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Load documents from SharePoint (Published Library)
   */
  async function loadDocuments() {
    isLoading.value = true
    error.value = null

    try {
      console.log('[useSharePointDocuments] Loading documents from Published Library:', PUBLISHED_LIBRARY)

      // Get all files from DM-Published with metadata
      const files = await sharePointService.getFilesFromLibrary(PUBLISHED_LIBRARY)

      console.log('[useSharePointDocuments] Loaded files:', files.length)

      // Map to DocumentRecord
      const documents: DocumentRecord[] = files.map((file) => {
        const fields = file.fields || {}
        return {
          id: file.id,
          sharepointItemId: file.id,
          documentCode: String(fields[DOCUMENT_REGISTRY_FIELD_NAMES.documentCode] || ''),
          title: String(fields.Title || file.name),
          documentType: String(fields[DOCUMENT_REGISTRY_FIELD_NAMES.documentType] || 'Other') as DocumentRecord['documentType'],
          processOrFunction: String(fields[DOCUMENT_REGISTRY_FIELD_NAMES.processOrFunction] || ''),
          departmentOrSite: String(fields[DOCUMENT_REGISTRY_FIELD_NAMES.departmentOrSite] || ''),
          revision: String(fields[DOCUMENT_REGISTRY_FIELD_NAMES.revision] || '0'),
          lifecycleStatus: String(fields[DOCUMENT_REGISTRY_FIELD_NAMES.lifecycleStatus] || 'Published') as DocumentRecord['lifecycleStatus'],
          owner: {
            id: String(fields[DOCUMENT_REGISTRY_FIELD_NAMES.ownerId] || ''),
            displayName: String(fields[DOCUMENT_REGISTRY_FIELD_NAMES.owner] || ''),
            email: String(fields[DOCUMENT_REGISTRY_FIELD_NAMES.ownerEmail] || ''),
          },
          approver: {
            id: String(fields[DOCUMENT_REGISTRY_FIELD_NAMES.approverId] || ''),
            displayName: String(fields[DOCUMENT_REGISTRY_FIELD_NAMES.approver] || ''),
            email: String(fields[DOCUMENT_REGISTRY_FIELD_NAMES.approverEmail] || ''),
          },
          effectiveDate: fields[DOCUMENT_REGISTRY_FIELD_NAMES.effectiveDate] as string | null,
          nextReviewDate: fields[DOCUMENT_REGISTRY_FIELD_NAMES.nextReviewDate] as string | null,
          supersedesDocumentId: fields[DOCUMENT_REGISTRY_FIELD_NAMES.supersedesDocumentId] as string | null,
          supersededByDocumentId: fields[DOCUMENT_REGISTRY_FIELD_NAMES.supersededByDocumentId] as string | null,
          keywords: String(fields[DOCUMENT_REGISTRY_FIELD_NAMES.keywords] || '').split(';').filter(Boolean),
          summary: String(fields[DOCUMENT_REGISTRY_FIELD_NAMES.summary] || ''),
          createdAt: file.createdDateTime,
          updatedAt: file.lastModifiedDateTime,
          createdBy: {
            id: '',
            displayName: 'System',
            email: '',
          },
          updatedBy: {
            id: '',
            displayName: 'System',
            email: '',
          },
          publishedFileUrl: file.webUrl,
          authoringFileUrl: '', // Published docs might not link back to authoring directly here
          archiveFileUrl: '',
        }
      })

      // Update store
      documentsStore.setDocuments(documents)
      documentsStore.setPagination(1, 25, documents.length)

      return documents
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load documents'
      console.error('[useSharePointDocuments] Load failed:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Load a single document by its ID from a specific library
   */
  async function loadDocumentById(documentId: string, libraryName: string): Promise<DocumentRecord | null> {
    isLoading.value = true
    error.value = null

    try {
      // getFilesFromLibrary already fetches files with expanded fields
      const files = await sharePointService.getFilesFromLibrary(libraryName)
      const file = files.find(f => f.id === documentId)

      if (!file) {
        return null
      }

      const fields = file.fields || {}
      return {
        id: file.id,
        sharepointItemId: file.id,
        documentCode: String(fields[DOCUMENT_REGISTRY_FIELD_NAMES.documentCode] || ''),
        title: String(fields.Title || file.name),
        documentType: String(fields[DOCUMENT_REGISTRY_FIELD_NAMES.documentType] || 'Other') as DocumentRecord['documentType'],
        processOrFunction: String(fields[DOCUMENT_REGISTRY_FIELD_NAMES.processOrFunction] || ''),
        departmentOrSite: String(fields[DOCUMENT_REGISTRY_FIELD_NAMES.departmentOrSite] || ''),
        revision: String(fields[DOCUMENT_REGISTRY_FIELD_NAMES.revision] || '0'),
        lifecycleStatus: String(fields[DOCUMENT_REGISTRY_FIELD_NAMES.lifecycleStatus] || 'Draft') as DocumentRecord['lifecycleStatus'],
        owner: {
          id: String(fields[DOCUMENT_REGISTRY_FIELD_NAMES.ownerId] || ''),
          displayName: String(fields[DOCUMENT_REGISTRY_FIELD_NAMES.owner] || ''),
          email: String(fields[DOCUMENT_REGISTRY_FIELD_NAMES.ownerEmail] || ''),
        },
        approver: {
          id: String(fields[DOCUMENT_REGISTRY_FIELD_NAMES.approverId] || ''),
          displayName: String(fields[DOCUMENT_REGISTRY_FIELD_NAMES.approver] || ''),
          email: String(fields[DOCUMENT_REGISTRY_FIELD_NAMES.approverEmail] || ''),
        },
        effectiveDate: fields[DOCUMENT_REGISTRY_FIELD_NAMES.effectiveDate] as string | null,
        nextReviewDate: fields[DOCUMENT_REGISTRY_FIELD_NAMES.nextReviewDate] as string | null,
        supersedesDocumentId: fields[DOCUMENT_REGISTRY_FIELD_NAMES.supersedesDocumentId] as string | null,
        supersededByDocumentId: fields[DOCUMENT_REGISTRY_FIELD_NAMES.supersededByDocumentId] as string | null,
        keywords: String(fields[DOCUMENT_REGISTRY_FIELD_NAMES.keywords] || '').split(';').filter(Boolean),
        summary: String(fields[DOCUMENT_REGISTRY_FIELD_NAMES.summary] || ''),
        createdAt: file.createdDateTime,
        updatedAt: file.lastModifiedDateTime,
        createdBy: {
          id: '',
          displayName: 'System',
          email: '',
        },
        updatedBy: {
          id: '',
          displayName: 'System',
          email: '',
        },
        authoringFileUrl: libraryName === AUTHORING_LIBRARY ? file.webUrl : '',
        publishedFileUrl: libraryName === PUBLISHED_LIBRARY ? file.webUrl : '',
        archiveFileUrl: '',
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : `Failed to load document ${documentId}`
      console.error('[useSharePointDocuments] Load single document failed:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update document metadata in a specific library
   */
  async function updateDocument(
    documentId: string,
    libraryName: string,
    updates: Partial<DocumentRecord>
  ) {
    isLoading.value = true
    error.value = null

    try {
      const spUpdates: Record<string, unknown> = {}

      if (updates.title) spUpdates.Title = updates.title
      if (updates.keywords) spUpdates[DOCUMENT_REGISTRY_FIELD_NAMES.keywords] = updates.keywords.join(';')
      if (updates.summary) spUpdates[DOCUMENT_REGISTRY_FIELD_NAMES.summary] = updates.summary
      if (updates.revision) spUpdates[DOCUMENT_REGISTRY_FIELD_NAMES.revision] = updates.revision
      if (updates.lifecycleStatus) spUpdates[DOCUMENT_REGISTRY_FIELD_NAMES.lifecycleStatus] = updates.lifecycleStatus
      if (updates.documentCode) spUpdates[DOCUMENT_REGISTRY_FIELD_NAMES.documentCode] = updates.documentCode
      if (updates.documentType) spUpdates[DOCUMENT_REGISTRY_FIELD_NAMES.documentType] = updates.documentType
      if (updates.processOrFunction) spUpdates[DOCUMENT_REGISTRY_FIELD_NAMES.processOrFunction] = updates.processOrFunction
      if (updates.departmentOrSite) spUpdates[DOCUMENT_REGISTRY_FIELD_NAMES.departmentOrSite] = updates.departmentOrSite


      const libraryId = await sharePointService.getLibraryId(libraryName)
      await sharePointService.updateFileMetadata(libraryId, documentId, spUpdates)

      // Update local store (optional, as loadDocuments is usually called after this)
      // documentsStore.updateDocument(documentId, updates)

      console.log(`[useSharePointDocuments] Document ${documentId} updated in ${libraryName}:`, updates)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update document metadata'
      console.error('[useSharePointDocuments] Update metadata failed:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**

  /**
   * Generate document code (simplified logic)
   * In production, this should be done by backend with proper sequence numbering
   */
  function generateDocumentCode(metadata: Partial<DocumentRecord>): string {
    const typePrefix = getTypePrefix(metadata.documentType || 'Other')
    const processPrefix = (metadata.processOrFunction || 'GEN').substring(0, 2).toUpperCase()
    const timestamp = Date.now().toString().slice(-6)

    return `${typePrefix}-${processPrefix}-${timestamp}`
  }

  /**
   * Get document type prefix
   */
  function getTypePrefix(type: string): string {
    const prefixes: Record<string, string> = {
      'Standard': 'STD',
      'Procedure': 'PROC',
      'SOP': 'SOP',
      'Policy': 'POL',
      'WorkInstruction': 'WI',
      'Manual': 'MAN',
      'Form': 'FORM',
      'Other': 'DOC',
    }

    return prefixes[type] || 'DOC'
  }

  return {
    isLoading,
    error,
    uploadDocument,
    loadDocuments,
    loadDocumentById,
    updateDocument,
  }
}
