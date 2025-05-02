import { createApp } from 'vue';
import App from './App.vue';

import { createRouter, createWebHistory } from 'vue-router';

import RegisterPage from './components/RegisterPage.vue';
import LoginPage from './components/LoginPage.vue';
import HomeCapo from './components/HomeCapo.vue';
import HomeDipendente from './components/HomeDipendente.vue';

//per sito stiloso
import vuetify from 'vuetify';
import 'vuetify/styles'; // Importa gli stili di Vuetify


const routes = [
  { path: '/', component: LoginPage },
  {path:'/register', component: RegisterPage},
  {path:'/login', component: LoginPage},

  //indirizzamento capo
  {
    path: '/home-capo',
    component: HomeCapo,
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem('auth_token');
      const userType = localStorage.getItem('user_type'); 
  
      // Controlla se il token esiste e se il tipo utente è corretto
      if (token && userType === 'capo') {
        next();
      } else {
        next('/');  // Rimanda alla pagina di login se non è un "capo" o non è autenticato
      }
    }
  },
  {
    path: '/home-dipendente',
    component: HomeDipendente,
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem('auth_token');
      const userType = localStorage.getItem('user_type');

      
      // Controlla se il token esiste e se il tipo utente è corretto
      if (token && userType === 'dipendente') {
        next();
      } else {
        next('/');  // Rimanda alla pagina di login se non è un "dipendente" o non è autenticato
      }
    }
  }
  
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

createApp(App).use(vuetify).use(router).mount('#app');
