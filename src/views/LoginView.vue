<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const route = useRoute()
const auth = useAuth()

const isSigningIn = ref(false)
const errorMessage = ref<string | null>(null)

onMounted(() => {
  // If already authenticated, redirect to home or return URL
  if (auth.isAuthenticated.value) {
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  }
})

async function handleSignIn() {
  isSigningIn.value = true
  errorMessage.value = null

  try {
    await auth.signIn()
    // Redirect will happen automatically after MSAL redirect completes
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Sign in failed'
    isSigningIn.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-muted/50 max-w-[1600px] mx-auto">
    <div class="w-full max-w-md space-y-8 p-8">
      <div class="text-center">
        <h1 class="text-4xl font-bold tracking-tight">Deep DMS</h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Document Management System
        </p>
      </div>

      <div class="mt-8 space-y-6 bg-card p-8 rounded-lg border shadow-sm">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-semibold">Sign in to your account</h2>
          <p class="text-sm text-muted-foreground">
            Use your Microsoft account to access the system
          </p>
        </div>

        <div v-if="errorMessage" class="rounded-md bg-destructive/10 p-4">
          <p class="text-sm text-destructive">{{ errorMessage }}</p>
        </div>

        <div>
          <button
            @click="handleSignIn"
            :disabled="isSigningIn"
            class="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border rounded-md shadow-sm bg-background hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              v-if="!isSigningIn"
              class="w-5 h-5"
              viewBox="0 0 21 21"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 10.5h10V.5H0v10z" fill="#F35325" />
              <path d="M11 10.5h10V.5H11v10z" fill="#81BC06" />
              <path d="M0 20.5h10v-10H0v10z" fill="#05A6F0" />
              <path d="M11 20.5h10v-10H11v10z" fill="#FFBA08" />
            </svg>
            <svg
              v-else
              class="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span class="font-medium">
              {{ isSigningIn ? 'Signing in...' : 'Sign in with Microsoft' }}
            </span>
          </button>
        </div>

        <div class="text-center">
          <p class="text-xs text-muted-foreground">
            By signing in, you agree to our terms of service and privacy policy
          </p>
        </div>
      </div>

      <div class="text-center text-sm text-muted-foreground">
        <p>Need help? Contact your system administrator</p>
      </div>
    </div>
  </div>
</template>
