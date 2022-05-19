import type { Handler } from './types';
import { isNode } from './utils';

export const simpleSSR: Handler = async (app, options, hook) => {
  const { default: entry } = isNode()
    ? await import('./entry-server')
    : await import('./entry-client');
  return await entry(app, options, hook);
};
