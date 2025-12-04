<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { User, LogOut, Settings } from 'lucide-vue-next'
import DropdownMenu from '@/components/ui/DropdownMenu.vue'
import DropdownMenuTrigger from '@/components/ui/DropdownMenuTrigger.vue'
import DropdownMenuContent from '@/components/ui/DropdownMenuContent.vue'
import DropdownMenuItem from '@/components/ui/DropdownMenuItem.vue'
import DropdownMenuSeparator from '@/components/ui/DropdownMenuSeparator.vue'
import Button from '@/components/ui/Button.vue'

const authStore = useAuthStore()

// Mock login on mount if not authenticated (for development)
if (!authStore.isAuthenticated) {
  authStore.mockLogin()
}

const userInitials = computed(() => {
  if (!authStore.user) return '?'
  const names = authStore.user.displayName.split(' ')
  return names
    .map((name) => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const handleLogout = () => {
  authStore.logout()
  // In production, redirect to login or trigger MSAL logout
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="icon" class="relative h-9 w-9 rounded-full">
        <div class="flex h-full w-full items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
          {{ userInitials }}
        </div>
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent class="w-56" align="end">
      <div class="flex flex-col space-y-1 px-2 py-1.5">
        <p class="text-sm font-medium">{{ authStore.user?.displayName }}</p>
        <p class="text-xs text-muted-foreground">{{ authStore.user?.email }}</p>
        <div v-if="authStore.roles.length > 0" class="flex flex-wrap gap-1 mt-2">
          <span
            v-for="role in authStore.roles"
            :key="role"
            class="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
          >
            {{ role }}
          </span>
        </div>
      </div>

      <DropdownMenuSeparator />

      <DropdownMenuItem>
        <User class="mr-2 h-4 w-4" />
        <span>Profile</span>
      </DropdownMenuItem>

      <DropdownMenuItem>
        <Settings class="mr-2 h-4 w-4" />
        <span>Settings</span>
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem @click="handleLogout">
        <LogOut class="mr-2 h-4 w-4" />
        <span>Log out</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>