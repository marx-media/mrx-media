import type { Component } from 'vue';
import type { RouteRecordRaw } from 'vue-router';

export interface HandlerOptions {
  routes: RouteRecordRaw[];
}

export interface HookParams {}

export interface Renderer {}

export type Handler = (
  App: Component,
  options: HandlerOptions,
  hook: (ctx: HookParams) => Promise<void>,
) => Promise<void | Renderer>;
