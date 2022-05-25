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
import type { HookHandler, ServerOptions } from '../types';
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
    isProd ? getIndexHtml(root) : '',
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

  let vite: ViteDevServer | undefined;
  if (!isProd) {
    vite = await createViteDevServer(root);
    app.use(vite.middlewares);
  } else {
    try {
      const { default: ssrAssets } = await import(
        resolve(root, 'server/ssr.config.mjs')
      );
      assets = ssrAssets as string[];
    } catch (e: any) {
      simpleLog(e.message, 'warn');
    }

    if (isFastify) {
      if (useCompression) await app.register(fastifyCompression);

      await app.register(fastifyStatic, {
        root: resolve(root, 'client'),
        index: false,
      });

      // TODO
      // for (const asset of assets || []) {
      //   const _assetPath = resolve(root, 'client', asset);
      //   const lstat = lstatSync(_assetPath);
      //   if (lstat.isDirectory()) {
      //     await app.register(fastifyStatic, {
      //       root: _assetPath,
      //       prefix: asset,
      //       index: false,
      //       decorateReply: false,
      //     });
      //   }
      // }
    } else {
      if (useCompression) app.use(compression());

      for (const asset of assets || []) {
        app.use(`/${asset}`, express.static(resolve(root, 'client', asset)));
      }
    }
  }

  const hookHandler =
    ({ isFastify, isProd, root, vite, hook }: HookHandler) =>
    async (req: any, res: any, next: any) => {
      const url = req.originalUrl;
      let isNext = false;
      if (hook) {
        isNext = await hook(url, req);
      }
      if (isNext) return next();
      else {
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
      }
    };

  if (isFastify) {
    app.use(
      hookHandler({
        isFastify,
        isProd,
        root,
        vite,
        hook: async (url, req) => {
          // - check if incoming request is an asset request
          const isAssetRequest = assets.some((asset: string) =>
            url.substring(1, url.length).startsWith(asset),
          );
          return isAssetRequest || req.method !== 'GET';
        },
      }),
    );
  } else {
    app.use('*', hookHandler({ isFastify, isProd, root, vite }));
  }
};
