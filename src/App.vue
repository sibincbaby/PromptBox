<template>
  <div id="app" class="flex flex-col h-screen">
    <!-- Header -->
    <header class="bg-gray-800 text-white shadow-md">
      <div class="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 class="text-xl font-bold">Gemini Prompt Tester</h1>
        <!-- Navigation Tabs -->
        <nav class="space-x-4">
          <router-link to="/" class="px-3 py-2 rounded hover:bg-gray-700" active-class="bg-gray-900">Home</router-link>
          <router-link to="/history" class="px-3 py-2 rounded hover:bg-gray-700" active-class="bg-gray-900">History</router-link>
          <router-link to="/settings" class="px-3 py-2 rounded hover:bg-gray-700" active-class="bg-gray-900">Settings</router-link>
        </nav>
      </div>
    </header>

    <!-- Main Content Area - Router View -->
    <main class="flex-grow overflow-auto bg-gray-50">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </main>

    <!-- Footer Placeholder -->
    <footer class="bg-gray-200 p-2 text-center text-sm text-gray-600">
      Powered by Manus
    </footer>
  </div>
</template>

<script setup>
// No script needed for basic layout and router-view
</script>

<style>
/* Ensure html and body take full height */
html, body {
  height: 100%;
  margin: 0;
  background-color: #f9fafb; /* bg-gray-50 */
}
#app {
  /* Additional styling if needed */
}

/* Styling for active router link */
.router-link-exact-active {
  /* Tailwind's active-class handles this, but you can add more specific styles here if needed */
}
</style>

