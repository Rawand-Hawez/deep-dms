import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'
import { useAuth } from './composables/useAuth'

const app = createApp(App)
const pinia = createPinia()

// Install Pinia first (required for useAuth)
app.use(pinia)

// Initialize authentication before mounting and installing router
const initApp = async () => {
  try {
    // Initialize MSAL before router guards run
    const auth = useAuth()
    await auth.initialize()

    // Now install router after MSAL is ready
    app.use(router)

    // Mount app
    app.mount('#app')
  } catch (error) {
    console.error('[App] Failed to initialize authentication:', error)
    // Still mount the app so user can see error state
    app.use(router)
    app.mount('#app')
  }
}

initApp()
