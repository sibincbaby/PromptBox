<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h2 class="text-2xl font-semibold mb-6">Settings</h2>

    <div v-if="isLoading" class="text-gray-500">Loading settings...</div>
    <div v-else-if="error" class="text-red-500 bg-red-100 p-3 rounded-lg mb-4">Error loading settings: {{ error }}</div>

    <form v-else @submit.prevent="saveSettings" class="space-y-6">
      <!-- API Key -->
      <div>
        <label for="apiKey" class="block text-sm font-medium text-gray-700">Gemini API Key</label>
        <input type="password" id="apiKey" v-model="settings.apiKey" placeholder="Enter your API Key" 
               class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
        <p class="mt-1 text-xs text-gray-500">Your API key is stored locally in your browser and is not sent anywhere else.</p>
      </div>

      <!-- Model Selection -->
      <div>
        <label for="modelName" class="block text-sm font-medium text-gray-700">Model Name</label>
        <select id="modelName" v-model="settings.modelName" 
                class="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          <option value="gemini-1.5-flash">gemini-1.5-flash</option>
          <option value="gemini-pro">gemini-pro</option>
          <!-- Add other models as needed -->
        </select>
      </div>

      <!-- System Prompt -->
      <div>
        <label for="systemPrompt" class="block text-sm font-medium text-gray-700">System Prompt (Instruction)</label>
        <textarea id="systemPrompt" v-model="settings.systemPrompt" rows="4" 
                  placeholder="Optional: Provide system-level instructions for the model..." 
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
      </div>

      <!-- Temperature -->
      <div>
        <label for="temperature" class="block text-sm font-medium text-gray-700">Temperature: {{ settings.temperature }}</label>
        <input type="range" id="temperature" v-model.number="settings.temperature" min="0" max="1" step="0.01" 
               class="mt-1 block w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-thumb">
        <p class="mt-1 text-xs text-gray-500">Controls randomness. Lower values (e.g., 0.1) make the output more deterministic.</p>
      </div>

      <!-- Top-p -->
      <div>
        <label for="topP" class="block text-sm font-medium text-gray-700">Top-p: {{ settings.topP }}</label>
        <input type="range" id="topP" v-model.number="settings.topP" min="0" max="1" step="0.01" 
               class="mt-1 block w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-thumb">
         <p class="mt-1 text-xs text-gray-500">Nucleus sampling. Considers tokens with probability mass adding up to this value.</p>
     </div>

      <!-- Max Output Tokens -->
      <div>
        <label for="maxOutputTokens" class="block text-sm font-medium text-gray-700">Max Output Tokens</label>
        <input type="number" id="maxOutputTokens" v-model.number="settings.maxOutputTokens" min="1" 
               class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
      </div>

      <!-- Structured Output (Placeholder) -->
      <!-- 
      <div>
        <label class="block text-sm font-medium text-gray-700">Structured Output Schema (JSON - Advanced)</label>
        <textarea rows="3" placeholder="Define a JSON schema for structured output (optional)..." 
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
      </div>
      -->

      <!-- Save/Reset Buttons -->
      <div class="flex justify-end space-x-3 pt-4">
        <button type="button" @click="loadSettings" 
                class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Reset Changes
        </button>
        <button type="submit" 
                class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Save Settings
        </button>
      </div>
      
      <div v-if="saveStatus" :class="[
          saveStatus.type === 'success' ? 'text-green-600' : 'text-red-600',
          'text-sm mt-2 text-right'
        ]">
        {{ saveStatus.message }}
      </div>

    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { db } from '../db'; // Import Dexie db instance

// Initialize reactive settings object with default values
const settings = reactive({
  apiKey: '', // Initialize with empty string
  modelName: 'gemini-1.5-flash', // Initialize with default model
  systemPrompt: '', // Initialize with empty string
  temperature: 0.9,
  topP: 1,
  maxOutputTokens: 2048,
});

const isLoading = ref(true);
const error = ref(null);
const saveStatus = ref(null); // { type: 'success' | 'error', message: string }

// Load settings from Dexie when component mounts
const loadSettings = async () => {
  isLoading.value = true;
  error.value = null;
  saveStatus.value = null;
  try {
    const storedSettings = await db.settings.toArray();
    // Use a temporary object to avoid reactivity issues during loading
    const loadedSettings = {};
    storedSettings.forEach(item => {
      loadedSettings[item.key] = item.value;
    });

    // Update the reactive object with loaded values or defaults
    for (const key in settings) {
      if (loadedSettings.hasOwnProperty(key)) {
        // Ensure correct type (especially for numbers)
        if (typeof settings[key] === 'number') {
          settings[key] = parseFloat(loadedSettings[key]);
        } else {
          settings[key] = loadedSettings[key];
        }
      } else {
        // If a setting exists in reactive object but not in DB, keep the default
        // This handles cases where new settings are added to the component
      }
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

// Save settings to Dexie
const saveSettings = async () => {
  isLoading.value = true; // Show loading/saving indicator potentially
  saveStatus.value = null;
  try {
    const settingsToSave = Object.entries(settings).map(([key, value]) => ({ key, value }));
    await db.settings.bulkPut(settingsToSave);
    console.log("Settings saved:", settingsToSave);
    saveStatus.value = { type: 'success', message: 'Settings saved successfully!' };
  } catch (err) {
    console.error("Failed to save settings:", err);
    saveStatus.value = { type: 'error', message: err.message || 'Failed to save settings.' };
  } finally {
     isLoading.value = false;
     // Optionally clear success message after a delay
     if (saveStatus.value?.type === 'success') {
       setTimeout(() => { saveStatus.value = null; }, 3000);
     }
  }
};

</script>

<style scoped>
/* Add specific styles for SettingsPage if needed */
/* Use standard CSS for pseudo-elements, Tailwind @apply might not work reliably here */
.range-thumb::-webkit-slider-thumb {
  width: 1.25rem; /* Equivalent to w-5 */
  height: 1.25rem; /* Equivalent to h-5 */
  background-color: #4f46e5; /* Equivalent to bg-indigo-600 */
  border-radius: 9999px; /* Equivalent to rounded-full */
  appearance: none;
  cursor: pointer;
}

.range-thumb::-moz-range-thumb {
  width: 1.25rem; /* Equivalent to w-5 */
  height: 1.25rem; /* Equivalent to h-5 */
  background-color: #4f46e5; /* Equivalent to bg-indigo-600 */
  border-radius: 9999px; /* Equivalent to rounded-full */
  cursor: pointer;
  border: none; /* Reset default border */
}
</style>

