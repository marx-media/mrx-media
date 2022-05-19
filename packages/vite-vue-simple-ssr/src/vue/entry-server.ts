import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { createMemoryHistory, createRouter } from 'vue-router';
import type { Handler } from './types';
import { findDependencies, renderPreloadLinks } from './utils';

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

    const ctx: any = {};
    const html = await renderToString(app, ctx);
    let preloadLinks = '';
    if (manifest) {
      const dependencies = findDependencies(ctx.modules, manifest);
      preloadLinks = renderPreloadLinks(dependencies);
    }

    return { html, preloadLinks };
  };
};

export default simpleSSR;
