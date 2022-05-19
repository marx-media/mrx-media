import { parse, resolve } from 'path';
import fs from 'fs';
import { type InlineConfig, build, mergeConfig, resolveConfig } from 'vite';

const generatePackageJson = async (cfg: InlineConfig) => {
  const viteConfig = await resolveConfig(cfg, 'build');
  const packageJson = {
    main: parse(viteConfig.build.ssr as string).base,
    type: 'module',
    ssr: fs
      .readdirSync(resolve(process.cwd(), 'dist/client'))
      .filter((file) => !/(index\.html|manifest\.json)$/i.test(file)),
  };

  fs.writeFileSync(
    resolve(process.cwd(), 'dist/server/package.json'),
    JSON.stringify(packageJson, null, 2),
    { encoding: 'utf-8' },
  );
};

const ssrBuild = async (): Promise<void> => {
  const sharedConfig: InlineConfig = {
    build: {
      emptyOutDir: true,
      target: 'esnext',
      rollupOptions: {
        output: {
          format: 'esm',
        },
      },
    },
  };
  const clientConfig: InlineConfig = {
    build: {
      outDir: 'dist/client',
      ssrManifest: true,
    },
  };
  const serverConfig: InlineConfig = {
    build: {
      outDir: 'dist/server',
      ssr: 'src/main.ts',
    },
  };
  // client build
  await build(mergeConfig(clientConfig, sharedConfig));
  await build(mergeConfig(serverConfig, sharedConfig));
  await generatePackageJson(serverConfig);
};

export const execute = async (): Promise<void> => {
  const args = process.argv.slice(2);
  switch (args[0]) {
    case 'build':
      await ssrBuild();
      break;

    default:
      break;
  }
};
