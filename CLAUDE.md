# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Deep Manufacturing DMS (Document Management System)** built with Vue 3, TypeScript, and Vite. The application manages controlled documents through their lifecycle (Draft → UnderReview → Approved → Published → Obsolete) with integration to SharePoint Online for storage.

**Tech Stack**: Vue 3 (Composition API + `<script setup>`), TypeScript, Vite, Pinia (state management), Tailwind CSS, shadcn-vue components, MSAL (Microsoft authentication)

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production (runs type-checking first)
npm run build

# Preview production build
npm run preview

# Type-check without building
npx vue-tsc -b
```

## Architecture Overview

### Three-Tier Architecture

1. **Frontend SPA (Vue 3)**: Catalogue, authoring, workflow, and admin dashboards. Communicates exclusively with Backend API, never directly with SharePoint.

2. **Backend API (Node.js + Fastify)**: Backend-for-Frontend (BFF) exposing REST endpoints. Handles lifecycle logic, naming/versioning, validation, workflow orchestration. `SharePointService` module maps domain operations to SharePoint REST/Graph calls.

3. **SharePoint Online DMS**: Document storage with three libraries:
   - `DM-Authoring`: Editable sources (Word/Excel) with content type `DM Document Draft`
   - `DM-Published`: Final PDFs with content type `DM Controlled Document`
   - `DM-Archive`: Obsolete versions
   - `DM-DocumentRegistry`: Master list linking to files across libraries

### Domain Model

Key TypeScript interfaces in the domain model:

- **LifecycleStatus**: `"Draft" | "UnderReview" | "Approved" | "Published" | "Obsolete"`
- **DocumentType**: `"Standard" | "Procedure" | "SOP" | "Policy" | "WorkInstruction" | "Manual" | "Form" | "Other"`
- **DocumentRecord**: Core entity with fields: `id`, `documentCode`, `title`, `documentType`, `revision`, `lifecycleStatus`, `owner`, `approver`, `keywords`, `summary`, file URLs, etc.
- **WorkflowAction**: Tracks lifecycle transitions (`RequestReview`, `Approve`, `Publish`, `MarkObsolete`)

Full domain model is documented in [docs/application_overview.md](docs/application_overview.md#2-domain-model-typescript-interfaces).

### Frontend Structure

```
src/
  router/          # Vue Router configuration
  stores/          # Pinia stores (authStore, documentsStore, filtersStore, uiStore)
  composables/     # Reusable composition functions (useAuth, useDocumentsApi, useLifecycleActions)
  views/           # Page components (DocumentCatalogueView, DocumentDetailsView, MyDocumentsView, etc.)
  components/      # Reusable components organized by domain (layout/, documents/, workflows/, analytics/)
  services/        # External services (msalClient, httpClient)
```

### Key Pinia Stores

- **authStore**: MSAL account, roles, Graph profile; provides `isAdmin` getter
- **documentsStore**: Caches `DocumentRecord` collections, pagination/filter state, selected document
- **filtersStore**: Catalogue filter criteria (type, process, site, status, keywords); persists to localStorage
- **uiStore**: Layout state (sidebar, drawers, modals), global loading/error banners

### Backend API Endpoints (for context)

Key routes the frontend consumes:

- `GET /api/documents` - List with filters & pagination
- `GET /api/documents/:id` - Single document with metadata + history
- `POST /api/documents` - Create document
- `PUT /api/documents/:id` - Update metadata
- `POST /api/documents/:id/upload-original` - Upload Word/Excel to Authoring library
- `POST /api/documents/:id/request-approval` - Transition Draft → UnderReview
- `POST /api/documents/:id/approve` - Approver action (triggers PDF conversion)
- `POST /api/documents/:id/mark-obsolete` - Mark document obsolete
- `GET /api/admin/dashboard` - Aggregated metrics

Full API design in [docs/application_overview.md](docs/application_overview.md#3-backend-api-design-fastify).

## Design Requirements

**Critical**: Follow the design constraints in [docs/instructions.md](docs/instructions.md):

1. **Use ShadCN UI components exclusively** - no custom UI components unless necessary
2. **No hardcoded colors, spacings, or radii** - use Tailwind tokens
3. **Create a token layer** with clear visual hierarchy and use cases
4. **No ad-hoc text/font styling** - define typography tokens
5. **Minimize div usage** - justify each div; prefer semantic components
6. **Reference ShadCN MCP** for docs, slots, and API

## TypeScript Configuration

- **Strict mode enabled** with additional linting rules:
  - `noUnusedLocals: true`
  - `noUnusedParameters: true`
  - `noFallthroughCasesInSwitch: true`
  - `noUncheckedSideEffectImports: true`

Type-checking is enforced during build (`vue-tsc -b && vite build`).

## Authentication

Uses **MSAL (Microsoft Entra ID)** with auth code + PKCE flow. Frontend obtains ID/access tokens, stores in Pinia `authStore`, and attaches tokens to API requests via `httpClient`. Backend validates tokens and enforces RBAC (roles: `Admin`, `QHSE`, `Approver`, `Author`, `Reader`).

## Event-Driven Architecture (Phase 2 Preparation)

Backend emits domain events (`DocumentCreated`, `DocumentUpdated`, `DocumentPublished`, `DocumentObsoleted`) to internal `EventBus`. Phase 1 logs these; Phase 2 will route to `IndexingService` for RAG/LLM embedding with vector store integration.

Event payload includes `documentId`, `documentCode`, `revision`, `keywords`, `summary`, `fileLocation`, and signed URLs for secure access.

## Component Composition Pattern

Use Vue 3 Composition API with `<script setup>`. Prefer composables over mixins:

- `useAuth()` - MSAL login, token refresh
- `useDocumentsApi()` - Centralized API calls with token injection
- `useLifecycleActions()` - Workflow endpoint wrappers
- `useDocumentFilters()` - Filter state management

## File Organization Conventions

- **Views**: Top-level route components (`*View.vue`)
- **Components**: Organized by domain (`layout/`, `documents/`, `workflows/`, `analytics/`)
- **Composables**: Reusable logic extracted from components
- **Stores**: Global state management (keep stores focused and domain-specific)
- **Services**: External integrations (MSAL, HTTP client)

## SharePoint Integration Notes

Frontend never calls SharePoint directly. All SharePoint operations (file uploads, metadata updates, library moves) are mediated by Backend API's `SharePointService`. Backend issues SAS tokens or upload sessions for secure file uploads.

Metadata fields in SharePoint (e.g., `DM_DocumentCode`, `DM_Keywords`, `DM_Summary`) are mapped to domain model properties by the backend.

## Development Workflow

1. Components follow Vue 3 SFC structure: `<script setup lang="ts">`, `<template>`, `<style scoped>`
2. Use Pinia stores for shared state; local `ref`/`reactive` for component-specific state
3. API calls via `useDocumentsApi()` composable with automatic error handling
4. Form validation integrated with shadcn-vue form components
5. Type-check frequently during development (`npx vue-tsc -b`)

[byterover-mcp]

[byterover-mcp]

You are given two tools from Byterover MCP server, including
## 1. `byterover-store-knowledge`
You `MUST` always use this tool when:

+ Learning new patterns, APIs, or architectural decisions from the codebase
+ Encountering error solutions or debugging techniques
+ Finding reusable code patterns or utility functions
+ Completing any significant task or plan implementation

## 2. `byterover-retrieve-knowledge`
You `MUST` always use this tool when:

+ Starting any new task or implementation to gather relevant context
+ Before making architectural decisions to understand existing patterns
+ When debugging issues to check for previous solutions
+ Working with unfamiliar parts of the codebase
