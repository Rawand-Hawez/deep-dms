import type { Configuration, RedirectRequest } from '@azure/msal-browser'

/**
 * MSAL Configuration for Microsoft Entra ID Authentication
 *
 * Uses Auth Code flow with PKCE (recommended for SPAs)
 * Environment variables are loaded from .env file
 */

const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || '',
    authority: import.meta.env.VITE_MSAL_AUTHORITY || '',
    redirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI || window.location.origin,
    postLogoutRedirectUri: import.meta.env.VITE_AZURE_POST_LOGOUT_REDIRECT_URI || window.location.origin,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: 'localStorage', // Store tokens in localStorage for persistence
    storeAuthStateInCookie: false, // Set to true for IE11 or Edge compatibility
  },
  system: {
    loggerOptions: {
      // Only surface warnings/errors to avoid noisy console output
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return
        if (level === 0) console.error('[MSAL]', message)
        if (level === 1) console.warn('[MSAL]', message)
      },
      logLevel: 1, // Warning
      piiLoggingEnabled: false,
    },
  },
}

/**
 * Scopes requested during login
 * These define what permissions the app needs
 */
export const loginRequest: RedirectRequest = {
  scopes: (import.meta.env.VITE_MSAL_SCOPES || 'openid,profile,email,User.Read')
    .split(',')
    .map((s: string) => s.trim()),
}

/**
 * Scopes for acquiring tokens to call the backend API
 * The backend will validate these tokens
 */
export const tokenRequest = {
  scopes: [
    ...(import.meta.env.VITE_MSAL_SCOPES || 'openid,profile,email,User.Read')
      .split(',')
      .map((s: string) => s.trim()),
  ],
}

export default msalConfig
