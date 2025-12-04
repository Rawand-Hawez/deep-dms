import type { DocumentRecord, UserRef } from '@/stores/documentsStore'

/**
 * Mock Data Service
 * Provides sample data for development and testing without backend API
 */

// Mock users
export const mockUsers = {
  owner1: {
    id: 'user-1',
    displayName: 'John Doe',
    email: 'john.doe@example.com',
  },
  owner2: {
    id: 'user-2',
    displayName: 'Jane Smith',
    email: 'jane.smith@example.com',
  },
  approver1: {
    id: 'user-3',
    displayName: 'Michael Brown',
    email: 'michael.brown@example.com',
  },
  approver2: {
    id: 'user-4',
    displayName: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
  },
} satisfies Record<string, UserRef>

// Mock documents
// Updated to match DPM-[LOC]-[DEPT]-[TYPE]-xxx format
export const mockDocuments: DocumentRecord[] = [
  {
    id: 'doc-1',
    sharepointItemId: 'sp-item-1',
    documentCode: 'DPM-HQ-QMS-SOP-001', // Was SOP-QA-001
    title: 'Quality Assurance Standard Operating Procedure',
    documentType: 'SOP',
    processOrFunction: 'Quality Assurance',
    departmentOrSite: 'QMS',
    revision: 'Rev 3',
    lifecycleStatus: 'Published',
    owner: mockUsers.owner1,
    approver: mockUsers.approver1,
    effectiveDate: '2024-01-15',
    nextReviewDate: '2025-01-15',
    supersedesDocumentId: null,
    supersededByDocumentId: null,
    keywords: ['quality', 'inspection', 'testing', 'compliance'],
    summary: 'Standard operating procedure for quality assurance processes including inspection protocols, testing procedures, and compliance requirements.',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    createdBy: mockUsers.owner1,
    updatedBy: mockUsers.owner1,
    authoringFileUrl: 'https://sharepoint.example.com/authoring/SOP-QA-001.docx',
    publishedFileUrl: 'https://sharepoint.example.com/published/SOP-QA-001.pdf',
  },
  {
    id: 'doc-2',
    sharepointItemId: 'sp-item-2',
    documentCode: 'DPM-HQ-ENG-PRO-015', // Was PRO-ENG-015
    title: 'Engineering Change Management Procedure',
    documentType: 'Procedure',
    processOrFunction: 'Engineering',
    departmentOrSite: 'Engineering',
    revision: 'Rev 2',
    lifecycleStatus: 'UnderReview',
    owner: mockUsers.owner2,
    approver: mockUsers.approver2,
    effectiveDate: null,
    nextReviewDate: '2025-06-01',
    supersedesDocumentId: null,
    supersededByDocumentId: null,
    keywords: ['engineering', 'change management', 'ECO', 'approval'],
    summary: 'Procedure for managing engineering changes including change requests, impact analysis, approval workflow, and implementation.',
    createdAt: '2024-02-10T09:00:00Z',
    updatedAt: '2024-11-20T16:45:00Z',
    createdBy: mockUsers.owner2,
    updatedBy: mockUsers.owner2,
    authoringFileUrl: 'https://sharepoint.example.com/authoring/PRO-ENG-015.docx',
  },
  {
    id: 'doc-3',
    sharepointItemId: 'sp-item-3',
    documentCode: 'DPM-HQ-SAF-MAN-100', // Was MAN-SAF-100
    title: 'Health and Safety Manual',
    documentType: 'Manual',
    processOrFunction: 'Safety',
    departmentOrSite: 'All Sites',
    revision: 'Rev 5',
    lifecycleStatus: 'Published',
    owner: mockUsers.owner1,
    approver: mockUsers.approver1,
    effectiveDate: '2023-09-01',
    nextReviewDate: '2024-09-01',
    supersedesDocumentId: null,
    supersededByDocumentId: null,
    keywords: ['safety', 'health', 'PPE', 'emergency', 'training'],
    summary: 'Comprehensive health and safety manual covering all safety protocols, emergency procedures, PPE requirements, and training guidelines.',
    createdAt: '2023-08-01T08:00:00Z',
    updatedAt: '2023-08-25T11:20:00Z',
    createdBy: mockUsers.owner1,
    updatedBy: mockUsers.owner1,
    authoringFileUrl: 'https://sharepoint.example.com/authoring/MAN-SAF-100.docx',
    publishedFileUrl: 'https://sharepoint.example.com/published/MAN-SAF-100.pdf',
  },
  {
    id: 'doc-4',
    sharepointItemId: 'sp-item-4',
    documentCode: 'DPM-S1-PROD-WNS-042', // Was WI-PROD-042
    title: 'Assembly Line Work Instruction',
    documentType: 'WorkInstruction',
    processOrFunction: 'Production',
    departmentOrSite: 'Assembly',
    revision: 'Rev 1',
    lifecycleStatus: 'Draft',
    owner: mockUsers.owner2,
    approver: mockUsers.approver2,
    effectiveDate: null,
    nextReviewDate: null,
    supersedesDocumentId: null,
    supersededByDocumentId: null,
    keywords: ['assembly', 'production', 'workflow', 'workstation'],
    summary: 'Detailed work instruction for assembly line operations including step-by-step procedures, quality checkpoints, and safety notes.',
    createdAt: '2024-11-15T13:30:00Z',
    updatedAt: '2024-11-28T09:15:00Z',
    createdBy: mockUsers.owner2,
    updatedBy: mockUsers.owner2,
    authoringFileUrl: 'https://sharepoint.example.com/authoring/WI-PROD-042.docx',
  },
  {
    id: 'doc-5',
    sharepointItemId: 'sp-item-5',
    documentCode: 'DPM-HQ-ITS-POL-001', // Was POL-IT-008
    title: 'Information Security Policy',
    documentType: 'Policy',
    processOrFunction: 'IT',
    departmentOrSite: 'IT Department',
    revision: 'Rev 4',
    lifecycleStatus: 'Approved',
    owner: mockUsers.owner1,
    approver: mockUsers.approver1,
    effectiveDate: null,
    nextReviewDate: '2025-03-01',
    supersedesDocumentId: null,
    supersededByDocumentId: null,
    keywords: ['security', 'IT', 'data protection', 'access control', 'compliance'],
    summary: 'Policy document outlining information security requirements, access controls, data protection measures, and compliance obligations.',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-02-05T15:30:00Z',
    createdBy: mockUsers.owner1,
    updatedBy: mockUsers.owner1,
    authoringFileUrl: 'https://sharepoint.example.com/authoring/POL-IT-008.docx',
  },
  {
    id: 'doc-6',
    sharepointItemId: 'sp-item-6',
    documentCode: 'DPM-HQ-ENV-STD-020', // Was STD-ENV-020
    title: 'Environmental Management Standard',
    documentType: 'Standard',
    processOrFunction: 'Environmental',
    departmentOrSite: 'All Sites',
    revision: 'Rev 2',
    lifecycleStatus: 'Published',
    owner: mockUsers.owner2,
    approver: mockUsers.approver2,
    effectiveDate: '2024-06-01',
    nextReviewDate: '2025-06-01',
    supersedesDocumentId: null,
    supersededByDocumentId: null,
    keywords: ['environment', 'ISO 14001', 'waste management', 'sustainability'],
    summary: 'Environmental management standard covering waste management, emissions control, resource conservation, and ISO 14001 compliance.',
    createdAt: '2024-04-10T09:00:00Z',
    updatedAt: '2024-05-20T14:00:00Z',
    createdBy: mockUsers.owner2,
    updatedBy: mockUsers.owner2,
    authoringFileUrl: 'https://sharepoint.example.com/authoring/STD-ENV-020.docx',
    publishedFileUrl: 'https://sharepoint.example.com/published/STD-ENV-020.pdf',
  },
]

/**
 * Get all mock documents
 */
export function getMockDocuments(): DocumentRecord[] {
  return mockDocuments
}

/**
 * Get a single mock document by ID
 */
export function getMockDocumentById(id: string): DocumentRecord | undefined {
  return mockDocuments.find(doc => doc.id === id)
}

/**
 * Filter mock documents by lifecycle status
 */
export function getMockDocumentsByStatus(status: string): DocumentRecord[] {
  return mockDocuments.filter(doc => doc.lifecycleStatus === status)
}