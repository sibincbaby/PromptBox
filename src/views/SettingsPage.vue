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
      <!-- API Key Configuration -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="p-4 border-b border-gray-100">
          <h3 class="text-base font-medium text-gray-800">API Configuration</h3>
        </div>
        
        <!-- API Key -->
        <div class="p-4">
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
          <p class="mt-2 text-xs text-gray-500">Your API key is stored locally in your browser and is required to use the Gemini API.</p>
          <p class="mt-1 text-xs text-gray-500">Visit <a href="https://ai.google.dev/" target="_blank" class="text-indigo-600 hover:underline">Google AI Studio</a> to get an API key.</p>
        </div>
      </div>

      <!-- Action Buttons -->      
      <div class="flex justify-end pt-3">
        <button type="submit" 
                class="px-5 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors active:scale-95">
          Save API Key
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useSettingsStore } from '@/store/modules/settingsStore';
import { useNotificationStore } from '@/store/modules/notificationStore';

// Use the settings store
const settingsStore = useSettingsStore();
const notificationStore = useNotificationStore();

// Initialize reactive settings object with only API Key
const settings = reactive({
  apiKey: '', // Initialize with empty string
});

// UI state variables
const isLoading = ref(true);
const error = ref(null);
const showApiKey = ref(false);

// Load settings from store when component mounts
const loadSettings = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    // Load only API key from the store
    settings.apiKey = settingsStore.apiKey;
    console.log("API Key loaded successfully");
  } catch (err) {
    console.error("Failed to load API Key:", err);
    error.value = err.message || 'Could not load settings from database.';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadSettings();
});

// Save API Key to the store
const saveSettings = async () => {
  isLoading.value = true;
  
  try {
    // Save only API Key to the store
    await settingsStore.setApiKey(settings.apiKey);
    
    // Add haptic feedback if available
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([30, 30, 30]);
    }
    
    // Use notification store
    notificationStore.success('API Key saved successfully');
    
  } catch (err) {
    console.error("Failed to save API Key:", err);
    
    // Use notification store for error
    notificationStore.error('Failed to save API Key');
    
    // Add error haptic feedback
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(100);
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Animations for toast notifications */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

