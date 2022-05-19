declare module '@mrx-media/vite-vue-simple-ssr/server' {
  import type { Application } from 'express';
  import type { FastifyInstance } from 'fastify';
  const expressMiddleware: (app: Application) => Promise<void>;
  const expressFastify: (app: FastifyInstance) => Promise<void>;
}
