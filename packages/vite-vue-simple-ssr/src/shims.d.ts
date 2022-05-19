declare module '@mrx-media/vite-vue-simple-ssr/server' {
  import type { Application } from 'express';
  import type { FastifyInstance } from 'fastify';
  import type { ServerOptions } from './vue/types';

  const expressMiddleware: (
    app: Application,
    options?: ServerOptions,
  ) => Promise<void>;
  const fastifyMiddleware: (
    app: FastifyInstance,
    options?: ServerOptions,
  ) => Promise<void>;
}

declare module '@mrx-media/vite-vue-simple-ssr/utils' {
  const simpleLog: (msg: string, level?: 'info' | 'error' | 'warn') => void;
}

interface Window {
  __INITIAL_STATE__: string;
}
