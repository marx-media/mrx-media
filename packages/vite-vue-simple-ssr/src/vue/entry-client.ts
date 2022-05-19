/* eslint-disable no-console */
import { createSSRApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { simpleLog } from '../utils';
import type { Handler } from '../types';

const simpleSSR: Handler = async (App, { routes, debug = false }, hook) => {
  const app = createSSRApp(App);
  const router = createRouter({
    history: createWebHistory(),
    routes,
  });

  const initialState = window.__INITIAL_STATE__;

  await hook({ app, router, initialState, isClient: true });

  app.use(router);

  let isInitialRoute = true;
  router.beforeEach(() => {
    if (isInitialRoute) {
      isInitialRoute = false;
      // TODO: handle initial state
    }
  });

  await router.isReady();
  if (!debug) app.mount('#app', true);
  else {
    // DEBUGGING MODE -> RENDERS CLIENT VERSION 3 SECONDS AFTER THE SSR VERSION
    let seconds = 3;
    simpleLog(`Debug mode is on`, 'warn');
    simpleLog(`Hydrating app in ${seconds}`);
    const interval = setInterval(() => {
      seconds--;
      if (seconds > 0) simpleLog(`Hydrating app in ${seconds}`);
    }, 1000);

    setTimeout(() => {
      clearInterval(interval);
      app.mount('#app', true);
      simpleLog(`App hydrated!`);
    }, 3000);
  }
};

export default simpleSSR;
