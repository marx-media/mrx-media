import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { defineHook } from '@directus/extensions-sdk';
import { expressMiddleware } from '@mrx-media/vite-vue-simple-ssr/server';

export default defineHook(({ init }) => {
  init('routes.custom.before', async ({ app }) => {
    const root = dirname(fileURLToPath(import.meta.url));
    await expressMiddleware(app, { root });
  });
});
