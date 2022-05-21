import fastify from 'fastify';
import { ssrMiddleware } from '@mrx-media/vite-vue-simple-ssr/server';
import { simpleLog } from '@mrx-media/vite-vue-simple-ssr/utils';

export const startServer = async () => {
  const app = fastify({
    logger: false,
    disableRequestLogging: true,
  });

  const isProd = process.env.NODE_ENV !== 'development';
  await ssrMiddleware(app, { root: isProd ? 'dist' : process.cwd() });

  try {
    await app.listen(1337);
    simpleLog(`[fastify] server is listening on port 1337`);
  } catch (e: any) {
    console.error(e.message);
    process.exit(1);
  }
};

startServer();
