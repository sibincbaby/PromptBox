<template>
  <div class="p-4 pb-16 bg-gray-50">
    <h2 class="text-xl font-medium mb-5 px-1">Settings</h2>

    <div v-if="isLoading" class="flex justify-center py-8">
      <div class="flex space-x-2">
        <div class="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style="animation-delay: 0s"></div>
        <div class="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        <div class="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
      </div>
    </div>
    
    <div v-else-if="error" class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-4 animate-fade-in">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{{ error }}</p>
        </div>
      </div>
    </div>

    <form v-else @submit.prevent="saveSettings" class="space-y-5">
      <!-- Template Manager -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="p-4 border-b border-gray-100">
          <h3 class="text-base font-medium text-gray-800">Configuration Templates</h3>
        </div>
        <div class="p-4">
          <TemplateManager mode="manager" />
        </div>
      </div>
      
      <!-- Settings Sections -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="p-4 border-b border-gray-100">
          <h3 class="text-base font-medium text-gray-800">API Configuration</h3>
        </div>
        
        <!-- API Key -->
        <div class="p-4 border-b border-gray-50">
          <label for="apiKey" class="block text-sm font-medium text-gray-700 mb-2">API Key</label>
          <div class="relative">
            <input :type="showApiKey ? 'text' : 'password'" id="apiKey" v-model="settings.apiKey" 
                  placeholder="Enter your Gemini API Key" 
                  class="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow text-sm" />
            <button type="button" @click="showApiKey = !showApiKey" 
                   class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                     :d="showApiKey 
                         ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21' 
                         : 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'" />
              </svg>
            </button>
          </div>
          <p class="mt-2 text-xs text-gray-500">Your API key is stored locally in your browser.</p>
        </div>
        
        <!-- Model Selection -->
        <div class="p-4">
          <label for="modelName" class="block text-sm font-medium text-gray-700 mb-2">Model</label>
          <div class="relative">
            <select id="modelName" v-model="settings.modelName" 
                    class="w-full p-3 border border-gray-200 rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow pr-10 text-sm">
              <option value="gemini-1.5-flash">gemini-1.5-flash</option>
              <option value="gemini-pro">gemini-pro</option>
              <!-- Add other models as needed -->
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Model Parameters -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="p-4 border-b border-gray-100">
          <h3 class="text-base font-medium text-gray-800">Model Parameters</h3>
        </div>
        
        <!-- System Prompt -->
        <div class="p-4 border-b border-gray-50">
          <label for="systemPrompt" class="block text-sm font-medium text-gray-700 mb-2">System Prompt</label>
          <textarea id="systemPrompt" v-model="settings.systemPrompt" rows="3" 
                   placeholder="Optional: Provide instructions for the model..." 
                   class="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow text-sm"></textarea>
        </div>
        
        <!-- Temperature Slider -->
        <div class="p-4 border-b border-gray-50">
          <div class="flex justify-between items-center mb-2">
            <label for="temperature" class="block text-sm font-medium text-gray-700">Temperature</label>
            <span class="text-sm font-medium text-indigo-600">{{ settings.temperature.toFixed(2) }}</span>
          </div>
          
          <input type="range" id="temperature" v-model.number="settings.temperature" min="0" max="1" step="0.01" 
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                
          <p class="mt-2 text-xs text-gray-500">Controls randomness. Lower values make the output more deterministic.</p>
        </div>
        
        <!-- Top-p Slider -->
        <div class="p-4 border-b border-gray-50">
          <div class="flex justify-between items-center mb-2">
            <label for="topP" class="block text-sm font-medium text-gray-700">Top-p</label>
            <span class="text-sm font-medium text-indigo-600">{{ settings.topP.toFixed(2) }}</span>
          </div>
          
          <input type="range" id="topP" v-model.number="settings.topP" min="0" max="1" step="0.01" 
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                
          <p class="mt-2 text-xs text-gray-500">Nucleus sampling. Considers tokens with top probability mass.</p>
        </div>
        
        <!-- Max Output Tokens -->
        <div class="p-4">
          <label for="maxOutputTokens" class="block text-sm font-medium text-gray-700 mb-2">Max Output Tokens</label>
          
          <div class="flex items-center">
            <button type="button" @click="decrementTokens"
                  class="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-l-lg text-gray-500 hover:bg-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
              </svg>
            </button>
            
            <input type="number" id="maxOutputTokens" v-model.number="settings.maxOutputTokens" min="1" 
                  class="w-full p-3 border-y border-gray-200 focus:outline-none text-center text-sm" />
            
            <button type="button" @click="incrementTokens"
                  class="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-r-lg text-gray-500 hover:bg-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
          
          <p class="mt-2 text-xs text-gray-500">Maximum number of tokens the model can generate in one response.</p>
        </div>
      </div>

      <!-- Structured Output Settings -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="p-4 border-b border-gray-100">
          <h3 class="text-base font-medium text-gray-800">Structured Output</h3>
        </div>
        
        <!-- Structured Output Toggle -->
        <div class="p-4 border-b border-gray-50">
          <div class="flex items-center justify-between">
            <label for="structuredOutput" class="block text-sm font-medium text-gray-700">Enable Structured Output</label>
            <div class="relative inline-block w-10 align-middle select-none">
              <input 
                type="checkbox" 
                id="structuredOutput" 
                v-model="settings.structuredOutput"
                class="sr-only"
                @change="toggleStructuredOutput"
              />
              <label 
                for="structuredOutput" 
                class="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                :class="{'bg-indigo-600': settings.structuredOutput}"
              >
                <span 
                  class="block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out"
                  :class="{'translate-x-4': settings.structuredOutput}"
                ></span>
              </label>
            </div>
          </div>
          <p class="mt-2 text-xs text-gray-500">Force Gemini to return structured JSON output based on a schema.</p>
        </div>
        
        <!-- JSON Schema Editor -->
        <div v-if="settings.structuredOutput" class="p-4 border-b border-gray-50">
          <div class="flex justify-between items-center mb-2">
            <label for="outputSchema" class="block text-sm font-medium text-gray-700">JSON Schema</label>
            <button 
              type="button" 
              @click="formatSchema" 
              class="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-2 py-1 rounded transition-colors"
            >
              Format JSON
            </button>
          </div>
          
          <textarea 
            id="outputSchema" 
            v-model="settings.outputSchema" 
            rows="8" 
            class="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow text-sm font-mono"
            :class="{'border-red-300 focus:ring-red-500/50': schemaError}"
            placeholder='{
  "type": "object",
  "properties": {
    "result": {
      "type": "string"
    }
  }
}'
          ></textarea>
          
          <p class="mt-2 text-xs" :class="schemaError ? 'text-red-500' : 'text-gray-500'">
            {{ schemaError || 'JSON Schema for structuring the model output. Must be valid JSON Schema format.' }}
          </p>
          
          <!-- Schema Examples -->
          <div class="mt-3">
            <details class="text-sm">
              <summary class="text-indigo-600 cursor-pointer">Show Schema Examples</summary>
              <div class="mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-3">
                <div>
                  <h4 class="font-medium text-gray-700">Simple Result</h4>
                  <button 
                    type="button" 
                    @click="applySchemaExample('simple')" 
                    class="mt-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded transition-colors"
                  >
                    Apply
                  </button>
                  <pre class="mt-1 text-xs text-gray-600 overflow-x-auto">{
  "type": "object",
  "properties": {
    "result": {
      "type": "string"
    }
  }
}</pre>
                </div>
                <div>
                  <h4 class="font-medium text-gray-700">Structured Summary</h4>
                  <button 
                    type="button" 
                    @click="applySchemaExample('summary')" 
                    class="mt-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded transition-colors"
                  >
                    Apply
                  </button>
                  <pre class="mt-1 text-xs text-gray-600 overflow-x-auto">{
  "type": "object",
  "properties": {
    "summary": {
      "type": "string",
      "description": "Brief summary of the response"
    },
    "points": {
      "type": "array",
      "description": "Key points from the response",
      "items": {
        "type": "string"
      }
    }
  }
}</pre>
                </div>
                <div>
                  <h4 class="font-medium text-gray-700">Q&A Format</h4>
                  <button 
                    type="button" 
                    @click="applySchemaExample('qa')" 
                    class="mt-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded transition-colors"
                  >
                    Apply
                  </button>
                  <pre class="mt-1 text-xs text-gray-600 overflow-x-auto">{
  "type": "object",
  "properties": {
    "answer": {
      "type": "string",
      "description": "Direct answer to the question"
    },
    "explanation": {
      "type": "string",
      "description": "Explanation or context for the answer"
    },
    "sources": {
      "type": "array",
      "description": "Possible sources for this information",
      "items": {
        "type": "string"
      }
    }
  }
}</pre>
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->      
      <div class="flex justify-between pt-3">
        <button type="button" @click="loadSettings" 
                class="px-5 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors active:scale-95">
          Reset
        </button>
        
        <button type="submit" 
                class="px-5 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors active:scale-95">
          Save Settings
        </button>
      </div>
      
      <!-- Save Status Notification -->
      <transition name="fade">
        <div v-if="saveStatus" 
            :class="[
              'fixed bottom-20 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full text-sm text-white shadow-lg',
              saveStatus.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            ]">
          <div class="flex items-center space-x-1">
            <svg v-if="saveStatus.type === 'success'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>{{ saveStatus.message }}</span>
          </div>
        </div>
      </transition>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { db } from '@/db/db'; // Updated import using @ alias
