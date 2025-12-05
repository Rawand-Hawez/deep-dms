/**
 * HTTP Client Service (Mock Auth Only)
 *
 * Centralized HTTP client for API calls with:
 * - Mock token injection
 * - Error handling
 * - Request/response interceptors
 */

export interface RequestConfig extends RequestInit {
  requiresAuth?: boolean
}

export interface ApiError {
  status: number
  message: string
  data?: unknown
}

class HTTPClientService {
  private baseURL: string

  constructor() {
    // In development, use relative path to leverage Vite proxy
    // In production, use the environment variable or default
    this.baseURL = import.meta.env.DEV 
      ? '' 
      : (import.meta.env.VITE_API_BASE_URL || 'https://dmsserver.inova.krd')
  }

  /**
   * Make an HTTP request with automatic token injection
   */
  async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { requiresAuth = true, ...fetchConfig } = config

    // Build full URL
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${this.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

    // Prepare headers
    const headers = new Headers(fetchConfig.headers)
    if (!headers.has('Content-Type') && !(fetchConfig.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json')
    }

    // Add authorization token if required (mock auth only)
    if (requiresAuth) {
      // Use mock token for backend authentication
      const mockToken = '8cMu1ufnW9dGyIJtXj4ZcJEclWIuKWQB'
      headers.set('Authorization', `Bearer ${mockToken}`)

      // Add X-Mock-Role header for role-based testing
      let mockRole = 'Admin' // Default fallback
      try {
        const storedAuth = localStorage.getItem('deep-dms-auth')
        if (storedAuth) {
          const authData = JSON.parse(storedAuth)
          if (authData.roles && Array.isArray(authData.roles) && authData.roles.length > 0) {
            // Prefer higher privilege roles
            if (authData.roles.includes('Admin')) mockRole = 'Admin'
            else if (authData.roles.includes('QHSE')) mockRole = 'QHSE'
            else if (authData.roles.includes('Approver')) mockRole = 'Approver'
            else if (authData.roles.includes('Author')) mockRole = 'Author'
            else mockRole = authData.roles[0]
          }
        }
      } catch (e) {
        console.warn('[HTTP Client] Failed to read auth state for mock role', e)
      }

      headers.set('X-Mock-Role', mockRole)
      console.debug(`[HTTP Client] Using mock role: ${mockRole}`)
    }

    try {
      // Make request
      const response = await fetch(url, {
        ...fetchConfig,
        headers,
      })

      // Handle errors
      if (!response.ok) {
        await this.handleErrorResponse(response)
      }

      // Parse response
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        return await response.json()
      }

      // Return text or blob for non-JSON responses
      return (await response.text()) as T
    } catch (error) {
      if (error instanceof Error && 'status' in error) {
        throw error // Re-throw ApiError
      }
      console.error('[HTTP Client] Request failed:', error)
      throw this.createError(0, 'Network error or request failed')
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'GET',
    })
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'DELETE',
    })
  }

  /**
   * Upload file with multipart/form-data
   */
  async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, string>,
    config?: RequestConfig
  ): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: formData,
      headers: {
        // Let browser set Content-Type with boundary for multipart/form-data
        ...config?.headers,
      },
    })
  }

  /**
   * Handle error responses
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorMessage = response.statusText
    let errorData: unknown

    try {
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        errorData = await response.json()
        if (typeof errorData === 'object' && errorData !== null && 'message' in errorData) {
          errorMessage = String((errorData as { message: string }).message)
        }
      } else {
        errorMessage = await response.text()
      }
    } catch {
      // If parsing fails, use status text
    }

    throw this.createError(response.status, errorMessage, errorData)
  }

  /**
   * Create standardized error object
   */
  private createError(status: number, message: string, data?: unknown): ApiError {
    const error = new Error(message) as Error & ApiError
    error.status = status
    error.message = message
    error.data = data
    return error
  }

  /**
   * Update base URL (useful for testing or dynamic API endpoints)
   */
  setBaseURL(url: string): void {
    this.baseURL = url
  }

  /**
   * Get current base URL
   */
  getBaseURL(): string {
    return this.baseURL
  }
}

// Export singleton instance
export const httpClient = new HTTPClientService()
export default httpClient
