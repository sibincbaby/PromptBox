import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  // State - using Composition API style
  const apiKey = ref('')
  const theme = ref('light')
  const maxHistoryItems = ref(50)
  
  // Apply theme when it changes using watch
  watch(theme, (newTheme) => {
    applyTheme(newTheme)
  })
  
  // Helper function to apply theme
  function applyTheme(newTheme) {
    document.documentElement.setAttribute('data-theme', newTheme)
  }
  
  // Actions
  function setApiKey(key) {
    apiKey.value = key
  }
  
  function setTheme(newTheme) {
    theme.value = newTheme
  }
  
  function setMaxHistoryItems(max) {
    const value = parseInt(max) || 50
    maxHistoryItems.value = value
  }
  
  // Initialize settings
  function initializeSettings() {
    // Apply saved theme on load
    applyTheme(theme.value)
  }
  
  return {
    // State
    apiKey,
    theme,
    maxHistoryItems,
    
    // Actions
    setApiKey,
    setTheme,
    setMaxHistoryItems,
    initializeSettings
  }
}, {
  // Persistence configuration
  persist: {
    key: 'promptbox-settings',
    storage: localStorage,
    paths: ['apiKey', 'theme', 'maxHistoryItems']
  }
})