import TemplateManager from '@/components/TemplateManager.vue';
import { useSettingsStore } from '@/store/modules/settingsStore';

// Use the settings store
const settingsStore = useSettingsStore();

// Initialize reactive settings object with default values
const settings = reactive({
  apiKey: '', // Initialize with empty string
  modelName: 'gemini-1.5-flash', // Initialize with default model
  systemPrompt: '', // Initialize with empty string
  temperature: 0.9,
  topP: 1,
  maxOutputTokens: 2048,
  structuredOutput: false,
  outputSchema: '{\n  "type": "object",\n  "properties": {\n    "result": {\n      "type": "string"\n    }\n  }\n}',
});

const isLoading = ref(true);
const error = ref(null);
const saveStatus = ref(null); // { type: 'success' | 'error', message: string }
const showApiKey = ref(false);
const schemaError = ref(null);

// Helper functions for token adjustment
const incrementTokens = () => {
  settings.maxOutputTokens += 512;
  // Add haptic feedback
  if (window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(20);
  }
};

const decrementTokens = () => {
  if (settings.maxOutputTokens > 512) {
    settings.maxOutputTokens -= 512;
  } else {
    settings.maxOutputTokens = 1;
  }
  // Add haptic feedback
  if (window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(20);
  }
};

// Format JSON Schema with proper indentation
const formatSchema = () => {
  try {
    const parsed = JSON.parse(settings.outputSchema);
    settings.outputSchema = JSON.stringify(parsed, null, 2);
    schemaError.value = null;
    
    // Add haptic feedback
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(20);
    }
  } catch (err) {
    schemaError.value = "Invalid JSON: " + err.message;
    
    // Add error haptic feedback
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(100);
    }
  }
};

