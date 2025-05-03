<template>
  <div class="template-manager">
    <!-- Template Selector (used in HomePage) -->
    <div v-if="mode === 'selector'" class="template-selector">
      <div class="template-dropdown">
        <select 
          v-model="selectedTemplateId" 
          @change="handleTemplateChange"
          :disabled="!hasTemplates"
          class="template-select"
        >
          <option value="">{{ hasTemplates ? 'Select a template' : 'No templates available' }}</option>
          <option 
            v-for="template in templates" 
            :key="template.id" 
            :value="template.id"
          >
            {{ template.name }}
          </option>
        </select>
        <div class="template-indicator" v-if="currentTemplateName">
          <span class="badge">{{ currentTemplateName }}</span>
        </div>
      </div>
    </div>

    <!-- Template Manager (used in SettingsPage) -->
    <div v-else-if="mode === 'manager'" class="template-manager-full">
      <div class="template-manager-header">
        <h3>Configuration Templates</h3>
        <p>Save your current configuration as a template to quickly reuse it later.</p>
      </div>
      
      <div class="save-template-form">
        <label for="templateName">Template Name:</label>
        <div class="template-name-input">
          <input 
            id="templateName" 
            v-model="newTemplateName" 
            type="text" 
            placeholder="e.g., My Expense Manager"
          />
          <button 
            @click="saveAsTemplate" 
            :disabled="!newTemplateName" 
            class="btn-save"
          >
            Save Current Configuration
          </button>
        </div>
      </div>
      
      <div class="saved-templates" v-if="hasTemplates">
        <h4>Saved Templates</h4>
        <div class="templates-list">
          <div 
            v-for="template in templates" 
            :key="template.id" 
            class="template-item"
            :class="{ 'active': isActiveTemplate(template.id) }"
          >
            <div class="template-info">
              <span class="template-name">{{ template.name }}</span>
              <span v-if="isActiveTemplate(template.id)" class="active-badge">Active</span>
            </div>
            <div class="template-actions">
              <button @click="loadTemplate(template.id)" class="btn-load">Load</button>
              <button @click="deleteTemplate(template.id)" class="btn-delete">Delete</button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="no-templates" v-else>
        <p>You don't have any saved templates yet.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useSettingsStore } from '@/store/modules/settingsStore';

const props = defineProps({
  // 'selector' for dropdown in HomePage, 'manager' for full management in SettingsPage
  mode: {
    type: String,
    default: 'selector',
    validator: (value) => ['selector', 'manager'].includes(value)
  }
});

const settingsStore = useSettingsStore();
const newTemplateName = ref('');
const selectedTemplateId = ref('');

// Computed properties
const templates = computed(() => settingsStore.templates);
const currentTemplateId = computed(() => settingsStore.currentTemplateId);
const currentTemplateName = computed(() => settingsStore.currentTemplateName);
const hasTemplates = computed(() => templates.value.length > 0);

// Set selected template to match current template
onMounted(async () => {
  await settingsStore.loadTemplates();
  if (currentTemplateId.value) {
    selectedTemplateId.value = currentTemplateId.value;
  }
});

// Methods
function isActiveTemplate(templateId) {
  return currentTemplateId.value === templateId.toString();
}

async function handleTemplateChange() {
  if (selectedTemplateId.value) {
    await settingsStore.loadTemplate(parseInt(selectedTemplateId.value));
  }
}

async function saveAsTemplate() {
  if (newTemplateName.value) {
    await settingsStore.saveAsTemplate(newTemplateName.value);
    newTemplateName.value = ''; // Clear input after saving
  }
}

async function loadTemplate(templateId) {
  await settingsStore.loadTemplate(templateId);
  selectedTemplateId.value = templateId.toString();
}

async function deleteTemplate(templateId) {
  if (confirm('Are you sure you want to delete this template?')) {
    await settingsStore.deleteTemplate(templateId);
  }
}
</script>

<style scoped>
.template-manager {
  margin-bottom: 1rem;
}

.template-selector {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.template-dropdown {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.template-select {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  min-width: 200px;
}

.template-indicator {
  display: flex;
  align-items: center;
}

.badge {
  background-color: #4caf50;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.template-manager-full {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.template-manager-header {
  margin-bottom: 1rem;
}

.template-manager-header h3 {
  margin-bottom: 0.5rem;
}

.save-template-form {
  margin-bottom: 1.5rem;
}

.template-name-input {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.template-name-input input {
  flex: 1;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.btn-save {
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
}

.btn-save:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.templates-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.template-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border: 1px solid #eee;
  border-radius: 4px;
}

.template-item.active {
  border-color: #4caf50;
  background-color: rgba(76, 175, 80, 0.1);
}

.template-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.active-badge {
  background-color: #4caf50;
  color: white;
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  font-size: 0.7rem;
}

.template-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-load {
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
}

.btn-delete {
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
}
</style>