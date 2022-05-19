import fastify from 'fastify';
import { fastifyMiddleware } from '@mrx-media/vite-vue-simple-ssr/server';
import { simpleLog } from '@mrx-media/vite-vue-simple-ssr/utils';

export const startServer = async () => {
  const app = fastify({
    logger: false,
    disableRequestLogging: true,
  });

  await fastifyMiddleware(app);

  try {
    await app.listen(1337);
    simpleLog(`[fastify] server is listening on port 1337`);
  } catch (e: any) {
    console.error(e.message);
    process.exit(1);
  }
};

startServer();
