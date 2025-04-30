<template>
  <div class="home-page flex flex-col h-full">
    <!-- Chat Area -->
    <div ref="chatAreaRef" class="chat-area flex-grow overflow-y-auto p-4 space-y-4 bg-gray-100">
      <!-- Messages will be displayed here -->
      <div v-for="(message, index) in chatMessages" :key="index" 
           :class="[
             'p-3 rounded-lg max-w-xl break-words',
             message.sender === 'user' ? 'bg-blue-500 text-white self-end ml-auto' : 'bg-white text-gray-800 self-start mr-auto'
           ]">
        <pre class="whitespace-pre-wrap font-sans">{{ message.text }}</pre>
        <!-- Add copy button for model responses -->
         <button v-if="message.sender === 'model'" @click="copyToClipboard(message.text)" title="Copy Response" class="ml-2 text-xs text-gray-400 hover:text-gray-600">
           Copy
         </button>
      </div>
      <!-- Loading Indicator -->
      <div v-if="isLoading" class="text-center text-gray-500">
        Loading...
      </div>
      <!-- Error Display -->
      <div v-if="error" class="text-red-500 bg-red-100 p-3 rounded-lg">
        Error: {{ error }}
      </div>
    </div>

    <!-- Input Area -->
    <div class="input-area p-4 border-t border-gray-300 bg-white flex items-center space-x-2">
      <button @click="startNewChat" title="New Chat" class="p-2 rounded hover:bg-gray-200">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
      <textarea ref="textareaRef" v-model="promptInput" 
                @input="autoResizeTextarea" 
                @keydown.enter.prevent="handleEnterKey" 
                placeholder="Enter your prompt here..." 
                class="flex-grow p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" 
                rows="1"></textarea>
      <button @click="clearInput" title="Clear Input" class="p-2 rounded hover:bg-gray-200" :disabled="!promptInput">
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <button @click="sendPrompt" title="Send Prompt" class="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50" :disabled="isLoading || !promptInput">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { callGeminiApi } from '../services/geminiService'; // Import the API service
import { db } from '../db'; // Import Dexie db instance

const route = useRoute();
const router = useRouter();

const promptInput = ref('');
const chatMessages = ref([]); // { sender: 'user' | 'model', text: '...' }
const isLoading = ref(false);
const error = ref(null);
const textareaRef = ref(null); // Ref for the textarea element
const chatAreaRef = ref(null); // Ref for the chat area div
const currentChatId = ref(null); // To track the current chat session ID in the DB

// Function to scroll chat area to bottom
const scrollToBottom = () => {
  nextTick(() => {
    const chatArea = chatAreaRef.value;
    if (chatArea) {
      chatArea.scrollTop = chatArea.scrollHeight;
    }
  });
};

// Auto-resize textarea based on content
const autoResizeTextarea = () => {
  const textarea = textareaRef.value;
  if (textarea) {
    textarea.style.height = 'auto'; // Reset height
    textarea.style.height = `${textarea.scrollHeight}px`; // Set to scroll height
  }
};

// Load chat if ID is provided in route query params
const loadChat = async (chatId) => {
  if (!chatId) {
    startNewChat(); // Ensure it's a new chat if no ID
    return;
  }
  try {
    const id = parseInt(chatId);
    const chat = await db.chats.get(id);
    if (chat) {
      chatMessages.value = chat.messages;
      currentChatId.value = chat.id;
      // TODO: Optionally load settings used for this chat if stored
      scrollToBottom();
    } else {
      console.warn(`Chat with ID ${chatId} not found. Starting new chat.`);
      router.replace({ query: {} }); // Remove invalid ID from URL
      startNewChat();
    }
  } catch (err) {
    console.error('Failed to load chat:', err);
    error.value = 'Failed to load chat history.';
    startNewChat();
  }
};

// Watch for changes in route query parameter 'chatId'
onMounted(() => {
  autoResizeTextarea();
  loadChat(route.query.chatId);
});

watch(() => route.query.chatId, (newChatId) => {
  // Only reload if the ID actually changes or if navigating back to Home without an ID
  if (newChatId !== currentChatId.value?.toString()) {
     loadChat(newChatId);
  }
});

const handleEnterKey = (event) => {
  if (event.shiftKey) {
    return;
  }
  sendPrompt();
};

// Function to save the current chat session to Dexie
const saveChatSession = async () => {
  if (chatMessages.value.length === 0) return; // Don't save empty chats

  const chatData = {
    messages: JSON.parse(JSON.stringify(chatMessages.value)), // Deep copy
    timestamp: new Date(),
    // TODO: Store settings used for this chat session
  };

  try {
    if (currentChatId.value) {
      // Update existing chat
      await db.chats.update(currentChatId.value, chatData);
    } else {
      // Add new chat and get the new ID
      const newId = await db.chats.add(chatData);
      currentChatId.value = newId;
      // Update URL without reloading page/triggering watcher unnecessarily
      router.replace({ query: { chatId: newId } });
    }
    console.log('Chat session saved/updated with ID:', currentChatId.value);
  } catch (err) {
    console.error('Failed to save chat session:', err);
    // Don't show this error to the user directly, maybe log it
  }
};

const sendPrompt = async () => {
  if (!promptInput.value.trim() || isLoading.value) return;

  const currentPrompt = promptInput.value.trim();
  chatMessages.value.push({ sender: 'user', text: currentPrompt });
  promptInput.value = '';
  autoResizeTextarea();
  scrollToBottom();
  isLoading.value = true;
  error.value = null;

  // Save immediately after user sends message (optional, could save only after response)
  // await saveChatSession(); 

  try {
    const responseText = await callGeminiApi(currentPrompt);
    chatMessages.value.push({ sender: 'model', text: responseText });
    // Save chat session after successful response
    await saveChatSession();
  } catch (err) {
    console.error('API Error:', err);
    error.value = err.message || 'Failed to get response from API.';
  } finally {
    isLoading.value = false;
    scrollToBottom();
  }
};

const clearInput = () => {
  promptInput.value = '';
  autoResizeTextarea();
};

const startNewChat = () => {
  chatMessages.value = [];
  promptInput.value = '';
  error.value = null;
  isLoading.value = false;
  currentChatId.value = null; // Reset current chat ID
  autoResizeTextarea();
  // Remove chatId from URL query params
  if (route.query.chatId) {
    router.replace({ query: {} });
  }
  console.log('Started new chat session.');
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    console.log('Response copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }
};

</script>

<style scoped>
/* Scoped styles for HomePage */
.home-page {
  /* Max height might be needed depending on parent container */
}
.chat-area {
  scrollbar-width: thin; /* Firefox */
}
.chat-area::-webkit-scrollbar {
  width: 8px; /* Chrome, Safari, Edge */
}
.chat-area::-webkit-scrollbar-thumb {
  background-color: #cbd5e1; /* gray-300 */
  border-radius: 4px;
}
textarea {
  min-height: 40px;
  max-height: 200px;
  overflow-y: auto;
}
</style>

