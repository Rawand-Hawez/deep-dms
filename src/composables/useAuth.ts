import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import msalClient from '@/services/msalClient'
import httpClient from '@/services/httpClient'
import type { AccountInfo } from '@azure/msal-browser'

/**
 * Authentication Composable
 *
 * Provides authentication methods and state management
 * Integrates MSAL with Pinia authStore
 */

export interface GraphUserProfile {
  id: string
  displayName: string
  mail: string
  userPrincipalName: string
  jobTitle?: string
  officeLocation?: string
}

export function useAuth() {
  const authStore = useAuthStore()
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const user = computed(() => authStore.user)
  const isAdmin = computed(() => authStore.isAdmin)
  const isQHSE = computed(() => authStore.isQHSE)
  const isApprover = computed(() => authStore.isApprover)
  const isAuthor = computed(() => authStore.isAuthor)

  /**
   * Initialize authentication
   * Call this on app startup
   */
  async function initialize(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      // Check if we're in mock/dev mode
      const mockMode = import.meta.env.VITE_MOCK_AUTH === 'true'

      if (mockMode) {
        // Use mock authentication
        console.log('[useAuth] Running in mock mode - using mock login')
        authStore.mockLogin()
        isLoading.value = false
        return
      }

      // Initialize MSAL
      await msalClient.initialize()

      // Check if user is already signed in
      const account = msalClient.getAccount()
      if (account) {
        try {
          await loadUserProfile(account)
        } catch (profileError) {
          // If loading profile fails (e.g., token expired), clear auth state
          console.warn('[useAuth] Failed to load user profile, clearing auth state:', profileError)
          authStore.logout()
          // Clear MSAL cache to force fresh login
          msalClient.clearCache()
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to initialize authentication'
      console.error('[useAuth] Initialization failed:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Sign in user
   */
  async function signIn(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      await msalClient.signIn()
      // After redirect, handleRedirectPromise will be called in initialize()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Sign in failed'
      console.error('[useAuth] Sign in failed:', err)
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
      await msalClient.signOut()
      authStore.logout()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Sign out failed'
      console.error('[useAuth] Sign out failed:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Load user profile from Microsoft Graph and backend API
   */
  async function loadUserProfile(account: AccountInfo): Promise<void> {
    try {
      // Set user from MSAL account
      authStore.setUser({
        id: account.homeAccountId,
        displayName: account.name || account.username,
        email: account.username,
      })

      // Get access token
      const token = await msalClient.acquireToken()
      authStore.setAccessToken(token)

      // Fetch additional user info from Microsoft Graph
      try {
        const graphProfile = await fetchGraphProfile()
        authStore.setUser({
          id: graphProfile.id,
          displayName: graphProfile.displayName,
          email: graphProfile.mail || graphProfile.userPrincipalName,
        })
      } catch (graphError) {
        console.warn('[useAuth] Failed to fetch Graph profile:', graphError)
        // Continue with MSAL account info
      }

      // Fetch user roles from backend API
      try {
        const roles = await fetchUserRoles()
        authStore.setRoles(roles)
      } catch (roleError) {
        console.warn('[useAuth] Failed to fetch user roles:', roleError)
        // Continue without roles (user will have limited access)
        authStore.setRoles(['Reader']) // Default role
      }
    } catch (err) {
      console.error('[useAuth] Failed to load user profile:', err)
      throw err
    }
  }

  /**
   * Fetch user profile from Microsoft Graph API
   */
  async function fetchGraphProfile(): Promise<GraphUserProfile> {
    const token = await msalClient.acquireToken()

    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch Graph profile')
    }

    return await response.json()
  }

  /**
   * Fetch user roles from backend API
   * Backend validates the token and returns roles based on Entra ID group membership
   */
  async function fetchUserRoles(): Promise<string[]> {
    try {
      const response = await httpClient.get<{ roles: string[] }>('/auth/roles')
      return response.roles
    } catch (err) {
      console.error('[useAuth] Failed to fetch roles:', err)
      // Temporary: Force Admin roles for development/testing when backend is unreachable
      return ['Admin', 'QHSE', 'Approver', 'Author', 'Reader'] 
    }
  }

  /**
   * Refresh authentication (re-acquire token)
   */
  async function refresh(): Promise<void> {
    try {
      const token = await msalClient.acquireToken()
      authStore.setAccessToken(token)
    } catch (err) {
      console.error('[useAuth] Token refresh failed:', err)
      error.value = 'Session expired. Please sign in again.'
      await signOut()
    }
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
    isQHSE,
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