// Toggle structured output option
const toggleStructuredOutput = () => {
  if (settings.structuredOutput) {
    // Validate the schema when enabled
    validateSchema();
  } else {
    // Clear any existing errors when disabled
    schemaError.value = null;
  }
  
  // Add haptic feedback
  if (window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(20);
  }
};

// Validate JSON Schema format
const validateSchema = () => {
  try {
    JSON.parse(settings.outputSchema);
    schemaError.value = null;
    return true;
  } catch (err) {
    schemaError.value = "Invalid JSON: " + err.message;
    return false;
  }
};

// Apply schema examples
const applySchemaExample = (type) => {
  switch (type) {
    case 'simple':
      settings.outputSchema = '{\n  "type": "object",\n  "properties": {\n    "result": {\n      "type": "string"\n    }\n  }\n}';
      break;
    case 'summary':
      settings.outputSchema = '{\n  "type": "object",\n  "properties": {\n    "summary": {\n      "type": "string",\n      "description": "Brief summary of the response"\n    },\n    "points": {\n      "type": "array",\n      "description": "Key points from the response",\n      "items": {\n        "type": "string"\n      }\n    }\n  }\n}';
      break;
    case 'qa':
      settings.outputSchema = '{\n  "type": "object",\n  "properties": {\n    "answer": {\n      "type": "string",\n      "description": "Direct answer to the question"\n    },\n    "explanation": {\n      "type": "string",\n      "description": "Explanation or context for the answer"\n    },\n    "sources": {\n      "type": "array",\n      "description": "Possible sources for this information",\n      "items": {\n        "type": "string"\n      }\n    }\n  }\n}';
      break;
  }
  
  // Clear any errors and add haptic feedback
  schemaError.value = null;
  if (window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate([20, 20]);
  }
};

