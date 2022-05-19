import fs from 'fs';
import { resolve } from 'path';
import { type ViteDevServer, createServer } from 'vite';
import express, { type Application } from 'express';
import compression from 'compression';
import type { FastifyInstance } from 'fastify';
import fastifyMiddie from 'middie';
import fastifyStatic from '@fastify/static';
import fastifyCompression from '@fastify/compress';
import devalue from '@nuxt/devalue';
import type { RendererResult, ServerOptions } from '../types';

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
  { html, preloadLinks, headTags, bodyAttrs, htmlAttrs }: RendererResult,
  initialState: any,
) => {
  initialState = devalue(initialState);
  return template
    .replace('<html', `<html ${htmlAttrs}`)
    .replace('<body', `<body ${bodyAttrs}`)
    .replace(`</head>`, `${[preloadLinks, headTags].join('\n')}\n</head>`)
    .replace(`<!--app-html-->`, html)
    .replace(
      '</body>',
      `<script>window.__INITIAL_STATE__=${initialState}</script>\n</body>`,
    );
};

export const expressMiddleware = async (
  app: Application,
  {
    root = process.cwd(),
    initialState = {},
    useCompression = true,
  }: ServerOptions = {},
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
      const { template, render } = await getTemplateAndRenderer(
        getIndexHtml(),
        url,
        root,
        vite,
      );

      const result = await render(url, getSsrManifest(isProd), {
        initialState,
        isClient: false,
        request: req,
        response: res,
      });

      res
        .status(200)
        .set({ 'Content-Type': 'text/html' })
        .end(buildServeHtml(template, result, initialState));
    } catch (e: any) {
      vite && vite.ssrFixStacktrace(e);
      console.error(e.stack);
      res.status(500).end(e.stack);
    }
  });
};

export const fastifyMiddleware = async (
  app: FastifyInstance,
  {
    root = process.cwd(),
    initialState = {},
    useCompression = true,
  }: ServerOptions = {},
) => {
  const isProd = process.env.NODE_ENV !== 'development';

  await app.register(fastifyMiddie);

  const {
    default: { ssr: ssrAssets },
  } = await import(resolve('dist/server/package.json'));

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
      const { template, render } = await getTemplateAndRenderer(
        getIndexHtml(),
        url,
        root,
        vite,
      );
      const result = await render(url, getSsrManifest(isProd), {
        initialState,
        isClient: false,
        request: req,
        response: res,
      });

      res.writeHead(200, { 'Content-Type': 'text/html' });
      return res.end(buildServeHtml(template, result, initialState));
    } catch (e: any) {
      vite && vite.ssrFixStacktrace(e);
      res.statusCode = 500;
      return res.end(e.stack);
    }
  });
};
