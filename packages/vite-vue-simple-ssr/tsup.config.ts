import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/vue/index.ts', 'src/cli/program.ts', 'src/server/index.ts'],
  splitting: false,
  sourcemap: true,
  clean: true,
  format: ['esm'],
  dts: true,
  noExternal: [/commander/],
});
