import { createSSRApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import type { Handler } from './types';

const simpleSSR: Handler = async (App, { routes }, hook) => {
  const app = createSSRApp(App);
  const router = createRouter({
    history: createWebHistory(),
    routes,
  });
  app.use(router);

  await router.isReady();
  setTimeout(() => {
    app.mount('#app', true);
  }, 2000);
};

export default simpleSSR;
