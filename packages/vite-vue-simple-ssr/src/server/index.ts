import fs from 'fs';
import path from 'path';
import { type ViteDevServer, createServer } from 'vite';
import type { Application } from 'express';
import type { FastifyInstance } from 'fastify';
import fastifyMiddie from 'middie';

const resolve = (p: string) => path.resolve(process.cwd(), p);
const getManifest = (isProd: boolean): any => (isProd ? {} : {});
const getIndexHtml = (isProd: boolean): string => (isProd ? '' : '');
const createViteDevServer = async (root: string): Promise<ViteDevServer> => {
  return await createServer({
    root,
    server: {
      middlewareMode: 'ssr',
    },
  });
};

const getTemplateAndRenderer = async (url: string, vite?: ViteDevServer) => {
  let template: string;
  let render: any;
  if (vite) {
    template = fs.readFileSync(resolve('index.html'), 'utf-8');
    template = await vite.transformIndexHtml(url, template);
    render = (await vite.ssrLoadModule(resolve('src/main.ts'))).default;
  } else {
    template = '';
  }
  return { template, render };
};

export const expressMiddleware = async (app: Application) => {
  const isProd = process.env.NODE_ENV !== 'development';
  const root = process.cwd();

  const manifest = getManifest(isProd);
  const indexHtml = getIndexHtml(isProd);

  let vite: ViteDevServer | undefined;
  if (!isProd) {
    vite = await createViteDevServer(root);
    app.use(vite.middlewares);
  }

  app.use('*', async (req, res) => {
    try {
      const url = req.originalUrl;

      const { template, render } = await getTemplateAndRenderer(url, vite);
      const { html: appHtml } = await render(url, manifest);

      const html = template.replace(`<!--app-html-->`, appHtml);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e: any) {
      vite && vite.ssrFixStacktrace(e);
      console.error(e.stack);
      res.status(500).end(e.stack);
    }
  });
};

export const fastifyMiddleware = async (app: FastifyInstance) => {
  const isProd = process.env.NODE_ENV !== 'development';
  const root = process.cwd();

  await app.register(fastifyMiddie);

  const manifest = getManifest(isProd);
  const indexHtml = getIndexHtml(isProd);
  let vite: ViteDevServer;
  if (!isProd) {
    vite = await createViteDevServer(root);
    app.use(vite.middlewares);
  }

  app.use(async (req, res, next) => {
    try {
      const url = req.originalUrl!;

      const { template, render } = await getTemplateAndRenderer(url, vite);
      const { html: appHtml } = await render(url, manifest);

      const html = template.replace(`<!--app-html-->`, appHtml);
      res.writeHead(200, { 'Content-Type': 'text/html' });
      return res.end(html);
    } catch (e: any) {
      vite && vite.ssrFixStacktrace(e);
      res.statusCode = 500;
      return res.end(e.stack);
    }
  });
};
