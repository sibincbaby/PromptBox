import { createRouter, createWebHashHistory } from 'vue-router';
import HomePage from '../components/HomePage.vue'; // Use the component directly for the main chat
import HistoryPage from '../views/HistoryPage.vue';
import SettingsPage from '../views/SettingsPage.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
  },
  {
    path: '/history',
    name: 'History',
    component: HistoryPage,
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsPage,
  },
  // Add redirect or 404 page if needed
  // { path: '/:pathMatch(.*)*', redirect: '/' }
];

const router = createRouter({
  history: createWebHashHistory(), // Using hash history for simplicity, avoids server config
  routes,
});

export default router;

