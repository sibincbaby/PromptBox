import { createRouter, createWebHashHistory } from 'vue-router';

// Implement lazy loading for components
const HomePage = () => import('../components/HomePage.vue');
const HistoryPage = () => import('../views/HistoryPage.vue');
const SettingsPage = () => import('../views/SettingsPage.vue');

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

