import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { createMemoryHistory, createRouter } from 'vue-router';
import { renderHeadToString } from '@vueuse/head';
import { findDependencies, renderPreloadLinks } from '../utils';
import type { Handler } from '../types';

const simpleSSR: Handler = async (App, { routes, initialState = {} }, hook) => {
  return async (url: string, manifest: any, context: any) => {
    const app = createSSRApp(App);
    const router = createRouter({
      history: createMemoryHistory(),
      routes,
    });

    const { head } = await hook({
      app,
      router,
      initialState,
      ...context,
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
    const {
      headTags = '',
      htmlAttrs = '',
      bodyAttrs = '',
    } = renderHeadToString(head);

    return { html, preloadLinks, headTags, htmlAttrs, bodyAttrs, initialState };
  };
};

export default simpleSSR;
