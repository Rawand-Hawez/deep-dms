import msalClient from './msalClient'

/**
 * SharePoint Service
 *
 * Direct integration with SharePoint Online using Microsoft Graph API
 * Uses MSAL tokens for authentication
 *
 * IMPORTANT: This is a simplified implementation that bypasses the backend API.
 * For production, consider using a backend for better security and business logic.
 */

const GRAPH_API_ENDPOINT = 'https://graph.microsoft.com/v1.0'
const SHAREPOINT_SITE_URL = import.meta.env.VITE_SHAREPOINT_SITE_URL || ''
const SHAREPOINT_SCOPES = (import.meta.env.VITE_SHAREPOINT_SCOPES || '')
  .split(',')
  .map((s: string) => s.trim())
const REGISTRY_LIST_NAME = import.meta.env.VITE_SHAREPOINT_REGISTRY_LIST || 'DM-DocumentRegistry'
const AUTHORING_LIBRARY_NAME = import.meta.env.VITE_SHAREPOINT_AUTHORING_LIBRARY || 'DM-Authoring'
const PUBLISHED_LIBRARY_NAME = import.meta.env.VITE_SHAREPOINT_PUBLISHED_LIBRARY || 'DM-Published'

export const DOCUMENT_REGISTRY_FIELD_NAMES = {
  documentCode: 'dm_document_code',
  sharePointItemId: 'dm_sharepoint_item_id',
  documentType: 'dm_document_type',
  processOrFunction: 'dm_process_or_function',
  departmentOrSite: 'dm_department_or_site',
  revision: 'dm_revision',
  lifecycleStatus: 'dm_lifecycle_status',
  owner: 'dm_owner',
  ownerId: 'dm_owner_id',
  ownerEmail: 'dm_owner_email',
  approver: 'dm_approver',
  approverId: 'dm_approver_id',
  approverEmail: 'dm_approver_email',
  effectiveDate: 'dm_effective_date',
  nextReviewDate: 'dm_next_review_date',
  supersedesDocumentId: 'dm_supersedes_document_id',
  supersededByDocumentId: 'dm_superseded_by_document_id',
  keywords: 'dm_keywords',
  summary: 'dm_summary',
  authoringFileUrl: 'dm_authoring_file_url',
  publishedFileUrl: 'dm_published_file_url',
  archiveFileUrl: 'dm_archive_file_url',
} as const

type ColumnDefinition = {
  name: string
  displayName?: string
  text?: {
    allowMultipleLines?: boolean
    appendChangesToExistingText?: boolean
    maxLength?: number
  }
  choice?: {
    choices: string[]
    displayAs?: 'dropDownMenu' | 'radioButtons'
    allowTextEntry?: boolean
  }
  dateTime?: {
    displayAs?: 'default' | 'friendly'
    format?: 'dateOnly' | 'dateTime'
  }
  boolean?: Record<string, never>
}

