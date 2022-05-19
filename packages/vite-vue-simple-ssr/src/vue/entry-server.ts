import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { createMemoryHistory, createRouter } from 'vue-router';
import type { Handler } from './types';

const simpleSSR: Handler = async (App, { routes }, hook) => {
  return async (url: string, manifest: any) => {
    const app = createSSRApp(App);
    const router = createRouter({
      history: createMemoryHistory(),
      routes,
    });
    app.use(router);

    // set the router to the desired URL before rendering
    router.push(url);
    await router.isReady();

    const ctx = {};
    const html = await renderToString(app, ctx);
    return { html };
  };
};

export default simpleSSR;
