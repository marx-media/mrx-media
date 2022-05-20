import { resolve } from 'path';
import type { IncomingMessage, ServerResponse } from 'http';
import { type ViteDevServer } from 'vite';
import express, { type Application } from 'express';
import compression from 'compression';
import type { FastifyInstance } from 'fastify';
import fastifyMiddie from 'middie';
import fastifyStatic from '@fastify/static';
import fastifyCompression from '@fastify/compress';
import type { Request, Response } from 'express';
import type { ServerOptions } from '../types';
import { simpleLog } from '../utils';
import {
  buildServeHtml,
  createViteDevServer,
  getIndexHtml,
  getSsrManifest,
  getTemplateAndRenderer,
} from './utils';
interface RequestHandler {
  isProd: boolean;
  root: string;
  url: string;
  request: Request | IncomingMessage;
  response: Response | ServerResponse;
  vite?: ViteDevServer;
}

export const handleRequest = async ({
  isProd,
  root,
  url,
  request,
  response,
  vite,
}: RequestHandler): Promise<string> => {
  const { template, render } = await getTemplateAndRenderer(
    getIndexHtml(root),
    url,
    root,
    vite,
  );

  const result = await render(url, getSsrManifest(isProd, root), {
    isClient: false,
    request,
    response,
  });

  return buildServeHtml(template, result);
};

export const expressMiddleware = async (
  app: Application,
  { root = process.cwd(), useCompression = true }: ServerOptions = {},
) => {
  const isProd = process.env.NODE_ENV !== 'development';

  let vite: ViteDevServer | undefined;
  if (!isProd) {
    vite = await createViteDevServer(root);
    app.use(vite.middlewares);
  } else {
    if (useCompression) {
      app.use(compression());
    }
    app.use(
      express.static(resolve('dist/client'), {
        index: false,
      }),
    );
  }

  app.use('*', async (req, res) => {
    try {
      const url = req.originalUrl;

      const html = await handleRequest({
        isProd,
        root,
        url,
        request: req,
        response: res,
        vite,
      });

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e: any) {
      vite && vite.ssrFixStacktrace(e);
      console.error(e.stack);
      res.status(500).end(e.stack);
    }
  });
};

export const fastifyMiddleware = async (
  app: FastifyInstance,
  { root = process.cwd(), useCompression = true }: ServerOptions = {},
) => {
  const isProd = process.env.NODE_ENV !== 'development';

  await app.register(fastifyMiddie);

  const {
    default: { ssr: ssrAssets },
  } = await import(resolve(root, 'dist/server/package.json'));

  let vite: ViteDevServer;
  if (!isProd) {
    vite = await createViteDevServer(root);
    app.use(vite.middlewares);
  } else {
    if (useCompression) {
      await app.register(fastifyCompression);
    }
    await app.register(fastifyStatic, {
      root: resolve(root, 'dist/client'),
    });
    await app.register(fastifyStatic, {
      root: resolve(root, 'dist/client/assets'),
      prefix: '/assets/',
      decorateReply: false,
    });
  }

  app.use(async (req, res, next) => {
    try {
      const url = req.originalUrl!;

      // - check if incoming request is an asset request
      const isAssetRequest = ssrAssets.some((asset: string) =>
        url.substring(1, url.length).startsWith(asset),
      );

      // - if asset request or not an get => next!
      if (isAssetRequest || req.method !== 'GET') return next();

      // - otherwise -> render vue
      const html = await handleRequest({
        isProd,
        root,
        url,
        request: req,
        response: res,
        vite,
      });

      res.writeHead(200, { 'Content-Type': 'text/html' });
      return res.end(html);
    } catch (e: any) {
      vite && vite.ssrFixStacktrace(e);
      res.statusCode = 500;
      return res.end(e.stack);
    }
  });
};

interface HookHandler {
  isFastify: boolean;
  isProd: boolean;
  root: string;
  hook?: (url: string, req: any, res: any, next: any) => Promise<void>;
  vite?: ViteDevServer;
}
// TODO: polymorph
export const ssrMiddleware = async (
  app: Application | FastifyInstance,
  options: ServerOptions = {},
) => {
  const {
    isProd = process.env.NODE_ENV !== 'development',
    root = process.cwd(),
    useCompression = true,
  } = options;

  const isFastify = 'version' in app;
  if (isFastify) await app.register(fastifyMiddie);
  let assets: string[] = [];
  try {
    const {
      default: { ssr: ssrAssets },
    } = await import(resolve(root, 'dist/server/package.json'));
    assets = ssrAssets as string[];
  } catch (e: any) {
    simpleLog(e.message, 'warn');
  }

  let vite: ViteDevServer | undefined;
  if (!isProd) {
    vite = await createViteDevServer(root);
    app.use(vite.middlewares);
  } else {
    if (isFastify) {
      if (useCompression) await app.register(fastifyCompression);

      await app.register(fastifyStatic, {
        root: resolve(root, 'dist/client'),
      });
      await app.register(fastifyStatic, {
        root: resolve(root, 'dist/client/assets'),
        prefix: '/assets/',
        decorateReply: false,
      });
    } else {
      if (useCompression) app.use(compression());

      for (const asset of assets || []) {
        app.use(
          `/${asset}`,
          express.static(resolve(root, 'dist/client', asset), {}),
        );
      }
    }
  }

  const hookHandler =
    ({ isFastify, isProd, root, vite, hook }: HookHandler) =>
    async (req: any, res: any, next: any) => {
      const url = req.originalUrl;
      if (hook) await hook(url, req, res, next);
      // - otherwise -> render vue
      const html = await handleRequest({
        isProd,
        root,
        url,
        request: req,
        response: res,
        vite,
      });
      if (isFastify) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
      } else {
        res.status(200).set({ 'Content-Type': 'text/html' });
      }
      return res.end(html);
    };

  if (isFastify) {
    app.use(
      hookHandler({
        isFastify,
        isProd,
        root,
        vite,
        hook: async (url, req, _, next) => {
          // - check if incoming request is an asset request
          const isAssetRequest = ssrAssets.some((asset: string) =>
            url.substring(1, url.length).startsWith(asset),
          );

          // - if asset request or not an get => next!
          if (isAssetRequest || req.method !== 'GET') return next();
        },
      }),
    );
  } else {
    app.use('*', hookHandler({ isFastify, isProd, root, vite }));
  }
};
