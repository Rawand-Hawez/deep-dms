<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useDocumentsApi } from '@/composables/useDocumentsApi'
import type { DocumentRecord } from '@/stores/documentsStore'
import DocumentCard from '@/components/documents/DocumentCard.vue'
import { Button } from '@/components/ui'
import { FileText, CheckCircle, Plus, Loader2, RefreshCw, FileCheck } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

const authStore = useAuthStore()
const { getDocuments } = useDocumentsApi()

const activeTab = ref<'drafts' | 'approvals' | 'published'>('drafts')
const isLoading = ref(false)
const error = ref<string | null>(null)
const myDrafts = ref<DocumentRecord[]>([])
const myApprovals = ref<DocumentRecord[]>([])
const myPublished = ref<DocumentRecord[]>([])

// Current user's email for filtering
const userEmail = computed(() => authStore.user?.email || '')

onMounted(() => {
  fetchData()
})

async function fetchData() {
  isLoading.value = true
  error.value = null
  try {
    // Filter client-side for "My Drafts"
    // DEMO FIX: If Admin or Dev mode, show ALL drafts to ensure visibility
    const showAll = import.meta.env.DEV || authStore.isAdmin
    
    // Fetch Drafts
    const draftsResult = await getDocuments({ lifecycleStatus: 'Draft' })
    myDrafts.value = showAll 
      ? draftsResult.items 
      : draftsResult.items.filter(doc => 
          doc.owner?.email === userEmail.value || 
          doc.createdBy?.email === userEmail.value
        )

    // Fetch Approvals
    const approvalsResult = await getDocuments({ lifecycleStatus: 'UnderReview' })
    myApprovals.value = showAll
      ? approvalsResult.items
      : approvalsResult.items.filter(doc => doc.approver?.email === userEmail.value)

    // Fetch Published
    const publishedResult = await getDocuments({ lifecycleStatus: 'Published' })
    myPublished.value = showAll
      ? publishedResult.items
      : publishedResult.items.filter(doc => doc.owner?.email === userEmail.value)
    
  } catch (err) {
    console.error('Failed to load documents:', err)
    error.value = 'Failed to load documents. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="container py-10 max-w-[1600px] mx-auto space-y-8">
    
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <h1 class="text-3xl font-bold tracking-tight text-slate-900">My Tasks</h1>
        <p class="text-slate-600">Manage your document workflows and approvals.</p>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="outline" size="icon" @click="fetchData" :disabled="isLoading">
          <Loader2 v-if="isLoading" class="h-4 w-4 animate-spin" />
          <RefreshCw v-else class="h-4 w-4" />
        </Button>
        <Button as-child v-if="authStore.isAuthor || authStore.isAdmin">
          <RouterLink to="/documents/new">
            <Plus class="w-4 h-4 mr-2" />
            New Document
          </RouterLink>
        </Button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex items-center space-x-4 border-b border-slate-200">
      <button
        @click="activeTab = 'drafts'"
        :class="[
          'pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2',
          activeTab === 'drafts' 
            ? 'border-primary text-primary' 
            : 'border-transparent text-slate-500 hover:text-slate-700'
        ]"
      >
        <FileText class="w-4 h-4" />
        My Drafts
        <span v-if="myDrafts.length" class="ml-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">
          {{ myDrafts.length }}
        </span>
      </button>

      <button
        @click="activeTab = 'approvals'"
        :class="[
          'pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2',
          activeTab === 'approvals' 
            ? 'border-primary text-primary' 
            : 'border-transparent text-slate-500 hover:text-slate-700'
        ]"
      >
        <CheckCircle class="w-4 h-4" />
        Pending Approval
        <span v-if="myApprovals.length" class="ml-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs">
          {{ myApprovals.length }}
        </span>
      </button>

      <button
        @click="activeTab = 'published'"
        :class="[
          'pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2',
          activeTab === 'published' 
            ? 'border-primary text-primary' 
            : 'border-transparent text-slate-500 hover:text-slate-700'
        ]"
      >
        <FileCheck class="w-4 h-4" />
        Published
        <span v-if="myPublished.length" class="ml-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
          {{ myPublished.length }}
        </span>
      </button>
    </div>

    <!-- Error State -->
    <div v-if="error" class="rounded-lg bg-red-50 border border-red-200 p-6 text-center space-y-4">
      <div class="mx-auto w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
        <Loader2 class="h-5 w-5 text-red-600" />
      </div>
      <div>
        <h3 class="text-sm font-medium text-red-800">Connection Error</h3>
        <p class="text-xs text-red-600 mt-1">{{ error }}</p>
      </div>
      <Button variant="outline" size="sm" @click="fetchData" class="border-red-200 hover:bg-red-100 text-red-700">
        <RefreshCw class="w-3 h-3 mr-2" />
        Retry
      </Button>
    </div>

    <!-- Content -->
    <div v-else class="min-h-[400px]">
      
      <!-- My Drafts Tab -->
      <div v-if="activeTab === 'drafts'" class="space-y-6">
        <div v-if="myDrafts.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <DocumentCard 
            v-for="doc in myDrafts" 
            :key="doc.id" 
            :document="doc" 
          />
        </div>
        <div v-else class="text-center py-16 bg-slate-50 rounded-lg border border-dashed border-slate-200">
          <div class="mx-auto h-12 w-12 text-slate-300 mb-3">
            <FileText class="h-full w-full" />
          </div>
          <h3 class="text-lg font-medium text-slate-900">No active drafts</h3>
          <p class="text-slate-500 mb-6">You don't have any documents in progress.</p>
          <Button variant="outline" as-child>
            <RouterLink to="/documents/new">Create Draft</RouterLink>
          </Button>
        </div>
      </div>

      <!-- Approvals Tab -->
      <div v-if="activeTab === 'approvals'" class="space-y-6">
        <div v-if="myApprovals.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <DocumentCard 
            v-for="doc in myApprovals" 
            :key="doc.id" 
            :document="doc" 
          />
        </div>
        <div v-else class="text-center py-16 bg-slate-50 rounded-lg border border-dashed border-slate-200">
          <div class="mx-auto h-12 w-12 text-slate-300 mb-3">
            <CheckCircle class="h-full w-full" />
          </div>
          <h3 class="text-lg font-medium text-slate-900">All caught up!</h3>
          <p class="text-slate-500">You have no documents pending your approval.</p>
        </div>
      </div>

      <!-- Published Tab -->
      <div v-if="activeTab === 'published'" class="space-y-6">
        <div v-if="myPublished.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <DocumentCard 
            v-for="doc in myPublished" 
            :key="doc.id" 
            :document="doc" 
          />
        </div>
        <div v-else class="text-center py-16 bg-slate-50 rounded-lg border border-dashed border-slate-200">
          <div class="mx-auto h-12 w-12 text-slate-300 mb-3">
            <FileCheck class="h-full w-full" />
          </div>
          <h3 class="text-lg font-medium text-slate-900">No published documents</h3>
          <p class="text-slate-500">You haven't published any documents yet.</p>
        </div>
      </div>

    </div>
  </div>
</template>