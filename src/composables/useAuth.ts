import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'

/**
 * Authentication Composable (Mock Auth Only)
 *
 * Simplified authentication using mock mode only.
 * MSAL dependencies removed for lighter builds.
 */

export function useAuth() {
  const authStore = useAuthStore()
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const user = computed(() => authStore.user)
  const isAdmin = computed(() => authStore.isAdmin)
  const isApprover = computed(() => authStore.isApprover)
  const isAuthor = computed(() => authStore.isAuthor)

  /**
   * Initialize authentication (mock mode)
   */
  async function initialize(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      // Use mock authentication
      authStore.mockLogin()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to initialize authentication'
      console.error('[useAuth] Initialization failed:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Sign in user (mock mode - uses mockLogin)
   */
  async function signIn(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      authStore.mockLogin()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Sign in failed'
      console.error('[useAuth] Sign in failed:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Sign out user
   */
  async function signOut(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      authStore.logout()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Sign out failed'
      console.error('[useAuth] Sign out failed:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Refresh authentication (no-op for mock auth)
   */
  async function refresh(): Promise<void> {
    console.log('[useAuth] Refresh called (no-op in mock mode)')
  }

  /**
   * Check if user has a specific role
   */
  function hasRole(role: string): boolean {
    return authStore.roles.includes(role)
  }

  /**
   * Check if user has any of the specified roles
   */
  function hasAnyRole(roles: string[]): boolean {
    return roles.some(role => authStore.roles.includes(role))
  }

  /**
   * Check if user has all of the specified roles
   */
  function hasAllRoles(roles: string[]): boolean {
    return roles.every(role => authStore.roles.includes(role))
  }

  return {
    // State
    isAuthenticated,
    isLoading,
    error,
    user,
    // Role checks
    isAdmin,
    isApprover,
    isAuthor,
    // Methods
    initialize,
    signIn,
    signOut,
    refresh,
    hasRole,
    hasAnyRole,
    hasAllRoles,
  }
}
