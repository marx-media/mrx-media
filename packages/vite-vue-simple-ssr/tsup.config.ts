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
  format: ['esm', 'cjs'],
  target: 'esnext',
  dts: true,
  shims: true,
  noExternal: [/@nuxt\/devalue/],
  onSuccess: 'node scripts/postbuild.js',
});
