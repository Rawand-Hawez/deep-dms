<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const auth = useAuth()

function goHome() {
  router.push('/')
}

async function handleSignOut() {
  await auth.signOut()
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-muted/50 max-w-[1600px] mx-auto">
    <div class="w-full max-w-md space-y-6 p-8">
      <div class="bg-card p-8 rounded-lg border shadow-sm space-y-6">
        <div class="text-center space-y-4">
          <div class="flex justify-center">
            <div class="rounded-full bg-destructive/10 p-3">
              <svg
                class="w-12 h-12 text-destructive"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          <div>
            <h2 class="text-2xl font-semibold">Access Denied</h2>
            <p class="mt-2 text-muted-foreground">
              You don't have permission to access this page
            </p>
          </div>

          <div class="text-sm text-muted-foreground space-y-1">
            <p v-if="auth.user.value">
              Signed in as: <span class="font-medium">{{ auth.user.value.email }}</span>
            </p>
            <p>
              If you believe this is an error, please contact your system administrator
            </p>
          </div>
        </div>

        <div class="space-y-3">
          <button
            @click="goHome"
            class="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors"
          >
            Go to Home
          </button>

          <button
            @click="handleSignOut"
            class="w-full px-4 py-2 border border-border rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
