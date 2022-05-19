import { isNode } from '../utils';
import type { Handler } from '../types';

export const simpleSSR: Handler = async (app, options, hook) => {
  const { default: entry } = isNode()
    ? await import('./entry-server')
    : await import('./entry-client');
  return await entry(app, options, hook);
};
