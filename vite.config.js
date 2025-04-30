import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({ registerType: 'autoUpdate' }) // Add PWA plugin
  ],
  server: {
    host: '0.0.0.0', // Ensure server listens on all interfaces
    hmr: {
      // Use wss for secure connections if needed, but proxy handles this
    },
    // Allow access from the proxy domain
    allowedHosts: [
      '5173-ibkl8kc67y5h9x3r0i7es-a5c7a72e.manus.computer'
    ]
  }
})

