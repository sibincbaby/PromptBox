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

    <div v-else class="space-y-5">
      <!-- API Key Configuration -->
      <form @submit.prevent="saveApiKey" class="bg-white rounded-xl shadow-sm overflow-hidden">
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
            <button 
              type="button" 
              @click="showApiKey = !showApiKey" 
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 focus-visible-ring rounded-full"
              :aria-label="showApiKey ? 'Hide API key' : 'Show API key'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                     :d="showApiKey 
                         ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21' 
                         : 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'" />
              </svg>
            </button>
          </div>
          <p class="mt-2 text-xs text-accessible-gray">Your API key is stored locally in your browser and is required to use the Gemini API.</p>
          <p class="mt-1 text-xs text-accessible-gray">Visit <a href="https://ai.google.dev/" target="_blank" class="text-indigo-600 hover:underline focus-visible-ring rounded">Google AI Studio</a> to get an API key.</p>
          
          <!-- Save API Key button inside API Configuration section -->
          <div class="flex justify-end mt-4">
            <button 
              type="submit" 
              class="w-full sm:w-auto px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors active:scale-95 focus-visible-ring"
              :disabled="isApiKeyEmpty"
            >
              Save API Key
            </button>
          </div>
        </div>
      </form>

      <!-- Version Information and Updates -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="p-4 border-b border-gray-100">
          <h3 class="text-base font-medium text-gray-800">App Information</h3>
        </div>
        
        <div class="p-4">
          <div class="flex justify-between items-center mb-3">
            <span class="text-sm text-gray-700">Version</span>
            <span v-if="updateAvailable" class="text-sm font-medium">
              {{ appVersion }} 
              <span class="text-green-600">
                (Update available: {{ pendingVersion || 'New version' }})
              </span>
            </span>
            <span v-else class="text-sm font-medium">{{ appVersion }}</span>
          </div>
          
          <div class="flex justify-between items-center mb-4">
            <span class="text-sm text-gray-700">Last Updated</span>
            <span class="text-sm font-medium">{{ lastUpdatedFormatted }}</span>
          </div>
          
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p class="text-xs text-accessible-gray">Check for new app updates and install them.</p>
            <button 
              type="button" 
              @click="checkForUpdates"
              :disabled="isCheckingForUpdates"
              class="w-full sm:w-auto px-3 py-2 text-xs font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors active:scale-95 focus-visible-ring whitespace-nowrap"
            >
              <span v-if="isCheckingForUpdates">Checking...</span>
              <span v-else>Check for Updates</span>
            </button>
          </div>
          
          <div v-if="updateAvailable" class="mt-3">
            <div class="bg-green-50 border-l-4 border-green-500 p-3 rounded-lg">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-green-700">Update available! Click to install:</p>
                  <button 
                    @click="installUpdate" 
                    class="mt-1 text-sm font-medium text-green-700 underline focus-visible-ring rounded"
                  >
                    Install Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, inject } from 'vue';
import { useSettingsStore } from '@/store/modules/settingsStore';
import { useNotificationStore } from '@/store/modules/notificationStore';

// Import the necessary registration functions from vite-plugin-pwa
import { useRegisterSW } from 'virtual:pwa-register/vue';

// Use vite-plugin-pwa's built-in update registration
const { updateServiceWorker, needRefresh } = useRegisterSW({
  immediate: true,
  onRegistered(registration) {
    console.log('Service worker registered:', registration);
  },
  onRegisterError(error) {
    console.error('Service worker registration error:', error);
  }
});

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
const isCheckingForUpdates = ref(false);
const updateAvailable = ref(false);
const pendingVersion = ref(null); // Store pending version when update is available
const registration = ref(null);

// Computed property to check if API key is empty
const isApiKeyEmpty = computed(() => {
  return !settings.apiKey || settings.apiKey.trim() === '';
});

// Get app version from the global variable via inject
const appVersion = inject('appVersion');

// Last updated date
const lastUpdatedFormatted = computed(() => {
  if (!settingsStore.lastUpdated) {
    return "Not available";
  }
  
  const date = new Date(settingsStore.lastUpdated);
  return date.toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

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
  checkServiceWorkerRegistration();
});

// Save API Key to the store - updated method name for clarity
const saveApiKey = async () => {
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

// Check if service worker is registered
const checkServiceWorkerRegistration = async () => {
  if ('serviceWorker' in navigator) {
    try {
      registration.value = await navigator.serviceWorker.getRegistration();
      
      // Add event listener to detect new service worker
      if (registration.value) {
        setupServiceWorkerUpdateListeners(registration.value);
      }
    } catch (error) {
      console.error('Error checking service worker registration:', error);
    }
  }
};

// Setup listeners for service worker updates
const setupServiceWorkerUpdateListeners = (reg) => {
  // Listen for new service worker installation
  reg.addEventListener('updatefound', () => {
    // A new service worker is being installed
    const newWorker = reg.installing;
    
    // Listen for state changes on the new service worker
    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        // New service worker is installed and ready to take over
        updateAvailable.value = true;
        notificationStore.success('Update available! Ready to install.');
      }
    });
  });
};

// Check for app updates - use vite-plugin-pwa's update mechanism
const checkForUpdates = async () => {
  isCheckingForUpdates.value = true;
  error.value = null;
  
  try {
    // Force check for updates using vite-plugin-pwa's mechanism
    await updateServiceWorker(true); // The 'true' parameter forces the update
    
    // If needRefresh is already true, there was an update found
    if (needRefresh.value) {
      updateAvailable.value = true;
      // Fetch the current package.json version to update display
      try {
        const response = await fetch('/package.json?t=' + Date.now());
        if (response.ok) {
          const packageData = await response.json();
          pendingVersion.value = packageData.version;
        }
      } catch (err) {
        console.error('Error fetching updated version:', err);
      }
      notificationStore.success('Update available! Ready to install.');
    } else {
      // Check again after a short delay to ensure update had time to be detected
      setTimeout(async () => {
        if (needRefresh.value) {
          updateAvailable.value = true;
          // Try to get updated version
          try {
            const response = await fetch('/package.json?t=' + Date.now());
            if (response.ok) {
              const packageData = await response.json();
              pendingVersion.value = packageData.version;
            }
          } catch (err) {
            console.error('Error fetching updated version:', err);
          }
          notificationStore.success('Update available! Ready to install.');
        } else {
          notificationStore.info('Your app is up to date!');
          
          // Update the "last checked" timestamp
          settingsStore.setLastUpdated(new Date().toISOString());
        }
        isCheckingForUpdates.value = false;
      }, 1000);
    }
  } catch (err) {
    console.error('Error checking for updates:', err);
    notificationStore.error('Failed to check for updates');
    error.value = err.message || 'Failed to check for updates';
    isCheckingForUpdates.value = false;
  }
};

// Install available update
const installUpdate = () => {
  if (needRefresh.value) {
    // Use the vite-plugin-pwa's reload mechanism
    window.location.reload();
    
    // Update the last updated timestamp
    settingsStore.setLastUpdated(new Date().toISOString());
  } else {
    // No update available, force a check
    checkForUpdates();
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

