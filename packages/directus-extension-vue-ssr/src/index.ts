import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { defineHook } from '@directus/extensions-sdk';
import { ssrMiddleware } from '@mrx-media/vite-vue-simple-ssr/server';

export default defineHook(({ init }, { env }) => {
	init('routes.custom.before', async ({ app }) => {
		const root = env.VITE_ROOT ?? dirname(fileURLToPath(import.meta!.url));
		const isProd = env.VITE_DEV ? !env.VITE_DEV : true;
		await ssrMiddleware(app, { root, isProd });
	});
});
