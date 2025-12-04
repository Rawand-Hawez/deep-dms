import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  // State
  const sidebarOpen = ref(false)
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)
  const successMessage = ref<string | null>(null)

  // Actions
  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function setSidebarOpen(open: boolean) {
    sidebarOpen.value = open
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading
  }

  function setError(message: string | null) {
    errorMessage.value = message
    if (message) {
      setTimeout(() => {
        errorMessage.value = null
      }, 5000)
    }
  }

  function setSuccess(message: string | null) {
    successMessage.value = message
    if (message) {
      setTimeout(() => {
        successMessage.value = null
      }, 3000)
    }
  }

  function clearMessages() {
    errorMessage.value = null
    successMessage.value = null
  }

  return {
    // State
    sidebarOpen,
    isLoading,
    errorMessage,
    successMessage,
    // Actions
    toggleSidebar,
    setSidebarOpen,
    setLoading,
    setError,
    setSuccess,
    clearMessages,
  }
})
