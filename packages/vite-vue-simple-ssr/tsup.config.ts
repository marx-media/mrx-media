import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/vue/index.ts',
    'src/cli/program.ts',
    'src/server/index.ts',
    'src/utils/index.ts',
    'src/types/index.ts',
  ],
  splitting: false,
  sourcemap: true,
  clean: true,
  format: ['esm'],
  target: 'esnext',
  dts: true,
  noExternal: [/@nuxt\/devalue/],
});
