import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { db } from '../../db/db'

export const useSettingsStore = defineStore('settings', () => {
  // State - using Composition API style
  const apiKey = ref('')
  const modelName = ref('gemini-1.5-flash')
  const systemPrompt = ref('')
  const temperature = ref(0.9)
  const topP = ref(1)
  const maxOutputTokens = ref(2048)
  const theme = ref('light')
  const maxHistoryItems = ref(50)
  const structuredOutput = ref(false)
  const outputSchema = ref('{\n  "type": "object",\n  "properties": {\n    "result": {\n      "type": "string"\n    }\n  }\n}')
  const isLoading = ref(false)
  const error = ref(null)
  
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
    return saveSettingToDb('apiKey', key)
  }
  
  function setModelName(model) {
    modelName.value = model
    return saveSettingToDb('modelName', model)
  }
  
  function setSystemPrompt(prompt) {
    systemPrompt.value = prompt
    return saveSettingToDb('systemPrompt', prompt)
  }
  
  function setTemperature(temp) {
    temperature.value = parseFloat(temp)
    return saveSettingToDb('temperature', temp)
  }
  
  function setTopP(value) {
    topP.value = parseFloat(value)
    return saveSettingToDb('topP', value)
  }
  
  function setMaxOutputTokens(tokens) {
    maxOutputTokens.value = parseInt(tokens)
    return saveSettingToDb('maxOutputTokens', tokens)
  }
  
  function setTheme(newTheme) {
    theme.value = newTheme
    return saveSettingToDb('theme', newTheme)
  }
  
  function setMaxHistoryItems(max) {
    const value = parseInt(max) || 50
    maxHistoryItems.value = value
    return saveSettingToDb('maxHistoryItems', value)
  }
  
  function setStructuredOutput(value) {
    structuredOutput.value = value
    return saveSettingToDb('structuredOutput', value)
  }
  
  function setOutputSchema(schema) {
    outputSchema.value = schema
    return saveSettingToDb('outputSchema', schema)
  }
  
  // Database operations
  async function loadAllSettings() {
    isLoading.value = true
    error.value = null
    
    try {
      const storedSettings = await db.settings.toArray()
      
      storedSettings.forEach(item => {
        switch (item.key) {
          case 'apiKey':
            apiKey.value = item.value
            break
          case 'modelName':
            modelName.value = item.value
            break
          case 'systemPrompt':
            systemPrompt.value = item.value
            break
          case 'temperature':
            temperature.value = parseFloat(item.value)
            break
          case 'topP':
            topP.value = parseFloat(item.value)
            break
          case 'maxOutputTokens':
            maxOutputTokens.value = parseInt(item.value)
            break
          case 'theme':
            theme.value = item.value
            break
          case 'maxHistoryItems':
            maxHistoryItems.value = parseInt(item.value)
            break
          case 'structuredOutput':
            structuredOutput.value = item.value === 'true' || item.value === true
            break
          case 'outputSchema':
            outputSchema.value = item.value
            break
        }
      })
      
      // Initialize missing settings
      await initializeDefaultSettings()
      
      return true
    } catch (err) {
      console.error("Failed to load settings:", err)
      error.value = err.message || 'Failed to load settings'
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  async function saveSettingToDb(key, value) {
    try {
      await db.settings.put({ key, value })
      return true
    } catch (err) {
      console.error(`Failed to save setting ${key}:`, err)
      error.value = err.message || `Failed to save setting ${key}`
      return false
    }
  }
  
  async function saveAllSettings() {
    isLoading.value = true
    error.value = null
    
    try {
      const settingsToSave = [
        { key: 'apiKey', value: apiKey.value },
        { key: 'modelName', value: modelName.value },
        { key: 'systemPrompt', value: systemPrompt.value },
        { key: 'temperature', value: temperature.value },
        { key: 'topP', value: topP.value },
        { key: 'maxOutputTokens', value: maxOutputTokens.value },
        { key: 'theme', value: theme.value },
        { key: 'maxHistoryItems', value: maxHistoryItems.value },
        { key: 'structuredOutput', value: structuredOutput.value },
        { key: 'outputSchema', value: outputSchema.value }
      ]
      
      await db.settings.bulkPut(settingsToSave)
      return true
    } catch (err) {
      console.error("Failed to save all settings:", err)
      error.value = err.message || 'Failed to save settings'
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  // Initialize default settings if they don't exist
  async function initializeDefaultSettings() {
    const defaultSettings = {
      apiKey: apiKey.value || '',
      modelName: modelName.value || 'gemini-1.5-flash',
      systemPrompt: systemPrompt.value || '',
      temperature: temperature.value !== undefined ? temperature.value : 0.9,
      topP: topP.value !== undefined ? topP.value : 1,
      maxOutputTokens: maxOutputTokens.value !== undefined ? maxOutputTokens.value : 2048,
      theme: theme.value || 'light',
      maxHistoryItems: maxHistoryItems.value || 50,
      structuredOutput: structuredOutput.value !== undefined ? structuredOutput.value : false,
      outputSchema: outputSchema.value || '{\n  "type": "object",\n  "properties": {\n    "result": {\n      "type": "string"\n    }\n  }\n}'
    }

    for (const [key, value] of Object.entries(defaultSettings)) {
      const existing = await db.settings.get(key)
      if (!existing) {
        await db.settings.put({ key, value })
      }
    }
  }
  
  // Initialize settings
  function initializeSettings() {
    // Load settings from database
    loadAllSettings()
    
    // Apply saved theme on load
    applyTheme(theme.value)
  }
  
  // Get model generation config
  function getModelConfig() {
    return {
      temperature: temperature.value,
      topP: topP.value,
      maxOutputTokens: maxOutputTokens.value
    }
  }
  
  // Get structured output configuration
  function getStructuredOutputConfig() {
    if (!structuredOutput.value) return null
    
    try {
      // Parse and validate JSON schema
      const schema = JSON.parse(outputSchema.value)
      return { schema }
    } catch (err) {
      console.error("Invalid output schema JSON:", err)
      return null
    }
  }
  
  return {
    // State
    apiKey,
    modelName,
    systemPrompt,
    temperature,
    topP,
    maxOutputTokens,
    theme,
    maxHistoryItems,
    structuredOutput,
    outputSchema,
    isLoading,
    error,
    
    // Getters
    getModelConfig,
    getStructuredOutputConfig,
    
    // Actions
    setApiKey,
    setModelName,
    setSystemPrompt,
    setTemperature,
    setTopP,
    setMaxOutputTokens,
    setTheme,
    setMaxHistoryItems,
    setStructuredOutput,
    setOutputSchema,
    loadAllSettings,
    saveSettingToDb,
    saveAllSettings,
    initializeSettings
  }
}, {
  // Persistence configuration
  persist: {
    key: 'promptbox-settings',
    storage: localStorage,
    paths: [
      'apiKey', 
      'modelName', 
      'systemPrompt',
      'temperature',
      'topP',
      'maxOutputTokens',
      'theme', 
      'maxHistoryItems',
      'structuredOutput',
      'outputSchema'
    ]
  }
})