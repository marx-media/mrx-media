import fs from 'fs';
import { resolve } from 'path';
import { type ViteDevServer, createServer } from 'vite';
import express, { type Application } from 'express';
import compression from 'compression';
import type { FastifyInstance } from 'fastify';
import fastifyMiddie from 'middie';
import fastifyStatic from '@fastify/static';
import fastifyCompression from '@fastify/compress';

// resolve at cwd
// const resolve = (p: string) => path.resolve(process.cwd(), p);

const getSsrManifest = (isProd: boolean): any => {
  return isProd
    ? fs.readFileSync(resolve('dist/client/ssr-manifest.json'), 'utf-8')
    : {};
};

const getIndexHtml = (): string => {
  return fs.readFileSync(resolve('dist/client/index.html'), 'utf-8');
};

const createViteDevServer = async (root: string): Promise<ViteDevServer> => {
  return await createServer({
    root,
    server: {
      middlewareMode: 'ssr',
    },
  });
};

const getTemplateAndRenderer = async (
  template = '',
  url: string,
  root: string,
  vite?: ViteDevServer,
) => {
  let render: any;
  if (vite) {
    template = fs.readFileSync(resolve(root, 'index.html'), 'utf-8');
    template = await vite.transformIndexHtml(url, template);
    render = (await vite.ssrLoadModule(resolve(root, 'src/main.ts'))).default;
  } else {
    render = (await import(resolve(root, 'dist/server/main'))).default;
  }
  return { template, render };
};

const buildServeHtml = (
  template: string,
  appHtml: string,
  preloadLinks = '',
) => {
  return template
    .replace(`<!--preload-links-->`, preloadLinks)
    .replace(`<!--app-html-->`, appHtml);
};

export const expressMiddleware = async (
  app: Application,
  viteRoot = process.cwd(),
) => {
  const isProd = process.env.NODE_ENV !== 'development';
  const root = viteRoot;

  let vite: ViteDevServer | undefined;
  if (!isProd) {
    vite = await createViteDevServer(root);
    app.use(vite.middlewares);
  } else {
    app.use(compression());
    app.use(
      express.static(resolve('dist/client'), {
        index: false,
      }),
    );
  }

  app.use('*', async (req, res) => {
    try {
      const url = req.originalUrl;
      const { template, render } = await getTemplateAndRenderer(
        getIndexHtml(),
        url,
        root,
        vite,
      );

      const { html, preloadLinks } = await render(url, getSsrManifest(isProd));

      res
        .status(200)
        .set({ 'Content-Type': 'text/html' })
        .end(buildServeHtml(template, html, preloadLinks));
    } catch (e: any) {
      vite && vite.ssrFixStacktrace(e);
      console.error(e.stack);
      res.status(500).end(e.stack);
    }
  });
};

export const fastifyMiddleware = async (
  app: FastifyInstance,
  viteRoot = process.cwd(),
) => {
  const isProd = process.env.NODE_ENV !== 'development';
  const root = viteRoot;

  await app.register(fastifyMiddie);

  const {
    default: { ssr: ssrAssets },
  } = await import(resolve('dist/server/package.json'));

  let vite: ViteDevServer;
  if (!isProd) {
    vite = await createViteDevServer(root);
    app.use(vite.middlewares);
  } else {
    await app.register(fastifyCompression);
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
      const { template, render } = await getTemplateAndRenderer(
        getIndexHtml(),
        url,
        root,
        vite,
      );
      const { html, preloadLinks } = await render(url, getSsrManifest(isProd));

      res.writeHead(200, { 'Content-Type': 'text/html' });
      return res.end(buildServeHtml(template, html, preloadLinks));
    } catch (e: any) {
      vite && vite.ssrFixStacktrace(e);
      res.statusCode = 500;
      return res.end(e.stack);
    }
  });
};
