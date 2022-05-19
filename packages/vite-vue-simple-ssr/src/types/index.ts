import type { App, Component } from 'vue';
import type { RouteRecordRaw, Router } from 'vue-router';
import type { HeadClient } from '@vueuse/head';

export interface HandlerOptions {
  routes: RouteRecordRaw[];
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

export interface ServerOptions {
  /**
   * Root path to your vite application
   *
   * default to `process.cwd()`
   */
  root?: string;

  /**
   * Specifiy initial state
   */
  initialState?: any;

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
}

export type Handler = (
  App: Component,
  options: HandlerOptions,
  hook: (ctx: HookParams) => Promise<HookResolve>,
) => Promise<
  void | ((url: string, manifest: any, context: any) => Promise<RendererResult>)
>;