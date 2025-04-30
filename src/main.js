import { createApp } from 'vue'
import { createPinia } from 'pinia' 
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import './styles/style.css'
import App from './App.vue'
import router from './router'

// Create Vue app
const app = createApp(App)

// Create and configure Pinia directly here to avoid any import issues
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// Use plugins
app.use(router)
app.use(pinia)

// Mount app
app.mount('#app')

