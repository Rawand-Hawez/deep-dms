<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useDocumentsApi } from '@/composables/useDocumentsApi'
import type { DocumentRecord } from '@/stores/documentsStore'
import { 
  Card, CardContent, CardHeader, CardTitle, 
  Button, 
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Badge
} from '@/components/ui'
import { 
  BarChart3, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Users,
  FileCheck,
  AlertTriangle
} from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

const { getDocuments } = useDocumentsApi()

const isLoading = ref(true)
const allDocs = ref<DocumentRecord[]>([])

// Stats
const stats = computed(() => {
  const total = allDocs.value.length
  const published = allDocs.value.filter(d => d.lifecycleStatus === 'Published').length
  const drafts = allDocs.value.filter(d => d.lifecycleStatus === 'Draft').length
  const pending = allDocs.value.filter(d => d.lifecycleStatus === 'UnderReview').length
  
  return [
    { title: 'Total Documents', value: total, icon: FileText, color: 'text-slate-600', bg: 'bg-slate-100' },
    { title: 'Published', value: published, icon: FileCheck, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Pending Approval', value: pending, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-100' },
    { title: 'Drafts', value: drafts, icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-100' }
  ]
})

const recentActivity = computed(() => {
  return [...allDocs.value]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)
})

const overdueReviews = computed(() => {
  const today = new Date()
  return allDocs.value
    .filter(doc => {
      if (doc.lifecycleStatus !== 'Published' || !doc.nextReviewDate) return false
      const reviewDate = new Date(doc.nextReviewDate)
      return reviewDate < today
    })
    .sort((a, b) => new Date(a.nextReviewDate!).getTime() - new Date(b.nextReviewDate!).getTime())
    .slice(0, 5)
})

onMounted(async () => {
  try {
    // Fetch a large batch of docs for client-side stats calculation
    // Ideally, the backend should provide a /stats endpoint
    const result = await getDocuments({}, { page: 1, pageSize: 1000 }) 
    allDocs.value = result.items
  } catch (err) {
    console.error('Failed to fetch admin stats', err)
  } finally {
    isLoading.value = false
  }
})

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
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <h1 class="text-3xl font-bold tracking-tight text-slate-900">Admin Dashboard</h1>
        <p class="text-slate-600">System overview and governance metrics.</p>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card v-for="stat in stats" :key="stat.title">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            {{ stat.title }}
          </CardTitle>
          <div :class="['p-2 rounded-full', stat.bg]">
            <component :is="stat.icon" :class="['h-4 w-4', stat.color]" />
          </div>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stat.value }}</div>
          <p class="text-xs text-muted-foreground mt-1">
            {{ stat.value === 1 ? 'Document' : 'Documents' }}
          </p>
        </CardContent>
      </Card>
    </div>

    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <!-- Overdue Reviews -->
      <Card class="col-span-4" :class="{'border-amber-200 bg-amber-50/30': overdueReviews.length > 0}">
        <CardHeader>
          <div class="flex items-center gap-2">
            <CardTitle>Overdue Reviews</CardTitle>
            <Badge v-if="overdueReviews.length > 0" variant="destructive">{{ overdueReviews.length }}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div v-if="overdueReviews.length === 0" class="text-center py-8 text-muted-foreground text-sm">
            <CheckCircle2 class="h-8 w-8 mx-auto mb-2 text-green-500/50" />
            No overdue documents. Great job!
          </div>
          <Table v-else>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead class="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="doc in overdueReviews" :key="doc.id">
                <TableCell class="font-medium">
                  <div class="flex flex-col">
                    <span>{{ doc.title }}</span>
                    <span class="text-xs text-muted-foreground">{{ doc.documentCode }}</span>
                  </div>
                </TableCell>
                <TableCell class="text-sm font-medium text-destructive">
                  {{ formatDate(doc.nextReviewDate!) }}
                </TableCell>
                <TableCell class="text-right">
                  <Button variant="ghost" size="sm" as-child>
                    <RouterLink :to="`/documents/${doc.id}`">Review</RouterLink>
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <!-- Recent Activity -->
      <Card class="col-span-3">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="doc in recentActivity.slice(0, 5)" :key="doc.id">
                <TableCell class="font-medium">
                  <div class="flex flex-col">
                    <span class="truncate max-w-[180px]">{{ doc.title }}</span>
                    <span class="text-xs text-muted-foreground">{{ doc.lifecycleStatus }}</span>
                  </div>
                </TableCell>
                <TableCell class="text-sm text-muted-foreground whitespace-nowrap">
                  {{ formatDate(doc.updatedAt) }}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <!-- Quick Actions -->
      <Card class="col-span-7">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" class="justify-start h-auto py-4 px-4" as-child>
            <RouterLink to="/admin/pending">
              <div class="flex items-center gap-4">
                <div class="p-2 bg-amber-100 rounded-lg">
                  <CheckCircle2 class="h-5 w-5 text-amber-600" />
                </div>
                <div class="text-left">
                  <div class="font-semibold text-slate-900">Pending Approvals</div>
                  <div class="text-xs text-slate-500">Review documents waiting for publication</div>
                </div>
                <ArrowRight class="ml-auto h-4 w-4 text-slate-400" />
              </div>
            </RouterLink>
          </Button>

          <Button variant="outline" class="justify-start h-auto py-4 px-4" as-child>
            <RouterLink to="/documents/new">
              <div class="flex items-center gap-4">
                <div class="p-2 bg-blue-100 rounded-lg">
                  <FileText class="h-5 w-5 text-blue-600" />
                </div>
                <div class="text-left">
                  <div class="font-semibold text-slate-900">Create Document</div>
                  <div class="text-xs text-slate-500">Start a new document workflow</div>
                </div>
                <ArrowRight class="ml-auto h-4 w-4 text-slate-400" />
              </div>
            </RouterLink>
          </Button>

          <Button variant="outline" class="justify-start h-auto py-4 px-4" disabled>
            <div class="flex items-center gap-4">
              <div class="p-2 bg-purple-100 rounded-lg">
                <Users class="h-5 w-5 text-purple-600" />
              </div>
              <div class="text-left">
                <div class="font-semibold text-slate-900">User Management</div>
                <div class="text-xs text-slate-500">Manage roles and permissions (Coming Soon)</div>
              </div>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
</template>