import { simpleSSR } from '@mrx-media/vite-vue-simple-ssr';
import App from './App.vue';

const routes = [
  {
    path: '/',
    component: () => import('./pages/Home.vue'),
  },
];

export default await simpleSSR(App, { routes }, async (ctx) => {});
