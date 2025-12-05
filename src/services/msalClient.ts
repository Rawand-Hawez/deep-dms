/**
 * Mock MSAL Client Service (Mock Auth Only)
 *
 * This is a stub implementation that maintains interface compatibility
 * but does nothing since the app uses mock authentication only.
 */

// Minimal type definitions to avoid MSAL dependency
export interface AccountInfo {
  homeAccountId: string
  environment: string
  tenantId: string
  username: string
  localAccountId: string
  name?: string
}

class MSALClientService {
  private initialized = false

  /**
   * Initialize MSAL instance (no-op for mock auth)
   */
  async initialize(): Promise<void> {
    if (this.initialized) return
    this.initialized = true
    console.log('[MSAL Stub] Mock authentication mode - MSAL disabled')
  }

  /**
   * Sign in (no-op for mock auth)
   */
  async signIn(): Promise<void> {
    console.warn('[MSAL Stub] signIn called but mock auth is enabled')
  }

  /**
   * Sign out (no-op for mock auth)
   */
  async signOut(): Promise<void> {
    console.warn('[MSAL Stub] signOut called but mock auth is enabled')
  }

  /**
   * Get access token (returns empty string for mock auth)
   */
  async acquireToken(): Promise<string> {
    console.warn('[MSAL Stub] acquireToken called but mock auth is enabled')
    return ''
  }

  /**
   * Get the currently signed-in account (always returns null for mock auth)
   */
  getAccount(): AccountInfo | null {
    return null
  }

  /**
   * Check if user is authenticated (always false for mock auth)
   */
  isAuthenticated(): boolean {
    return false
  }

  /**
   * Get all accounts (always empty for mock auth)
   */
  getAllAccounts(): AccountInfo[] {
    return []
  }

  /**
   * Clear all cached accounts and tokens (no-op for mock auth)
   */
  clearCache(): void {
    console.log('[MSAL Stub] clearCache called but mock auth is enabled')
  }
}

// Export singleton instance
export const msalClient = new MSALClientService()
export default msalClient
