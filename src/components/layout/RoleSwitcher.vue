<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { ShieldCheck, ShieldAlert, Users, PenTool, Eye, ChevronDown } from 'lucide-vue-next'

const authStore = useAuthStore()
const isOpen = ref(false)
const dropdownRef = ref<HTMLDivElement | null>(null)

onMounted(() => {
  console.log('[RoleSwitcher] Component mounted. Current role:', authStore.roles)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const availableRoles = [
  { value: 'Admin', label: 'Admin', icon: ShieldAlert },
  { value: 'QHSE', label: 'QHSE', icon: ShieldCheck },
  { value: 'Approver', label: 'Approver', icon: Users },
  { value: 'Author', label: 'Author', icon: PenTool },
  { value: 'Reader', label: 'Reader', icon: Eye },
]

const currentRole = computed(() => {
  // Return the highest priority role
  if (authStore.isAdmin) return 'Admin'
  if (authStore.isQHSE) return 'QHSE'
  if (authStore.isApprover) return 'Approver'
  if (authStore.isAuthor) return 'Author'
  return 'Reader'
})

const currentRoleData = computed(() => {
  return availableRoles.find(r => r.value === currentRole.value)
})

function toggleDropdown() {
  isOpen.value = !isOpen.value
  console.log('[RoleSwitcher] Dropdown toggled:', isOpen.value)
}

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

function handleRoleChange(newRole: string) {
  console.log('[RoleSwitcher] Changing role to:', newRole)
  authStore.setRoles([newRole])
  console.log('[RoleSwitcher] Role updated. Current roles:', authStore.roles)
  isOpen.value = false
}
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <button
      @click="toggleDropdown"
      class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-3 cursor-pointer"
    >
      <component
        v-if="currentRoleData"
        :is="currentRoleData.icon"
        class="h-4 w-4"
      />
      <span class="text-sm font-medium">{{ currentRole }}</span>
      <ChevronDown class="h-3 w-3 opacity-50" :class="{ 'rotate-180': isOpen }" />
    </button>

    <!-- Dropdown Menu -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-48 rounded-md border bg-popover p-1 text-popover-foreground shadow-md z-50"
      >
        <div class="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
          Switch Role (Dev Mode)
        </div>
        <div class="h-px bg-border my-1"></div>
        <button
          v-for="role in availableRoles"
          :key="role.value"
          @click="handleRoleChange(role.value)"
          class="flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer"
        >
          <component :is="role.icon" class="mr-2 h-4 w-4" />
          <span>{{ role.label }}</span>
          <span
            v-if="authStore.roles.includes(role.value)"
            class="ml-auto text-xs text-muted-foreground"
          >
            ✓
          </span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
}
</style>