const documentRegistryColumns: ColumnDefinition[] = [
  {
    name: DOCUMENT_REGISTRY_FIELD_NAMES.documentCode,
    displayName: DOCUMENT_REGISTRY_FIELD_NAMES.documentCode,
    text: { maxLength: 255 },
  },
  {
    name: DOCUMENT_REGISTRY_FIELD_NAMES.sharePointItemId,
    displayName: DOCUMENT_REGISTRY_FIELD_NAMES.sharePointItemId,
    text: { maxLength: 255 },
  },
  {
    name: DOCUMENT_REGISTRY_FIELD_NAMES.documentType,
    displayName: DOCUMENT_REGISTRY_FIELD_NAMES.documentType,
    choice: {
      choices: ['Standard', 'Procedure', 'SOP', 'Policy', 'WorkInstruction', 'Manual', 'Form', 'Other'],
      displayAs: 'dropDownMenu',
    },
  },
  {
    name: DOCUMENT_REGISTRY_FIELD_NAMES.lifecycleStatus,
    displayName: DOCUMENT_REGISTRY_FIELD_NAMES.lifecycleStatus,
    choice: {
      choices: ['Draft', 'UnderReview', 'Approved', 'Published', 'Obsolete'],
      displayAs: 'dropDownMenu',
    },
  },
  {
    name: DOCUMENT_REGISTRY_FIELD_NAMES.processOrFunction,
    displayName: DOCUMENT_REGISTRY_FIELD_NAMES.processOrFunction,
    text: { maxLength: 255 },
  },
  {
    name: DOCUMENT_REGISTRY_FIELD_NAMES.departmentOrSite,
    displayName: DOCUMENT_REGISTRY_FIELD_NAMES.departmentOrSite,
    text: { maxLength: 255 },
  },
  {
    name: DOCUMENT_REGISTRY_FIELD_NAMES.revision,
    displayName: DOCUMENT_REGISTRY_FIELD_NAMES.revision,
    text: { maxLength: 50 },
  },
  {
    name: DOCUMENT_REGISTRY_FIELD_NAMES.owner,
    displayName: DOCUMENT_REGISTRY_FIELD_NAMES.owner,
    text: { maxLength: 255 },
  },
  {
    name: DOCUMENT_REGISTRY_FIELD_NAMES.ownerId,
    displayName: DOCUMENT_REGISTRY_FIELD_NAMES.ownerId,
    text: { maxLength: 255 },
  },
  {
    name: DOCUMENT_REGISTRY_FIELD_NAMES.ownerEmail,
    displayName: DOCUMENT_REGISTRY_FIELD_NAMES.ownerEmail,
    text: { maxLength: 255 },
  },
  {
    name: DOCUMENT_REGISTRY_FIELD_NAMES.approver,
    displayName: DOCUMENT_REGISTRY_FIELD_NAMES.approver,
    text: { maxLength: 255 },
  },
  {
    name: DOCUMENT_REGISTRY_FIELD_NAMES.approverId,
    displayName: DOCUMENT_REGISTRY_FIELD_NAMES.approverId,
    text: { maxLength: 255 },
  },
  {
    name: DOCUMENT_REGISTRY_FIELD_NAMES.approverEmail,
    displayName: DOCUMENT_REGISTRY_FIELD_NAMES.approverEmail,
    text: { maxLength: 255 },
  },
  {
    name: DOCUMENT_REGISTRY_FIELD_NAMES.effectiveDate,
    displayName: DOCUMENT_REGISTRY_FIELD_NAMES.effectiveDate,
    dateTime: { format: 'dateOnly' },
  },
  {
    name: DOCUMENT_REGISTRY_FIELD_NAMES.nextReviewDate,
    displayName: DOCUMENT_REGISTRY_FIELD_NAMES.nextReviewDate,
    dateTime: { format: 'dateOnly' },
  },
  {
    name: DOCUMENT_REGISTRY_FIELD_NAMES.supersedesDocumentId,
    displayName: DOCUMENT_REGISTRY_FIELD_NAMES.supersedesDocumentId,
    text: { maxLength: 255 },
  },
  {
    name: DOCUMENT_REGISTRY_FIELD_NAMES.supersededByDocumentId,
    displayName: DOCUMENT_REGISTRY_FIELD_NAMES.supersededByDocumentId,
    text: { maxLength: 255 },
  },
  {
    name: DOCUMENT_REGISTRY_FIELD_NAMES.keywords,
    displayName: DOCUMENT_REGISTRY_FIELD_NAMES.keywords,
    text: { allowMultipleLines: false, maxLength: 255 },
  },
  {
    name: DOCUMENT_REGISTRY_FIELD_NAMES.summary,
    displayName: DOCUMENT_REGISTRY_FIELD_NAMES.summary,
    text: { allowMultipleLines: true },
  },
  {
    name: DOCUMENT_REGISTRY_FIELD_NAMES.authoringFileUrl,
    displayName: DOCUMENT_REGISTRY_FIELD_NAMES.authoringFileUrl,
    text: { maxLength: 255 },
  },
  {
    name: DOCUMENT_REGISTRY_FIELD_NAMES.publishedFileUrl,
    displayName: DOCUMENT_REGISTRY_FIELD_NAMES.publishedFileUrl,
    text: { maxLength: 255 },
  },
  {
    name: DOCUMENT_REGISTRY_FIELD_NAMES.archiveFileUrl,
    displayName: DOCUMENT_REGISTRY_FIELD_NAMES.archiveFileUrl,
    text: { maxLength: 255 },
  },
] as const

