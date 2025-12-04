import {
  PublicClientApplication,
  type AccountInfo,
  type AuthenticationResult,
  InteractionRequiredAuthError,
  BrowserAuthError,
} from '@azure/msal-browser'
import msalConfig, { loginRequest, tokenRequest } from './msalConfig'

/**
 * MSAL Client Service
 *
 * Handles all Microsoft Entra ID authentication operations:
 * - Login/Logout
 * - Token acquisition (silent and interactive)
 * - Account management
 */

class MSALClientService {
  private msalInstance: PublicClientApplication
  private initialized = false

  constructor() {
    this.msalInstance = new PublicClientApplication(msalConfig)
  }

  /**
   * Initialize MSAL instance
   * Must be called before any other operations
   */
  async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      await this.msalInstance.initialize()
      this.initialized = true

      // Handle redirect promise (required for redirect flow)
      await this.handleRedirectPromise()
    } catch (error) {
      console.error('[MSAL] Initialization failed:', error)
      throw error
    }
  }

  /**
   * Handle redirect promise after login/logout redirect
   */
  private async handleRedirectPromise(): Promise<AuthenticationResult | null> {
    try {
      const response = await this.msalInstance.handleRedirectPromise()
      return response
    } catch (error) {
      console.error('[MSAL] Error handling redirect:', error)
      throw error
    }
  }

  /**
   * Sign in using redirect flow
   */
  async signIn(): Promise<void> {
    this.ensureInitialized()

    try {
      await this.msalInstance.loginRedirect(loginRequest)
    } catch (error) {
      console.error('[MSAL] Login failed:', error)
      throw error
    }
  }

  /**
   * Sign out using redirect flow
   */
  async signOut(): Promise<void> {
    this.ensureInitialized()

    const account = this.getAccount()
    if (!account) return

    try {
      await this.msalInstance.logoutRedirect({
        account,
        postLogoutRedirectUri: msalConfig.auth.postLogoutRedirectUri,
      })
    } catch (error) {
      console.error('[MSAL] Logout failed:', error)
      throw error
    }
  }

  /**
   * Get access token (tries silent first, falls back to interactive)
   */
  async acquireToken(): Promise<string> {
    this.ensureInitialized()

    const account = this.getAccount()
    if (!account) {
      throw new Error('No account found. Please sign in.')
    }

    try {
      // Try silent token acquisition first
      const response = await this.msalInstance.acquireTokenSilent({
        ...tokenRequest,
        account,
      })
      return response.accessToken
    } catch (error) {
      // If silent acquisition fails, try interactive
      if (
        error instanceof InteractionRequiredAuthError ||
        error instanceof BrowserAuthError
      ) {
        try {
          await this.msalInstance.acquireTokenRedirect({
            ...tokenRequest,
            account,
          })
          // This will redirect, so we won't reach this point
          throw new Error('Redirecting for interactive login...')
        } catch (interactiveError) {
          console.error('[MSAL] Interactive token acquisition failed:', interactiveError)
          throw interactiveError
        }
      }

      console.error('[MSAL] Token acquisition failed:', error)
      throw error
    }
  }

  /**
   * Get the currently signed-in account
   */
  getAccount(): AccountInfo | null {
    this.ensureInitialized()

    const accounts = this.msalInstance.getAllAccounts()
    if (accounts.length === 0) {
      return null
    }

    // Return the first account (most common scenario)
    // In multi-account scenarios, you'd need additional logic
    return accounts[0] || null
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getAccount() !== null
  }

  /**
   * Get all accounts
   */
  getAllAccounts(): AccountInfo[] {
    this.ensureInitialized()
    return this.msalInstance.getAllAccounts()
  }

  /**
   * Get MSAL instance for advanced operations
   */
  getInstance(): PublicClientApplication {
    return this.msalInstance
  }

  /**
   * Clear all cached accounts and tokens
   * Useful when session expires or user needs to re-authenticate
   */
  clearCache(): void {
    this.ensureInitialized()

    // Clear active account
    this.msalInstance.setActiveAccount(null)

    // Clear browser storage
    localStorage.clear()
    sessionStorage.clear()
  }

  /**
   * Ensure MSAL is initialized before operations
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('MSAL not initialized. Call initialize() first.')
    }
  }
}

// Export singleton instance
export const msalClient = new MSALClientService()
export default msalClient
