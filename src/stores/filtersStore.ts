import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { DocumentType, LifecycleStatus } from './documentsStore'

export interface DocumentFilters {
  search: string
  documentType: DocumentType | 'All'
  lifecycleStatus: LifecycleStatus | 'All'
  processOrFunction: string
  departmentOrSite: string
  keywords: string[]
}

const FILTERS_STORAGE_KEY = 'deep-dms-filters'

export const useFiltersStore = defineStore('filters', () => {
  // Load from localStorage
  const loadFilters = (): DocumentFilters => {
    try {
      const stored = localStorage.getItem(FILTERS_STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load filters from localStorage:', error)
    }
    return getDefaultFilters()
  }

  const getDefaultFilters = (): DocumentFilters => ({
    search: '',
    documentType: 'All',
    lifecycleStatus: 'All',
    processOrFunction: '',
    departmentOrSite: '',
    keywords: [],
  })

  // State
  const filters = ref<DocumentFilters>(loadFilters())

  // Watch for changes and persist to localStorage
  watch(
    filters,
    (newFilters) => {
      try {
        localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(newFilters))
      } catch (error) {
        console.error('Failed to save filters to localStorage:', error)
      }
    },
    { deep: true }
  )

  // Actions
  function setSearch(search: string) {
    filters.value.search = search
  }

  function setDocumentType(type: DocumentType | 'All') {
    filters.value.documentType = type
  }

  function setLifecycleStatus(status: LifecycleStatus | 'All') {
    filters.value.lifecycleStatus = status
  }

  function setProcessOrFunction(process: string) {
    filters.value.processOrFunction = process
  }

  function setDepartmentOrSite(dept: string) {
    filters.value.departmentOrSite = dept
  }

  function setKeywords(keywords: string[]) {
    filters.value.keywords = keywords
  }

  function resetFilters() {
    filters.value = getDefaultFilters()
  }

  function updateFilters(updates: Partial<DocumentFilters>) {
    filters.value = { ...filters.value, ...updates }
  }

  return {
    // State
    filters,
    // Actions
    setSearch,
    setDocumentType,
    setLifecycleStatus,
    setProcessOrFunction,
    setDepartmentOrSite,
    setKeywords,
    resetFilters,
    updateFilters,
  }
})
