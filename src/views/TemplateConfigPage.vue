<template>
  <div class="template-config-page bg-gray-50 min-h-full pb-16">
    <!-- Header with back button -->
    <div class="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
      <div class="flex items-center justify-between p-4">
        <div class="flex items-center">
          <button @click="navigateBack" class="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 class="text-lg font-medium ml-2">{{ pageTitle }}</h2>
        </div>
        <button 
          @click="saveTemplate" 
          :disabled="!isFormValid"
          class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors active:scale-95">
          {{ mode === 'edit' ? 'Update' : 'Create' }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-8">
      <div class="flex space-x-2">
        <div class="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style="animation-delay: 0s"></div>
        <div class="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        <div class="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
      </div>
    </div>

    <!-- Form Content -->
    <div v-else class="p-4">
      <div class="space-y-6">
        <!-- Template Name Input -->
        <div class="bg-white rounded-lg shadow-sm p-5">
          <label for="templateName" class="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
          <input 
            type="text" 
            id="templateName"
            v-model="templateConfig.name" 
            placeholder="Enter a descriptive name"
            class="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow text-sm"
            autofocus
          />
          <p v-if="!templateConfig.name.trim()" class="mt-1 text-xs text-red-500">
            Template name is required
          </p>
        </div>
          
        <!-- Model Selection -->
        <div class="bg-white rounded-lg shadow-sm p-5">
          <label for="modelSelect" class="block text-sm font-medium text-gray-700 mb-2">Model</label>
          <div class="relative">
            <select 
              id="modelSelect" 
              v-model="templateConfig.modelName"
              class="w-full p-3 border border-gray-200 rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow pr-10 text-sm">
              <option v-for="model in availableModels" :key="model.value" :value="model.value">
                {{ model.label }}
              </option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
          
        <!-- System Prompt -->
        <div class="bg-white rounded-lg shadow-sm p-5">
          <label for="systemPrompt" class="block text-sm font-medium text-gray-700 mb-2">System Prompt</label>
          <textarea 
            id="systemPrompt" 
            v-model="templateConfig.systemPrompt" 
            rows="5" 
            placeholder="Optional: Provide instructions for the model..." 
            class="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow text-sm"
          ></textarea>
          <p class="mt-1 text-xs text-gray-500">
            System prompts help guide the model's behavior for all interactions
          </p>
        </div>
          
        <!-- Temperature Slider -->
        <div class="bg-white rounded-lg shadow-sm p-5">
          <div class="flex justify-between items-center mb-2">
            <label for="temperature" class="block text-sm font-medium text-gray-700">Temperature</label>
            <span class="text-sm text-gray-500">{{ templateConfig.temperature.toFixed(1) }}</span>
          </div>
          <input 
            type="range" 
            id="temperature" 
            v-model="templateConfig.temperature" 
            min="0" 
            max="1" 
            step="0.1"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>More Focused</span>
            <span>More Creative</span>
          </div>
          <p class="mt-2 text-xs text-gray-500">
            Controls randomness: Lower values are more deterministic, higher values more creative
          </p>
        </div>
          
        <!-- Top-P Slider -->
        <div class="bg-white rounded-lg shadow-sm p-5">
          <div class="flex justify-between items-center mb-2">
            <label for="topP" class="block text-sm font-medium text-gray-700">Top-P</label>
            <span class="text-sm text-gray-500">{{ templateConfig.topP.toFixed(1) }}</span>
          </div>
          <input 
            type="range" 
            id="topP" 
            v-model="templateConfig.topP" 
            min="0" 
            max="1" 
            step="0.1"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <p class="mt-2 text-xs text-gray-500">
            Nucleus sampling: Only consider tokens with top probability mass
          </p>
        </div>
          
        <!-- Max Output Tokens -->
        <div class="bg-white rounded-lg shadow-sm p-5">
          <div class="flex justify-between items-center mb-2">
            <label for="maxTokens" class="block text-sm font-medium text-gray-700">Max Output Tokens</label>
            <span class="text-sm text-gray-500">{{ templateConfig.maxOutputTokens }}</span>
          </div>
          <input 
            type="range" 
            id="maxTokens" 
            v-model="templateConfig.maxOutputTokens" 
            min="256" 
            max="8192" 
            step="256"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>Shorter</span>
            <span>Longer</span>
          </div>
          <p class="mt-2 text-xs text-gray-500">
            Maximum number of tokens the model can generate in a response
          </p>
        </div>
          
        <!-- Structured Output Toggle -->
        <div class="bg-white rounded-lg shadow-sm p-5">
          <div class="flex items-center justify-between">
            <label for="structuredOutput" class="block text-sm font-medium text-gray-700">Structured Output</label>
            <button 
              type="button"
              class="relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors"
              :class="templateConfig.structuredOutput ? 'bg-indigo-600' : 'bg-gray-200'"
              @click="templateConfig.structuredOutput = !templateConfig.structuredOutput"
            >
              <span class="sr-only">Toggle structured output</span>
              <span 
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                :class="templateConfig.structuredOutput ? 'translate-x-6' : 'translate-x-1'"
              ></span>
            </button>
          </div>
          <p class="text-xs text-gray-500 mt-1">Force the model to return a specific JSON structure</p>
        </div>
          
        <!-- Output Schema (shown only when structured output is enabled) -->
        <div v-if="templateConfig.structuredOutput" class="bg-white rounded-lg shadow-sm p-5">
          <label for="outputSchema" class="block text-sm font-medium text-gray-700 mb-2">Output Schema (JSON)</label>
          <textarea 
            id="outputSchema" 
            v-model="templateConfig.outputSchema" 
            rows="6" 
            placeholder="{}" 
            class="w-full p-3 border border-gray-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow text-sm"
          ></textarea>
          <p class="text-xs text-gray-500 mt-1">Define the expected JSON structure for the model's response</p>
          <div v-if="schemaError" class="mt-2 text-xs text-red-500">
            {{ schemaError }}
          </div>
        </div>
      </div>
    </div>

    <!-- Status message -->
    <transition name="fade">
      <div v-if="statusMessage" 
          class="fixed bottom-20 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full text-sm text-white shadow-lg"
          :class="statusMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'">
        {{ statusMessage.text }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useSettingsStore } from '@/store/modules/settingsStore';

const props = defineProps({
  mode: {
    type: String,
    default: 'create',
    validator: (value) => ['create', 'edit'].includes(value)
  },
  templateId: {
    type: Number,
    default: null
  }
});

const router = useRouter();
const route = useRoute();
const settingsStore = useSettingsStore();

// Template configuration with default values
const templateConfig = ref({
  name: '',
  modelName: 'gemini-1.5-flash',
  systemPrompt: '',
  temperature: 0.9,
  topP: 1,
  maxOutputTokens: 2048,
  structuredOutput: false,
  outputSchema: '{\n  "type": "object",\n  "properties": {\n    "result": {\n      "type": "string"\n    }\n  }\n}'
});

// UI state
const isLoading = ref(true);
const statusMessage = ref(null);
const schemaError = ref(null);

// Available model options
const availableModels = [
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
  { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
  { value: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite' }
];

// Page title based on mode
const pageTitle = computed(() => {
  return props.mode === 'create' 
    ? 'Create Template' 
    : 'Edit Template';
});

// Form validation
const isFormValid = computed(() => {
  return templateConfig.value.name.trim() !== '' && !schemaError.value;
});

// Load template data if in edit mode
onMounted(async () => {
  isLoading.value = true;
  
  try {
    // Initialize default values based on current settings
    if (props.mode === 'create') {
      await settingsStore.loadAllSettings();
      templateConfig.value = {
        name: '',
        modelName: settingsStore.modelName,
        systemPrompt: settingsStore.systemPrompt,
        temperature: settingsStore.temperature,
        topP: settingsStore.topP,
        maxOutputTokens: settingsStore.maxOutputTokens,
        structuredOutput: settingsStore.structuredOutput,
        outputSchema: settingsStore.outputSchema
      };
    } 
    // Load template data if in edit mode
    else if (props.mode === 'edit' && props.templateId) {
      await loadTemplateById(props.templateId);
    }
  } catch (error) {
    showStatus('error', `Failed to load template: ${error.message}`);
  } finally {
    isLoading.value = false;
  }
});

// Load a template by ID
async function loadTemplateById(id) {
  try {
    await settingsStore.loadTemplates();
    const template = settingsStore.templates.find(t => t.id === id);
    
    if (!template) {
      showStatus('error', 'Template not found');
      setTimeout(() => router.push('/templates'), 1500);
      return;
    }
    
    templateConfig.value = {
      name: template.name,
      ...template.config
    };
  } catch (error) {
    console.error('Failed to load template:', error);
    showStatus('error', `Failed to load template: ${error.message}`);
  }
}

// Watch for changes in structured output toggle
watch(() => templateConfig.value.structuredOutput, () => {
  validateSchema();
});

// Watch for changes in output schema
watch(() => templateConfig.value.outputSchema, () => {
  if (templateConfig.value.structuredOutput) {
    validateSchema();
  }
});

// Validate JSON schema
function validateSchema() {
  if (!templateConfig.value.structuredOutput) {
    schemaError.value = null;
    return;
  }
  
  try {
    JSON.parse(templateConfig.value.outputSchema);
    schemaError.value = null;
  } catch (error) {
    schemaError.value = 'Invalid JSON schema: ' + error.message;
  }
}

// Save template
async function saveTemplate() {
  if (!isFormValid.value) return;
  
  isLoading.value = true;
  
  try {
    // Extract configuration values
    const config = {
      modelName: templateConfig.value.modelName,
      systemPrompt: templateConfig.value.systemPrompt,
      temperature: parseFloat(templateConfig.value.temperature),
      topP: parseFloat(templateConfig.value.topP),
      maxOutputTokens: parseInt(templateConfig.value.maxOutputTokens),
      structuredOutput: templateConfig.value.structuredOutput,
      outputSchema: templateConfig.value.outputSchema
    };
    
    let templateId;
    
    // Create new or update existing template
    if (props.mode === 'edit' && props.templateId) {
      // First get the existing template
      const template = settingsStore.templates.find(t => t.id === props.templateId);
      if (template) {
        // Update the template
        await settingsStore.deleteTemplate(props.templateId);
        templateId = await settingsStore.saveTemplate(templateConfig.value.name, config);
        showStatus('success', 'Template updated successfully');
      } else {
        showStatus('error', 'Template not found');
      }
    } else {
      // Create new template
      templateId = await settingsStore.saveTemplate(templateConfig.value.name, config);
      showStatus('success', 'Template created successfully');
    }
    
    // Haptic feedback
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([30, 30, 30]);
    }
    
    // Navigate back to templates page after a brief delay
    setTimeout(() => {
      router.push('/templates');
    }, 1000);
  } catch (error) {
    console.error('Failed to save template:', error);
    showStatus('error', `Failed to save template: ${error.message}`);
  } finally {
    isLoading.value = false;
  }
}

// Show status message
function showStatus(type, text) {
  statusMessage.value = { type, text };
  setTimeout(() => {
    statusMessage.value = null;
  }, 3000);
}

// Navigate back to templates page
function navigateBack() {
  // Add haptic feedback
  if (window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(20);
  }
  
  router.push('/templates');
}
</script>

<style scoped>
/* Range slider styling */
input[type="range"] {
  -webkit-appearance: none;
  height: 8px;
  border-radius: 4px;
  background: #e2e8f0;
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #4f46e5;
  cursor: pointer;
  transition: transform 0.1s;
}

input[type="range"]::-webkit-slider-thumb:active {
  transform: scale(1.2);
}

input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #4f46e5;
  cursor: pointer;
  transition: transform 0.1s;
  border: none;
}

input[type="range"]::-moz-range-thumb:active {
  transform: scale(1.2);
}

/* Status message animation */
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