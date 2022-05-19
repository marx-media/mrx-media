import fastify from 'fastify';
import { fastifyMiddleware } from '@mrx-media/vite-vue-simple-ssr/server';

export const startServer = async () => {
  const app = fastify({
    logger: {
      level: 'info',
      prettyPrint: process.env.NODE_ENV !== 'production',
    },
    disableRequestLogging: true,
  });

  await fastifyMiddleware(app);

  try {
    await app.listen(1337);
  } catch (e: any) {
    console.error(e.message);
    process.exit(1);
  }
};

startServer();