// Watch for schema changes to validate in real-time
watch(() => settings.outputSchema, (newSchema) => {
  if (settings.structuredOutput) {
    // Only validate if structured output is enabled
    validateSchema();
  }
});

// Load settings from Dexie when component mounts
const loadSettings = async () => {
  isLoading.value = true;
  error.value = null;
  saveStatus.value = null;
  schemaError.value = null;
  
  try {
    // Load settings from the store instead of directly from DB
    settings.apiKey = settingsStore.apiKey;
    settings.modelName = settingsStore.modelName;
    settings.systemPrompt = settingsStore.systemPrompt;
    settings.temperature = settingsStore.temperature;
    settings.topP = settingsStore.topP;
    settings.maxOutputTokens = settingsStore.maxOutputTokens;
    settings.structuredOutput = settingsStore.structuredOutput;
    settings.outputSchema = settingsStore.outputSchema;
    
    // Validate schema if structured output is enabled
    if (settings.structuredOutput) {
      validateSchema();
    }
    
    console.log("Settings loaded:", JSON.parse(JSON.stringify(settings)));
  } catch (err) {
    console.error("Failed to load settings:", err);
    error.value = err.message || 'Could not load settings from database.';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadSettings();
});

// Save settings to the store
const saveSettings = async () => {
  isLoading.value = true; // Show loading/saving indicator potentially
  saveStatus.value = null;
  
  // Validate schema if structured output is enabled
  if (settings.structuredOutput && !validateSchema()) {
    isLoading.value = false;
    saveStatus.value = { type: 'error', message: 'Invalid JSON Schema' };
    
    // Add error haptic feedback
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(100);
    }
    
    // Clear error message after delay
    setTimeout(() => { saveStatus.value = null; }, 3000);
    return;
  }
  
  try {
    // Save settings to the store
    await settingsStore.setApiKey(settings.apiKey);
    await settingsStore.setModelName(settings.modelName);
    await settingsStore.setSystemPrompt(settings.systemPrompt);
    await settingsStore.setTemperature(settings.temperature);
    await settingsStore.setTopP(settings.topP);
    await settingsStore.setMaxOutputTokens(settings.maxOutputTokens);
    await settingsStore.setStructuredOutput(settings.structuredOutput);
    await settingsStore.setOutputSchema(settings.outputSchema);
    
    // Add haptic feedback
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([30, 30, 30]);
    }
    
    saveStatus.value = { type: 'success', message: 'Settings saved' };
  } catch (err) {
    console.error("Failed to save settings:", err);
    saveStatus.value = { type: 'error', message: 'Failed to save settings' };
    
    // Add error haptic feedback
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(100);
    }
  } finally {
    isLoading.value = false;
    // Clear success message after a delay
    if (saveStatus.value?.type === 'success') {
      setTimeout(() => { saveStatus.value = null; }, 3000);
    }
  }
};
</script>

<style scoped>
/* Native-like form controls */
input[type="range"] {
  height: 6px; /* Slightly thicker for better touch targets */
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  background: rgb(79, 70, 229); /* indigo-600 */
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: rgb(79, 70, 229); /* indigo-600 */
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

/* Toggle switch styling */
input[type="checkbox"]:checked + label {
  @apply bg-indigo-600;
}

input[type="checkbox"]:checked + label span {
  transform: translateX(100%);
}

/* Animations for toast notifications */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
</style>

