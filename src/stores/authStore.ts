import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export interface UserRef {
  id: string
  displayName: string
  email: string
}

interface AuthState {
  user: UserRef | null
  roles: string[]
}

const AUTH_STORAGE_KEY = 'deep-dms-auth'

export const useAuthStore = defineStore('auth', () => {
  // Initialize state from localStorage if available
  const loadStoredState = (): AuthState | null => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }

  const storedState = loadStoredState()

  // State
  const user = ref<UserRef | null>(storedState?.user || null)
  const isAuthenticated = ref(!!storedState?.user)
  const roles = ref<string[]>(storedState?.roles || [])
  const accessToken = ref<string | null>(null) // Don't persist tokens in localStorage for security

  // Getters
  const isAdmin = computed(() => roles.value.includes('Admin'))
  const isQHSE = computed(() => roles.value.includes('QHSE'))
  const isApprover = computed(() => roles.value.includes('Approver'))
  const isAuthor = computed(() => roles.value.includes('Author'))

  // Actions
  function setUser(userData: UserRef) {
    user.value = userData
    isAuthenticated.value = true
  }

  function setRoles(userRoles: string[]) {
    roles.value = userRoles
  }

  function setAccessToken(token: string) {
    accessToken.value = token
  }

  function logout() {
    user.value = null
    isAuthenticated.value = false
    roles.value = []
    accessToken.value = null
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  // Persist state to localStorage (watch for changes)
  watch(
    [user, roles],
    () => {
      if (user.value) {
        const state: AuthState = {
          user: user.value,
          roles: roles.value,
        }
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state))
      }
    },
    { deep: true }
  )

  // Mock login for development
  function mockLogin() {
    setUser({
      id: 'user-1',
      displayName: 'John Doe',
      email: 'john.doe@example.com',
    })
    setRoles(['Author', 'Approver'])
    setAccessToken('mock-token')
  }

  return {
    // State
    user,
    isAuthenticated,
    roles,
    accessToken,
    // Getters
    isAdmin,
    isQHSE,
    isApprover,
    isAuthor,
    // Actions
    setUser,
    setRoles,
    setAccessToken,
    logout,
    mockLogin,
  }
})
