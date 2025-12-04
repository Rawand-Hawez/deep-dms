import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import msalClient from '@/services/msalClient'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    requiresAdmin?: boolean
    requiresRoles?: string[]
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/DocumentCatalogueView.vue'),
    meta: { title: 'Document Catalogue', requiresAuth: true },
  },
  {
    path: '/my-documents',
    name: 'my-documents',
    component: () => import('@/views/MyDocumentsView.vue'),
    meta: { title: 'My Documents', requiresAuth: true },
  },
  {
    path: '/documents/:id',
    name: 'document-details',
    component: () => import('@/views/DocumentDetailsView.vue'),
    meta: { title: 'Document Details', requiresAuth: true },
  },
  {
    path: '/admin/edit-document',
    name: 'admin-edit-document',
    component: () => import('@/views/DocumentEditorView.vue'),
    meta: { title: 'Edit Document', requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
    meta: { title: 'About', requiresAuth: true },
  },
  {
    path: '/sharepoint-test',
    name: 'sharepoint-test',
    component: () => import('@/views/SharePointTestView.vue'),
    meta: { title: 'SharePoint Test', requiresAuth: true },
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/AdminDashboardView.vue'),
    meta: { title: 'Admin Dashboard', requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/pending',
    name: 'admin-pending',
    component: () => import('@/views/AdminPendingView.vue'),
    meta: { title: 'Pending Publication', requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: 'Sign In' },
  },
  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: () => import('@/views/UnauthorizedView.vue'),
    meta: { title: 'Unauthorized' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Navigation guards
router.beforeEach(async (to, _from, next) => {
  // Update document title
  document.title = to.meta.title ? `${to.meta.title} | Deep DMS` : 'Deep DMS'

  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth ?? true // Default to requiring auth
  const requiresAdmin = to.meta.requiresAdmin ?? false
  const requiresRoles = to.meta.requiresRoles

  // Allow access to login and public routes
  if (!requiresAuth) {
    next()
    return
  }

  // Check if we're in mock mode
  const mockMode = import.meta.env.VITE_MOCK_AUTH === 'true'

  // Check if user is authenticated
  const isAuthenticated = mockMode
    ? authStore.isAuthenticated
    : msalClient.isAuthenticated()

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    if (to.name !== 'login') {
      next({
        name: 'login',
        query: { redirect: to.fullPath },
      })
    } else {
      next()
    }
    return
  }

  // Check admin requirement
  if (requiresAdmin && !authStore.isAdmin) {
    next({ name: 'unauthorized' })
    return
  }

  // Check specific role requirements
  if (requiresRoles && requiresRoles.length > 0) {
    const hasRequiredRole = requiresRoles.some(role => authStore.roles.includes(role))
    if (!hasRequiredRole) {
      next({ name: 'unauthorized' })
      return
    }
  }

  // All checks passed, allow navigation
  next()
})

export default router
