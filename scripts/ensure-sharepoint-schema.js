// Device-code helper to create missing fields on the SharePoint Document Registry list.
// Usage:
//   1) Ensure env vars are set (see requiredEnv below, typically from .env).
//   2) npm run ensure:sharepoint-schema
//
// Auth: Device Code flow. You need Sites.ReadWrite.All delegated consent and permission
//       to edit the target list in the target site.

import 'dotenv/config'
import { PublicClientApplication, LogLevel } from '@azure/msal-node'

const requiredEnv = [
  'VITE_AZURE_TENANT_ID',
  'VITE_AZURE_CLIENT_ID',
  'VITE_SHAREPOINT_SITE_URL',
  'VITE_SHAREPOINT_REGISTRY_LIST',
]

for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`Missing env: ${key}`)
    process.exit(1)
  }
}

const tenantId = process.env.VITE_AZURE_TENANT_ID
const clientId = process.env.VITE_AZURE_CLIENT_ID
const siteUrl = process.env.VITE_SHAREPOINT_SITE_URL
const registryListName = process.env.VITE_SHAREPOINT_REGISTRY_LIST
const scopes = (process.env.VITE_SHAREPOINT_SCOPES || 'Sites.ReadWrite.All,User.Read')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)

const GRAPH_API_ENDPOINT = 'https://graph.microsoft.com/v1.0'
const authority = `https://login.microsoftonline.com/${tenantId}`

const FIELD_NAMES = {
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
}

const columnDefinitions = [
  { name: FIELD_NAMES.documentCode, text: { maxLength: 255 } },
  { name: FIELD_NAMES.sharePointItemId, text: { maxLength: 255 } },
  {
    name: FIELD_NAMES.documentType,
    choice: {
      choices: ['Standard', 'Procedure', 'SOP', 'Policy', 'WorkInstruction', 'Manual', 'Form', 'Other'],
      displayAs: 'dropDownMenu',
    },
  },
  {
    name: FIELD_NAMES.lifecycleStatus,
    choice: {
      choices: ['Draft', 'UnderReview', 'Approved', 'Published', 'Obsolete'],
      displayAs: 'dropDownMenu',
    },
  },
  { name: FIELD_NAMES.processOrFunction, text: { maxLength: 255 } },
  { name: FIELD_NAMES.departmentOrSite, text: { maxLength: 255 } },
  { name: FIELD_NAMES.revision, text: { maxLength: 50 } },
  { name: FIELD_NAMES.owner, text: { maxLength: 255 } },
  { name: FIELD_NAMES.ownerId, text: { maxLength: 255 } },
  { name: FIELD_NAMES.ownerEmail, text: { maxLength: 320 } },
  { name: FIELD_NAMES.approver, text: { maxLength: 255 } },
  { name: FIELD_NAMES.approverId, text: { maxLength: 255 } },
  { name: FIELD_NAMES.approverEmail, text: { maxLength: 320 } },
  { name: FIELD_NAMES.effectiveDate, dateTime: { format: 'dateOnly' } },
  { name: FIELD_NAMES.nextReviewDate, dateTime: { format: 'dateOnly' } },
  { name: FIELD_NAMES.supersedesDocumentId, text: { maxLength: 255 } },
  { name: FIELD_NAMES.supersededByDocumentId, text: { maxLength: 255 } },
  { name: FIELD_NAMES.keywords, text: { allowMultipleLines: false, maxLength: 1024 } },
  { name: FIELD_NAMES.summary, text: { allowMultipleLines: true, maxLength: 2048 } },
  { name: FIELD_NAMES.authoringFileUrl, text: { maxLength: 1024 } },
  { name: FIELD_NAMES.publishedFileUrl, text: { maxLength: 1024 } },
  { name: FIELD_NAMES.archiveFileUrl, text: { maxLength: 1024 } },
]

const msalClient = new PublicClientApplication({
  auth: { clientId, authority },
  system: { loggerOptions: { logLevel: LogLevel.Info } },
})

const tokenResponse = await msalClient.acquireTokenByDeviceCode({
  scopes,
  deviceCodeCallback: (response) => {
    console.log(response.message)
  },
})

if (!tokenResponse?.accessToken) {
  console.error('Failed to acquire token')
  process.exit(1)
}

const accessToken = tokenResponse.accessToken

async function graphRequest(path, options = {}) {
  const response = await fetch(`${GRAPH_API_ENDPOINT}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Graph error ${response.status}: ${text}`)
  }

  if (response.status === 204) return null

  return response.json()
}

async function getSiteId() {
  const url = new URL(siteUrl)
  const hostname = url.hostname
  const sitePath = url.pathname

  const site = await graphRequest(`/sites/${hostname}:${sitePath}`)
  return site.id
}

async function getListId(siteId, listName) {
  const lists = await graphRequest(`/sites/${siteId}/lists`)
  const list = lists.value.find(
    (l) => l.displayName === listName || l.displayName?.toLowerCase() === listName.toLowerCase()
  )

  if (!list) {
    throw new Error(`List '${listName}' not found`)
  }

  return list.id
}

async function ensureColumns(siteId, listId) {
  const existing = await graphRequest(`/sites/${siteId}/lists/${listId}/columns`)
  const existingNames = new Set(existing.value.map((c) => c.name?.toLowerCase()))

  for (const col of columnDefinitions) {
    if (existingNames.has(col.name.toLowerCase())) {
      console.log(`✔ Column exists: ${col.name}`)
      continue
    }

    await graphRequest(`/sites/${siteId}/lists/${listId}/columns`, {
      method: 'POST',
      body: JSON.stringify(col),
    })
    console.log(`+ Created column: ${col.name}`)
  }
}

async function main() {
  console.log('Ensuring Document Registry schema...')
  const siteId = await getSiteId()
  const listId = await getListId(siteId, registryListName)
  await ensureColumns(siteId, listId)
  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
