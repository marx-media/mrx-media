import type { App, Component } from 'vue';
import type { ViteDevServer } from 'vite';
import type { RouteRecordRaw, Router } from 'vue-router';
import type { HeadClient } from '@vueuse/head';

export interface HandlerOptions {
  routes: RouteRecordRaw[];

  /* This is only used by SSR
   *
   */
  initialState?: any;
  /**
   * If debug mode is on, client application renders 3 seconds after server application
   *
   * default to `false`
   */
  debug?: boolean;
}

export interface HookParams {
  app: App;
  router: Router;
  initialState: any;
  isClient: boolean;
  request?: any;
  response?: any;
}

export interface HookResolve {
  [key: string]: any;
  head: HeadClient;
}

export interface HookHandler {
  isFastify: boolean;
  isProd: boolean;
  root: string;
  hook?: (url: string, req: any) => Promise<boolean>;
  vite?: ViteDevServer;
}

export interface ServerOptions {
  isProd?: boolean;
  /**
   * Root path to your vite application
   *
   * default to `process.cwd()`
   */
  root?: string;

  /**
   * Are you want to use compression on server
   *
   * default to `true`
   */
  useCompression?: boolean;
}

export interface RendererResult {
  html: string;
  preloadLinks: string;
  headTags: string;
  htmlAttrs: string;
  bodyAttrs: string;
  initialState: any;
}

export type Handler = (
  App: Component,
  options: HandlerOptions,
  hook: (ctx: HookParams) => Promise<HookResolve>,
) => Promise<
  void | ((url: string, manifest: any, context: any) => Promise<RendererResult>)
>;
