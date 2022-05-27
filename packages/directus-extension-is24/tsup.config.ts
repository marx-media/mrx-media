import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/endpoints/index.ts', 'src/migrations/20220527-create-tables.ts'],
	splitting: false,
	clean: true,
	format: ['cjs'],
	target: 'esnext',
	noExternal: [/oauth-1.0a/, /node-fetch/, /lodash/, /@directus\/sdk/],
	legacyOutput: true,
});
