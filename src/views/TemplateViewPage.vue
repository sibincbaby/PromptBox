<template>
  <div class="template-view-page bg-gray-50 min-h-full pb-16">
    <!-- Header with back button -->
    <div class="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
      <div class="flex items-center justify-between p-4">
        <div class="flex items-center">
          <button @click="navigateBack" class="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 class="text-lg font-medium ml-2">Template Details</h2>
        </div>
        <div class="flex space-x-2">
          <button 
            @click="editTemplate" 
            class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors active:scale-95">
            Edit
          </button>
        </div>
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

    <!-- Template Not Found -->
    <div v-else-if="!template" class="p-4">
      <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-md animate-fade-in">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">Template not found</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Template Details -->
    <div v-else class="p-4">
      <!-- Header with Template Name and Status -->
      <div class="bg-white rounded-lg shadow-sm p-5 mb-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-800">{{ template.name }}</h3>
          <div>
            <span v-if="isActiveTemplate" class="ml-2 bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full">
              Active
            </span>
            <span v-else-if="template.isDefault" class="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
              Default
            </span>
          </div>
        </div>
        <div class="text-xs text-gray-500 mt-1">
          <span v-if="template.createdAt">Created: {{ formatDate(template.createdAt) }}</span>
          <span v-if="template.updatedAt" class="ml-2">Updated: {{ formatDate(template.updatedAt) }}</span>
        </div>
      </div>

      <!-- Configuration Details -->
      <div class="space-y-4">
        <!-- Model -->
        <div class="bg-white rounded-lg shadow-sm p-5">
          <h4 class="text-sm font-medium text-gray-700 mb-2">Model</h4>
          <p class="text-gray-800">{{ getModelLabel(template.config.modelName) }}</p>
        </div>
        
        <!-- System Prompt -->
        <div class="bg-white rounded-lg shadow-sm p-5">
          <h4 class="text-sm font-medium text-gray-700 mb-2">System Prompt</h4>
          <div class="bg-gray-50 p-3 rounded border border-gray-100">
            <p v-if="template.config.systemPrompt" class="text-gray-800 whitespace-pre-wrap">{{ template.config.systemPrompt }}</p>
            <p v-else class="text-gray-500 italic">No system prompt specified</p>
          </div>
        </div>
        
        <!-- Generation Parameters -->
        <div class="bg-white rounded-lg shadow-sm p-5">
          <h4 class="text-sm font-medium text-gray-700 mb-3">Generation Parameters</h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs font-medium text-gray-500">Temperature</p>
              <p class="text-gray-800">{{ template.config.temperature.toFixed(1) }}</p>
              <div class="w-full h-1 bg-gray-200 rounded-full mt-1">
                <div class="h-1 bg-indigo-500 rounded-full" :style="{ width: `${template.config.temperature * 100}%` }"></div>
              </div>
            </div>
            
            <div>
              <p class="text-xs font-medium text-gray-500">Top-P</p>
              <p class="text-gray-800">{{ template.config.topP.toFixed(1) }}</p>
              <div class="w-full h-1 bg-gray-200 rounded-full mt-1">
                <div class="h-1 bg-indigo-500 rounded-full" :style="{ width: `${template.config.topP * 100}%` }"></div>
              </div>
            </div>
            
            <div>
              <p class="text-xs font-medium text-gray-500">Max Output Tokens</p>
              <p class="text-gray-800">{{ template.config.maxOutputTokens }}</p>
              <div class="w-full h-1 bg-gray-200 rounded-full mt-1">
                <div class="h-1 bg-indigo-500 rounded-full" :style="{ width: `${(template.config.maxOutputTokens / 8192) * 100}%` }"></div>
              </div>
            </div>
            
            <div>
              <p class="text-xs font-medium text-gray-500">Structured Output</p>
              <p class="text-gray-800">{{ template.config.structuredOutput ? 'Enabled' : 'Disabled' }}</p>
            </div>
          </div>
        </div>
        
        <!-- Output Schema (shown only when structured output is enabled) -->
        <div v-if="template.config.structuredOutput" class="bg-white rounded-lg shadow-sm p-5">
          <h4 class="text-sm font-medium text-gray-700 mb-2">Output Schema</h4>
          <pre class="bg-gray-50 p-3 rounded border border-gray-100 text-xs font-mono overflow-x-auto">{{ formatJSON(template.config.outputSchema) }}</pre>
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSettingsStore } from '@/store/modules/settingsStore';

const props = defineProps({
  templateId: {
    type: Number,
    required: true
  }
});

const router = useRouter();
const settingsStore = useSettingsStore();

// State
const template = ref(null);
const isLoading = ref(true);
const statusMessage = ref(null);

// Available model options for display
const availableModels = [
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
  { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
  { value: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite' }
];

// Check if this is the active template
const isActiveTemplate = computed(() => {
  return template.value && settingsStore.currentTemplateId === template.value.id.toString();
});

// Load template data
onMounted(async () => {
  isLoading.value = true;
  await loadTemplate();
});

// Load template by ID
async function loadTemplate() {
  try {
    await settingsStore.loadTemplates();
    template.value = settingsStore.templates.find(t => t.id === props.templateId);
    
    if (!template.value) {
      showStatus('error', 'Template not found');
      setTimeout(() => router.push('/templates'), 1500);
    }
  } catch (error) {
    console.error('Failed to load template:', error);
    showStatus('error', `Failed to load template: ${error.message}`);
  } finally {
    isLoading.value = false;
  }
}

// Apply this template
async function applyTemplate() {
  if (!template.value) return;
  
  try {
    await settingsStore.loadTemplate(template.value.id);
    
    // Add haptic feedback if available
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([20, 30, 20]);
    }
    
    showStatus('success', 'Template applied successfully');
  } catch (error) {
    console.error('Failed to apply template:', error);
    showStatus('error', `Failed to apply template: ${error.message}`);
  }
}

// Navigate to edit template page
function editTemplate() {
  if (!template.value) return;
  
  // Log the action and template ID for debugging
  console.log('Editing template with ID:', template.value.id);
  
  // Add haptic feedback
  if (window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(20);
  }
  
  // Navigate to the edit page with the correct template ID
  router.push(`/template/edit/${template.value.id}`);
}

// Get model label from value
function getModelLabel(modelValue) {
  const model = availableModels.find(m => m.value === modelValue);
  return model ? model.label : modelValue;
}

// Format date
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

// Format JSON for display
function formatJSON(jsonString) {
  try {
    return JSON.stringify(JSON.parse(jsonString), null, 2);
  } catch (err) {
    return jsonString;
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
/* Animation for appearing elements */
.animate-fade-in {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
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