import { simpleSSR } from '@mrx-media/vite-vue-simple-ssr';
import { createHead } from '@vueuse/head';
import App from './App.vue';

const routes = [
  {
    path: '/',
    component: () => import('./pages/Home.vue'),
  },
];

export default await simpleSSR(App, { routes, debug: true }, async (ctx) => {
  const { app } = ctx;
  const head = createHead();
  app.use(head);

  return { head };
});
