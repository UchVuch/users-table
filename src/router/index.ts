import { createMemoryHistory, createRouter } from 'vue-router';

import Signin from '@/pages/auth/Signin.vue';
import Signup from '@/pages/auth/Signup.vue';
import UsersList from '@/pages/users/UsersList.vue';

const routes = [
  { path: '/', name: 'home', component: UsersList },
  { path: '/login', name: 'login', component: Signin },
  { path: '/register', name: 'register', component: Signup }
];

export const router = createRouter({
  history: createMemoryHistory(),
  routes
});
