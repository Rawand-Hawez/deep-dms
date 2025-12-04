<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDocumentsStore } from '@/stores/documentsStore'
import { useSharePointDocuments } from '@/composables/useSharePointDocuments'
import DocumentFilters from '@/components/documents/DocumentFilters.vue'
import { 
  Input, Button, Card, CardHeader, CardTitle, CardContent, Badge,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell
} from '@/components/ui'
import { Search, Bot, Sparkles, X, ArrowRight } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

const store = useDocumentsStore()
const { loadDocuments } = useSharePointDocuments()
const searchQuery = ref('')
const showAiTeaser = ref(false)
const activeFilters = ref({
  types: [] as string[],
  departments: [] as string[]
})

onMounted(() => {
  loadDocuments()
})

const filteredDocuments = computed(() => {
  return store.documents.filter(doc => {
    // 1. Mandatory: Only Published Documents
    if (doc.lifecycleStatus !== 'Published') return false

    // 2. Search Filter
    const matchesSearch = searchQuery.value === '' || 
      doc.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      doc.documentCode.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      doc.keywords.some(k => k.toLowerCase().includes(searchQuery.value.toLowerCase()))

    // 3. Facet Filters (Type)
    const matchesType = activeFilters.value.types.length === 0 || 
      activeFilters.value.types.includes(doc.documentType)
    
    // 4. Facet Filters (Dept)
    const matchesDept = activeFilters.value.departments.length === 0 || 
      (doc.departmentOrSite && activeFilters.value.departments.some(d => doc.departmentOrSite?.includes(d)))

    return matchesSearch && matchesType && matchesDept
  })
})

const handleFilterUpdate = (newFilters: any) => {
  activeFilters.value = newFilters
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}
</script>

<template>
  <div class="container py-10 max-w-[1600px] mx-auto space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div class="space-y-1">
        <h1 class="text-3xl font-bold tracking-tight text-slate-900">Document Catalogue</h1>
        <p class="text-slate-600">Browse and search the central document registry.</p>
      </div>
      
      <!-- Search Bar -->
      <div class="relative w-full md:w-96">
        <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
        <Input 
          type="search" 
          placeholder="Search by title, code, or keyword..." 
          class="pl-9 bg-white"
          v-model="searchQuery"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- Sidebar Filters -->
      <aside class="lg:col-span-1">
        <DocumentFilters @update:filters="handleFilterUpdate" />
      </aside>

      <!-- Document Table -->
      <main class="lg:col-span-3">
        <div v-if="filteredDocuments.length > 0" class="rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-[180px]">Document Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead class="w-[80px]">Rev</TableHead>
                <TableHead class="w-[120px]">Type</TableHead>
                <TableHead class="w-[120px]">Dept</TableHead>
                <TableHead class="w-[120px]">Updated</TableHead>
                <TableHead class="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="doc in filteredDocuments" :key="doc.id" class="group">
                <TableCell class="font-medium font-mono text-xs text-slate-600">
                  {{ doc.documentCode }}
                </TableCell>
                <TableCell>
                  <div class="font-medium text-slate-900 group-hover:text-primary transition-colors">
                    {{ doc.title }}
                  </div>
                  <div class="text-xs text-slate-500 truncate max-w-[300px]">
                    {{ doc.summary }}
                  </div>
                </TableCell>
                <TableCell class="text-slate-600">{{ doc.revision }}</TableCell>
                <TableCell>
                  <Badge variant="secondary" class="font-normal">{{ doc.documentType }}</Badge>
                </TableCell>
                <TableCell class="text-slate-600 text-xs">{{ doc.departmentOrSite || doc.processOrFunction }}</TableCell>
                <TableCell class="text-slate-600 text-xs">{{ formatDate(doc.updatedAt) }}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" as-child>
                    <RouterLink :to="`/documents/${doc.id}`">
                      <ArrowRight class="w-4 h-4 text-slate-400 group-hover:text-primary" />
                    </RouterLink>
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        
        <!-- Empty State -->
        <div v-else class="text-center py-20 bg-slate-50 rounded-lg border border-dashed border-slate-200">
          <div class="mx-auto h-12 w-12 text-slate-300 mb-3">
            <Search class="h-full w-full" />
          </div>
          <h3 class="text-lg font-medium text-slate-900">No documents found</h3>
          <p class="text-slate-500">Try adjusting your filters or search query.</p>
        </div>
      </main>
    </div>

    <!-- Phase 2: AI Chatbot Teaser -->
    <div class="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
      
      <!-- Teaser Card -->
      <transition 
        enter-active-class="transform transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-4 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transform transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-4 scale-95"
      >
        <Card v-if="showAiTeaser" class="w-80 shadow-2xl border-purple-200 bg-white/95 backdrop-blur overflow-hidden">
          <div class="h-1 w-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"></div>
          <CardHeader class="pb-2 flex flex-row items-center justify-between space-y-0">
            <div class="flex items-center gap-2">
              <div class="p-1.5 bg-purple-100 rounded-md">
                <Sparkles class="w-4 h-4 text-purple-600" />
              </div>
              <CardTitle class="text-base font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Deep AI Assistant
              </CardTitle>
            </div>
            <Button variant="ghost" size="icon" class="h-6 w-6" @click="showAiTeaser = false">
              <X class="w-3 h-3" />
            </Button>
          </CardHeader>
          <CardContent class="space-y-4 pt-2">
            <div class="p-3 bg-slate-50 rounded-lg text-sm text-slate-600 leading-relaxed">
              <p>
                "How do I calibrate the pressure valve according to ISO 9001?"
              </p>
            </div>
            <div class="space-y-2">
              <Badge variant="outline" class="bg-purple-50 text-purple-700 border-purple-200">Coming Phase 2</Badge>
              <p class="text-xs text-slate-500">
                Soon you'll be able to chat directly with your documents. Our AI will instantly answer questions based on your published procedures.
              </p>
            </div>
            <Button disabled class="w-full bg-slate-100 text-slate-400 hover:bg-slate-100 cursor-not-allowed">
              Join Waitlist
            </Button>
          </CardContent>
        </Card>
      </transition>

      <!-- Floating Trigger Button -->
      <button 
        @click="showAiTeaser = !showAiTeaser"
        class="group relative flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg transition-all hover:bg-slate-800 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
      >
        <!-- Pulse Effect -->
        <span class="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 opacity-75 blur transition group-hover:opacity-100 animate-pulse"></span>
        
        <!-- Icon -->
        <div class="relative flex h-full w-full items-center justify-center rounded-full bg-slate-900">
          <Bot class="h-6 w-6 transition-transform group-hover:rotate-12" />
        </div>
      </button>
    </div>
  </div>
</template>