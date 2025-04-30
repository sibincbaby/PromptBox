<template>
  <div class="p-4">
    <h2 class="text-2xl font-semibold mb-4">Chat History</h2>
    <div v-if="isLoading" class="text-gray-500">Loading history...</div>
    <div v-else-if="error" class="text-red-500 bg-red-100 p-3 rounded-lg">Error loading history: {{ error }}</div>
    <div v-else-if="chatHistory.length === 0" class="text-gray-500">No chat history found.</div>
    <ul v-else class="space-y-3">
      <li v-for="chat in chatHistory" :key="chat.id" class="bg-white p-3 rounded-lg shadow hover:shadow-md transition-shadow flex justify-between items-center">
        <div>
          <span class="font-medium">Chat from:</span> {{ formatTimestamp(chat.timestamp) }}
          <p class="text-sm text-gray-600 truncate max-w-md">{{ getChatPreview(chat.messages) }}</p>
        </div>
        <div class="space-x-2 flex-shrink-0">
          <button @click="loadChat(chat.id)" class="text-blue-500 hover:text-blue-700 text-sm">View</button>
          <button @click="deleteChat(chat.id)" class="text-red-500 hover:text-red-700 text-sm">Delete</button>
        </div>
      </li>
    </ul>
    <!-- TODO: Add pagination if history becomes very long -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { db } from '../db'; // Import Dexie db instance
import { useObservable } from '@vueuse/rxjs'; // Using vueuse for live updates
import { liveQuery } from 'dexie';

const router = useRouter();
const isLoading = ref(true);
const error = ref(null);

// Use liveQuery to automatically update the list when DB changes
const chatHistory = useObservable(
  liveQuery(async () => {
    isLoading.value = true;
    error.value = null;
    try {
      // Fetch chats sorted by timestamp descending
      const chats = await db.chats.orderBy('timestamp').reverse().toArray();
      return chats;
    } catch (err) {
      console.error("Failed to fetch chat history:", err);
      error.value = err.message || 'Could not load history.';
      return []; // Return empty array on error
    } finally {
      isLoading.value = false;
    }
  })
);

const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Unknown date';
  return new Date(timestamp).toLocaleString();
};

const getChatPreview = (messages) => {
  if (!messages || messages.length === 0) return 'Empty chat';
  // Find the first user message as a preview
  const firstUserMessage = messages.find(m => m.sender === 'user');
  return firstUserMessage ? firstUserMessage.text : (messages[0]?.text || '...');
};

const loadChat = (chatId) => {
  router.push({ path: '/', query: { chatId } });
};

const deleteChat = async (chatId) => {
  if (confirm('Are you sure you want to delete this chat session?')) {
    try {
      await db.chats.delete(chatId);
      console.log(`Chat session ${chatId} deleted.`);
      // The list will update automatically thanks to liveQuery
    } catch (err) {
      console.error(`Failed to delete chat ${chatId}:`, err);
      alert('Failed to delete chat session.'); // Inform user
    }
  }
};

</script>

<style scoped>
/* Add any specific styles for HistoryPage if needed */
</style>

