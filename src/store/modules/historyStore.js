import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '../../db/db'

export const useHistoryStore = defineStore('history', () => {
  // State
  const history = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  
  // Actions
  async function fetchHistory() {
    isLoading.value = true
    error.value = null
    
    try {
      // Fetch history items from database
      const items = await db.history.toArray()
      history.value = items
    } catch (err) {
      error.value = err.message || 'Failed to fetch history'
      console.error('Error fetching history:', err)
    } finally {
      isLoading.value = false
    }
  }
  
  async function addToHistory(item) {
    try {
      // Add timestamp if not provided
      const historyItem = { 
        ...item, 
        timestamp: item.timestamp || new Date().toISOString() 
      }
      
      // Save to database
      const id = await db.history.add(historyItem)
      
      // Update local state - add to beginning of array
      history.value = [{ id, ...historyItem }, ...history.value]
      
      return id
    } catch (err) {
      error.value = err.message || 'Failed to add to history'
      console.error('Error adding to history:', err)
      return null
    }
  }
  
  async function removeFromHistory(id) {
    try {
      // Delete from database
      await db.history.delete(id)
      
      // Update local state
      history.value = history.value.filter(item => item.id !== id)
    } catch (err) {
      error.value = err.message || 'Failed to remove from history'
      console.error('Error removing from history:', err)
    }
  }
  
  async function clearHistory() {
    try {
      // Clear database
      await db.history.clear()
      
      // Clear local state
      history.value = []
    } catch (err) {
      error.value = err.message || 'Failed to clear history'
      console.error('Error clearing history:', err)
    }
  }
  
  // Improved method that accepts the limit as a parameter rather than importing another store
  async function enforceHistoryLimit(limit = 50) {
    if (history.value.length <= limit) return
    
    try {
      // Get ids of items to remove (oldest first)
      const itemsToRemove = getItemsToRemove(history.value, limit)
      
      // Remove items from database
      await removeOldItems(itemsToRemove)
      
      // Update state
      history.value = history.value.filter(
        item => !itemsToRemove.some(i => i.id === item.id)
      )
    } catch (err) {
      console.error('Error enforcing history limit:', err)
    }
  }
  
  // Helper function to determine which items to remove
  function getItemsToRemove(items, limit) {
    return items
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(0, items.length - limit)
  }
  
  // Helper function to delete items from database
  async function removeOldItems(itemsToRemove) {
    for (const item of itemsToRemove) {
      await db.history.delete(item.id)
    }
  }
  
  // Getters
  const historyItems = computed(() => history.value)
  const hasHistory = computed(() => history.value.length > 0)
  const sortedHistory = computed(() => 
    [...history.value].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    )
  )
  
  return {
    // State
    history,
    isLoading,
    error,
    
    // Actions
    fetchHistory,
    addToHistory,
    removeFromHistory,
    clearHistory,
    enforceHistoryLimit,
    
    // Getters
    historyItems,
    hasHistory,
    sortedHistory
  }
}, {
  // Persistence configuration
  persist: {
    key: 'promptbox-history-state',
    storage: localStorage
  }
})