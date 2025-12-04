<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useDocumentsStore } from '@/stores/documentsStore'
import { useSharePointDocuments } from '@/composables/useSharePointDocuments'
import DocumentCard from '@/components/documents/DocumentCard.vue'
import { Button } from '@/components/ui'
import { FileText, CheckCircle, Plus } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

const authStore = useAuthStore()
const docStore = useDocumentsStore()
const { loadDocuments } = useSharePointDocuments()

const activeTab = ref<'drafts' | 'approvals'>('drafts')

onMounted(() => {
  loadDocuments()
})

// Current user's email for filtering
// Fallback to a mock email if auth is partial, but authStore.user should be populated.
const userEmail = computed(() => authStore.user?.email || '')

const myDrafts = computed(() => {
  if (!userEmail.value) return []
  return docStore.documents.filter(doc => 
    doc.owner.email === userEmail.value && 
    doc.lifecycleStatus !== 'Published'
  )
})

const myApprovals = computed(() => {
  if (!userEmail.value) return []
  return docStore.documents.filter(doc => 
    doc.approver.email === userEmail.value && 
    doc.lifecycleStatus === 'UnderReview'
  )
})
</script>

<template>
  <div class="container py-10 max-w-[1600px] mx-auto space-y-8">
    
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <h1 class="text-3xl font-bold tracking-tight text-slate-900">My Tasks</h1>
        <p class="text-slate-600">Manage your document workflows and approvals.</p>
      </div>
      <Button as-child>
        <RouterLink to="/documents/new">
          <Plus class="w-4 h-4 mr-2" />
          New Document
        </RouterLink>
      </Button>
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
    </div>

    <!-- Content -->
    <div class="min-h-[400px]">
      
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

    </div>
  </div>
</template>