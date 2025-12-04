<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { computed } from 'vue'
import { Plus, Shield, FileText } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/authStore'
import UserProfileDropdown from './UserProfileDropdown.vue'
import RoleSwitcher from './RoleSwitcher.vue'
import Button from '@/components/ui/Button.vue'
import logoSvg from '@/assets/logo.svg'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui'

const authStore = useAuthStore()

const navItems = [
  { name: 'Documents', to: '/' }, 
  { name: 'My Tasks', to: '/my-documents' }, 
]

const showRoleSwitcher = computed(() => import.meta.env.VITE_MOCK_AUTH === 'true')
const isAdminOrQHSE = computed(() => authStore.isAdmin || authStore.roles.includes('QHSE'))

</script>

<template>
  <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <nav class="container mx-auto flex h-16 items-center justify-between px-6 max-w-[1600px]">
      <!-- Logo Section -->
      <div class="flex items-center gap-8">
         <RouterLink to="/" class="flex items-center gap-2">
            <img :src="logoSvg" alt="Deep DMS Logo" class="h-8 w-auto" />
         </RouterLink>

         <!-- Navigation Links (Center-Left) -->
         <div class="hidden md:flex items-center gap-6">
            <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            active-class="text-primary font-semibold"
            >
            {{ item.name }}
            </RouterLink>

            <!-- Admin Dropdown -->
            <DropdownMenu v-if="isAdminOrQHSE">
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" class="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary h-auto py-2 px-3">
                  Admin Controls
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" class="w-56">
                <DropdownMenuItem as-child>
                   <RouterLink to="/documents/new" class="w-full flex items-center cursor-pointer">
                      <Plus class="mr-2 h-4 w-4" />
                      <span>Create New Document</span>
                   </RouterLink>
                </DropdownMenuItem>
                <DropdownMenuItem as-child>
                   <RouterLink to="/admin/edit-document" class="w-full flex items-center cursor-pointer">
                      <FileText class="mr-2 h-4 w-4" />
                      <span>Edit Document</span>
                   </RouterLink>
                </DropdownMenuItem>
                <DropdownMenuItem as-child>
                   <RouterLink to="/admin/pending" class="w-full flex items-center cursor-pointer">
                      <FileText class="mr-2 h-4 w-4" />
                      <span>Pending Publication</span>
                   </RouterLink>
                </DropdownMenuItem>
                 <DropdownMenuSeparator />
                 <DropdownMenuItem as-child>
                   <RouterLink to="/admin" class="w-full flex items-center cursor-pointer">
                      <Shield class="mr-2 h-4 w-4" />
                      <span>Governance Dashboard</span>
                   </RouterLink>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
         </div>
      </div>

      <!-- Right Section: Actions + User Profile -->
      <div class="flex items-center gap-4">
        <!-- Features Link -->
        <RouterLink 
          to="/about" 
          class="text-sm font-semibold transition-colors hover:text-primary px-3 py-2 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100"
        >
          Features
        </RouterLink>

        <!-- Role Switcher (Dev Mode Only) -->
        <RoleSwitcher v-if="showRoleSwitcher" />

        <!-- User Profile -->
        <UserProfileDropdown />
      </div>
    </nav>
  </header>
</template>