export interface SharePointFile {
  id: string
  name: string
  webUrl: string
  createdDateTime: string
  lastModifiedDateTime: string
  size: number
  fields?: Record<string, unknown>
}

export interface SharePointListItem {
  id: string
  fields: Record<string, unknown>
  webUrl: string
  createdDateTime: string
  lastModifiedDateTime: string
}

class SharePointService {
  private siteId: string | null = null

  /**
   * Get SharePoint access token with proper scopes
   */
  private async getSharePointToken(): Promise<string> {
    const account = msalClient.getAccount()
    if (!account) {
      throw new Error('No account found. Please sign in.')
    }

    try {
      // Try to get token silently
      const response = await msalClient.getInstance().acquireTokenSilent({
        scopes: SHAREPOINT_SCOPES,
        account,
      })
      return response.accessToken
    } catch (error) {
      // If silent fails, try interactive
      await msalClient.getInstance().acquireTokenRedirect({
        scopes: SHAREPOINT_SCOPES,
        account,
      })
      throw new Error('Redirecting for SharePoint permissions...')
    }
  }

  /**
   * Make Graph API request
   */
  private async graphRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getSharePointToken()

    const response = await fetch(`${GRAPH_API_ENDPOINT}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }))
      throw new Error(error.error?.message || `Graph API error: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Get SharePoint site ID from URL
   */
  async getSiteId(): Promise<string> {
    if (this.siteId) return this.siteId

    // Extract hostname and site path from URL
    const url = new URL(SHAREPOINT_SITE_URL)
    const hostname = url.hostname
    const sitePath = url.pathname

    const response = await this.graphRequest<{ id: string }>(
      `/sites/${hostname}:${sitePath}`
    )

    this.siteId = response.id
    return this.siteId
  }

  /**
   * Get document library (drive) ID by name
   */
  async getLibraryId(libraryName: string): Promise<string> {
    const siteId = await this.getSiteId()

    const response = await this.graphRequest<{ value: { id: string; name: string }[] }>(
      `/sites/${siteId}/drives`
    )

    const library = response.value.find(
      drive => drive.name === libraryName || drive.name.toLowerCase() === libraryName.toLowerCase()
    )

    if (!library) {
      throw new Error(`Library '${libraryName}' not found`)
    }

    return library.id
  }

  /**
   * Upload file to SharePoint library
   */
  async uploadFile(
    libraryName: string,
    fileName: string,
    file: File,
    metadata?: Record<string, unknown>
  ): Promise<SharePointFile> {
    const libraryId = await this.getLibraryId(libraryName)
    const token = await this.getSharePointToken()

    // For files < 4MB, use simple upload
    if (file.size < 4 * 1024 * 1024) {
      const response = await fetch(
        `${GRAPH_API_ENDPOINT}/drives/${libraryId}/root:/${fileName}:/content`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': file.type || 'application/octet-stream',
          },
          body: file,
        }
      )

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const uploadedFile = await response.json()

      // Update metadata if provided
      if (metadata && uploadedFile.id) {
        await this.updateFileMetadata(libraryId, uploadedFile.id, metadata)
      }

      return uploadedFile
    } else {
      // For larger files, use upload session
      return this.uploadLargeFile(libraryId, fileName, file, metadata)
    }
  }

  /**
   * Upload large file using upload session (for files > 4MB)
   */
  private async uploadLargeFile(
    libraryId: string,
    fileName: string,
    file: File,
    metadata?: Record<string, unknown>
  ): Promise<SharePointFile> {
    // Create upload session
    const session = await this.graphRequest<{ uploadUrl: string }>(
      `/drives/${libraryId}/root:/${fileName}:/createUploadSession`,
      {
        method: 'POST',
        body: JSON.stringify({
          item: {
            '@microsoft.graph.conflictBehavior': 'rename',
          },
        }),
      }
    )

    // Upload file in chunks
    const chunkSize = 320 * 1024 // 320 KB chunks
    const totalChunks = Math.ceil(file.size / chunkSize)

    let uploadedFile: SharePointFile | null = null

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      const chunk = file.slice(start, end)

      const response = await fetch(session.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Length': chunk.size.toString(),
          'Content-Range': `bytes ${start}-${end - 1}/${file.size}`,
        },
        body: chunk,
      })

      if (response.status === 201 || response.status === 200) {
        uploadedFile = await response.json()
      } else if (!response.ok && response.status !== 202) {
        throw new Error(`Chunk upload failed: ${response.statusText}`)
      }
    }

    if (!uploadedFile) {
      throw new Error('Upload completed but file info not returned')
    }

    // Update metadata if provided
    if (metadata && uploadedFile.id) {
      await this.updateFileMetadata(libraryId, uploadedFile.id, metadata)
    }

    return uploadedFile
  }

  /**
   * Update file metadata (SharePoint columns)
   */
  async updateFileMetadata(
    libraryId: string,
    itemId: string,
    metadata: Record<string, unknown>
  ): Promise<void> {
    await this.graphRequest(
      `/drives/${libraryId}/items/${itemId}/listItem/fields`,
      {
        method: 'PATCH',
        body: JSON.stringify(metadata),
      }
    )
  }

  /**
   * Get files from a library
   */
  async getFilesFromLibrary(libraryName: string): Promise<SharePointFile[]> {
    const libraryId = await this.getLibraryId(libraryName)

    // Expand listItem and fields to get custom columns
    const response = await this.graphRequest<{ value: any[] }>(
      `/drives/${libraryId}/root/children?expand=listItem($expand=fields)`
    )

    // Map response to SharePointFile but attach the expanded fields to the object for internal use
    return response.value.map(file => ({
      ...file,
      fields: file.listItem?.fields || {}
    }))
  }

  /**
   * Get list items (for DocumentRegistry)
   */
  async getListItems(listName: string): Promise<SharePointListItem[]> {
    const siteId = await this.getSiteId()
    const listId = await this.getListId(listName, siteId)

    const itemsResponse = await this.graphRequest<{ value: SharePointListItem[] }>(
      `/sites/${siteId}/lists/${listId}/items?expand=fields`
    )

    return itemsResponse.value
  }

  /**
   * Create list item (for DocumentRegistry)
   */
  async createListItem(
    listName: string,
    fields: Record<string, unknown>
  ): Promise<SharePointListItem> {
    const siteId = await this.getSiteId()
    const listId = await this.getListId(listName, siteId)

    // Create item
    const response = await this.graphRequest<SharePointListItem>(
      `/sites/${siteId}/lists/${listId}/items`,
      {
        method: 'POST',
        body: JSON.stringify({ fields }),
      }
    )

    return response
  }

  /**
   * Update list item
   */
  async updateListItem(
    listName: string,
    itemId: string,
    fields: Record<string, unknown>
  ): Promise<void> {
    const siteId = await this.getSiteId()
    const listId = await this.getListId(listName, siteId)

    await this.graphRequest(
      `/sites/${siteId}/lists/${listId}/items/${itemId}/fields`,
      {
        method: 'PATCH',
        body: JSON.stringify(fields),
      }
    )
  }

  /**
   * Delete file from library
   */
  async deleteFile(libraryName: string, itemId: string): Promise<void> {
    const libraryId = await this.getLibraryId(libraryName)

    await this.graphRequest(
      `/drives/${libraryId}/items/${itemId}`,
      {
        method: 'DELETE',
      }
    )
  }

  /**
   * Move file between libraries
   */
  async moveFile(
    sourceLibraryName: string,
    itemId: string,
    targetLibraryName: string,
    newFileName?: string
  ): Promise<SharePointFile> {
    const sourceLibraryId = await this.getLibraryId(sourceLibraryName)
    const targetLibraryId = await this.getLibraryId(targetLibraryName)

    console.log(`[SharePoint] Moving file from '${sourceLibraryName}' (${sourceLibraryId}) to '${targetLibraryName}' (${targetLibraryId})`)

    // To move to the root of the target library, we need the ID of the root folder of that drive
    const targetRootResponse = await this.graphRequest<{ id: string }>(
      `/drives/${targetLibraryId}/root`
    )
    const targetRootFolderId = targetRootResponse.id

    const payload: any = {
      parentReference: {
        driveId: targetLibraryId,
        id: targetRootFolderId,
      },
    }
    if (newFileName) {
      payload.name = newFileName
    }

    const response = await this.graphRequest<SharePointFile>(
      `/drives/${sourceLibraryId}/items/${itemId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }
    )

    return response
  }

  /**
   * Ensure Document Registry list has required columns (kebab-case, no spaces)
   */
  async ensureDocumentRegistrySchema(listName: string = REGISTRY_LIST_NAME): Promise<void> {
    const siteId = await this.getSiteId()
    const listId = await this.getListId(listName, siteId)

    // Fetch existing columns to avoid duplicates
    const existingColumns = await this.graphRequest<{ value: { name: string }[] }>(
      `/sites/${siteId}/lists/${listId}/columns`
    )
    const existing = new Set(existingColumns.value.map(col => col.name.toLowerCase()))

    for (const column of documentRegistryColumns) {
      if (existing.has(column.name.toLowerCase())) {
        continue
      }

      try {
        await this.graphRequest(
          `/sites/${siteId}/lists/${listId}/columns`,
          {
            method: 'POST',
            body: JSON.stringify(column),
          }
        )
        console.info('[SharePoint] Created column', column.name)
      } catch (error) {
        console.error('[SharePoint] Failed to create column', column.name, error)
        throw error
      }
    }
  }

  /**
   * Get list ID by name (case-insensitive)
   */
  private async getListId(listName: string, siteId?: string): Promise<string> {
    const resolvedSiteId = siteId || (await this.getSiteId())
    const listsResponse = await this.graphRequest<{ value: { id: string; displayName: string }[] }>(
      `/sites/${resolvedSiteId}/lists`
    )

    const list = listsResponse.value.find(
      l => l.displayName === listName || l.displayName.toLowerCase() === listName.toLowerCase()
    )

    if (!list) {
      throw new Error(`List '${listName}' not found`)
    }

    return list.id
  }

  /**
   * List columns on the Document Registry (for diagnostics)
   */
  async listDocumentRegistryColumns(listName: string = REGISTRY_LIST_NAME): Promise<
    { id: string; name: string; columnGroup?: string; type: string }[]
  > {
    const siteId = await this.getSiteId()
    const listId = await this.getListId(listName, siteId)

    const columns = await this.graphRequest<{
      value: { id: string; name: string; columnGroup?: string; columnType?: string }[]
    }>(`/sites/${siteId}/lists/${listId}/columns`)

    return columns.value.map(col => ({
      id: col.id,
      name: col.name,
      columnGroup: col.columnGroup,
      type: col.columnType || '',
    }))
  }

  /**
   * Fetch the next sequence number from the SharePoint Published Library AND Authoring Library
   */
  async fetchNextSequence(prefix: string): Promise<string> {
    console.log(`[SharePoint] Calculating next sequence for prefix: ${prefix}`)
    try {
      let maxSeq = 0
      
      // 1. Check Published Library (The new "Registry")
      try {
        const items = await this.getFilesFromLibrary(PUBLISHED_LIBRARY_NAME)
        console.log(`[SharePoint] Found ${items.length} items in Published Library`)
        
        items.forEach(item => {
          // Priority 1: Check the custom column 'dm_document_code'
          const metadataCode = String(item.fields?.[DOCUMENT_REGISTRY_FIELD_NAMES.documentCode] || '')
          
          // Priority 2: Fallback to filename parsing if metadata is missing
          const nameCode = item.name.replace(/\.[^/.]+$/, '') // remove extension

          // Use metadata code if it exists and matches prefix, otherwise check filename
          const codeToCheck = (metadataCode && metadataCode.startsWith(prefix)) ? metadataCode : nameCode

          if (codeToCheck.startsWith(prefix)) {
            const suffix = codeToCheck.replace(prefix, '')
            const match = suffix.match(/^(\d{3})/)
            if (match && match[1]) {
              const seq = parseInt(match[1], 10)
              console.log(`[SharePoint] Found matching published item: ${item.name}, Code: ${codeToCheck}, seq: ${seq}`)
              if (!isNaN(seq) && seq > maxSeq) {
                maxSeq = seq
              }
            }
          }
        })
      } catch (error) {
        console.warn('[SharePoint] Failed to read Published Library:', error)
      }

      // 2. Check Authoring Library Files
      try {
        const files = await this.getFilesFromLibrary(AUTHORING_LIBRARY_NAME)
        console.log(`[SharePoint] Found ${files.length} files in Authoring Library`)
        
        files.forEach(file => {
          // Priority 1: Check the custom column 'dm_document_code'
          const metadataCode = String(file.fields?.[DOCUMENT_REGISTRY_FIELD_NAMES.documentCode] || '')
          
          // Priority 2: Fallback to filename parsing if metadata is missing
          const nameCode = file.name.replace(/\.[^/.]+$/, '') // remove extension

          // Use metadata code if it exists and matches prefix, otherwise check filename
          const codeToCheck = (metadataCode && metadataCode.startsWith(prefix)) ? metadataCode : nameCode

          if (codeToCheck.startsWith(prefix)) {
            const suffix = codeToCheck.replace(prefix, '')
            const match = suffix.match(/^(\d{3})/)
            if (match && match[1]) {
              const seq = parseInt(match[1], 10)
              console.log(`[SharePoint] Found matching file: ${file.name}, Code: ${codeToCheck}, seq: ${seq}`)
              if (!isNaN(seq) && seq > maxSeq) {
                maxSeq = seq
              }
            }
          }
        })
      } catch (libError) {
        console.warn('[SharePoint] Failed to check Authoring Library for sequence:', libError)
      }
      
      const nextSeq = maxSeq + 1
      const result = nextSeq.toString().padStart(3, '0')
      console.log(`[SharePoint] Max sequence found: ${maxSeq}, Next sequence: ${result}`)
      return result
    } catch (error) {
      console.error('[SharePoint] Failed to fetch next sequence:', error)
      throw error
    }
  }

  /**
   * DEBUG ONLY: Get matching items for a prefix from both Published and Authoring Libraries
   */
  async getDebugMatchingItems(prefix: string) {
    const debugInfo = {
      registryListName: PUBLISHED_LIBRARY_NAME,
      authoringLibraryName: AUTHORING_LIBRARY_NAME,
      registryMatches: [] as { title: string; code: string; seq: number }[],
      libraryMatches: [] as { name: string; seq: number }[]
    }

    try {
      // 1. Check Published (Registry)
      try {
        const items = await this.getFilesFromLibrary(PUBLISHED_LIBRARY_NAME)
        items.forEach(item => {
          const metadataCode = String(item.fields?.[DOCUMENT_REGISTRY_FIELD_NAMES.documentCode] || '')
          const nameCode = item.name.replace(/\.[^/.]+$/, '')
          const codeToCheck = (metadataCode && metadataCode.startsWith(prefix)) ? metadataCode : nameCode

          if (codeToCheck.startsWith(prefix)) {
            const suffix = codeToCheck.replace(prefix, '')
            const match = suffix.match(/^(\d{3})/)
            if (match && match[1]) {
              const seq = parseInt(match[1], 10)
              debugInfo.registryMatches.push({ title: item.name, code: codeToCheck, seq })
            }
          }
        })
      } catch (e) { console.warn('Debug Published fetch failed', e) }

      // 2. Check Library
      try {
        const files = await this.getFilesFromLibrary(AUTHORING_LIBRARY_NAME)
        files.forEach(file => {
          const metadataCode = String(file.fields?.[DOCUMENT_REGISTRY_FIELD_NAMES.documentCode] || '')
          const nameCode = file.name.replace(/\.[^/.]+$/, '')
          const codeToCheck = (metadataCode && metadataCode.startsWith(prefix)) ? metadataCode : nameCode

          if (codeToCheck.startsWith(prefix)) {
            const suffix = codeToCheck.replace(prefix, '')
            const match = suffix.match(/^(\d{3})/)
            if (match && match[1]) {
              const seq = parseInt(match[1], 10)
              debugInfo.libraryMatches.push({ name: `${file.name} (${codeToCheck})`, seq })
            }
          }
        })
      } catch (e) { console.warn('Debug Library fetch failed', e) }

    } catch (error) {
      console.error('getDebugMatchingItems failed', error)
    }
    
    return debugInfo
  }
}

// Export singleton instance
export const sharePointService = new SharePointService()
export default sharePointService
