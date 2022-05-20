declare module '@mrx-media/vite-vue-simple-ssr/server' {
  import type { Application } from 'express';
  import type { FastifyInstance } from 'fastify';

  export const expressMiddleware: (
    app: Application,
    options?: import('./types').ServerOptions,
  ) => Promise<void>;
  export const fastifyMiddleware: (
    app: FastifyInstance,
    options?: import('./types').ServerOptions,
  ) => Promise<void>;
  export const ssrMiddleware: (
    app: Application | FastifyInstance,
    options?: import('./types').ServerOptions,
  ) => Promise<void>;
}

declare module '@mrx-media/vite-vue-simple-ssr/utils' {
  const simpleLog: (msg: string, level?: 'info' | 'error' | 'warn') => void;
}

interface Window {
  __INITIAL_STATE__: string;
}
