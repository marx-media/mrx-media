import fs from 'fs';
import { resolve } from 'path';
import { type ViteDevServer, createServer } from 'vite';
import devalue from '@nuxt/devalue';
import type { RendererResult } from '../types';

export const getSsrManifest = (isProd: boolean, root: string): any => {
  return isProd
    ? fs.readFileSync(resolve(root, 'dist/client/ssr-manifest.json'), 'utf-8')
    : {};
};

export const getIndexHtml = (root: string): string => {
  return fs.readFileSync(resolve(root, 'dist/client/index.html'), 'utf-8');
};

export const createViteDevServer = async (
  root: string,
): Promise<ViteDevServer> => {
  return await createServer({
    root,
    server: {
      middlewareMode: 'ssr',
    },
  });
};

export const getTemplateAndRenderer = async (
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
    render = (await import(resolve(root, 'dist/server/main.js'))).default;
  }
  return { template, render };
};

export const buildServeHtml = (
  template: string,
  {
    html,
    preloadLinks,
    headTags,
    bodyAttrs,
    htmlAttrs,
    initialState,
  }: RendererResult,
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
