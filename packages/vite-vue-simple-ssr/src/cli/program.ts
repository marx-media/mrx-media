import { parse, resolve } from 'path';
import fs from 'fs';
import { type InlineConfig, build, mergeConfig, resolveConfig } from 'vite';
import { simpleLog } from '../utils';

const generatePackageJson = async (cfg: InlineConfig, outDir: string) => {
  const viteConfig = await resolveConfig(cfg, 'build');

  const ssr = fs
    .readdirSync(resolve(outDir, 'client'))
    .filter((file) => !/(index\.html|manifest\.json)$/i.test(file));

  const packageJson = {
    main: parse(viteConfig.build.ssr as string).base,
    type: 'module',
    ssr,
    exports: {
      './ssr.config': {
        import: './ssr.config.mjs',
        require: './ssr.config.cjs',
      },
    },
  };

  fs.writeFileSync(
    resolve(outDir, 'server/package.json'),
    JSON.stringify(packageJson, null, 2),
    { encoding: 'utf-8' },
  );
  fs.writeFileSync(
    resolve(outDir, 'server/ssr.config.cjs'),
    `module.exports = ${JSON.stringify(ssr, null, 2)}`,
    { encoding: 'utf-8' },
  );
  fs.writeFileSync(
    resolve(outDir, 'server/ssr.config.mjs'),
    `export default ${JSON.stringify(ssr, null, 2)}`,
    { encoding: 'utf-8' },
  );
};

const ssrBuild = async (options: any = {}): Promise<void> => {
  const { outDir = 'dist' } = options;
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
      outDir: resolve(outDir, 'client'),
      assetsDir: 'vue-assets',
      ssrManifest: true,
    },
  };
  const serverConfig: InlineConfig = {
    build: {
      outDir: resolve(outDir, 'server'),
      ssr: 'src/main.ts',
    },
  };

  await build(mergeConfig(clientConfig, sharedConfig));
  await build(mergeConfig(serverConfig, sharedConfig));
  await generatePackageJson(serverConfig, outDir);
};

export const execute = async (): Promise<void> => {
  const args = process.argv.slice(2);
  const opts = args.slice(1);
  const options: any = {};
  let ok = true;
  switch (args[0]) {
    case 'build':
      for (let i = 0; i < opts.length; i++) {
        const _o = opts[i];
        if (_o === '--outDir') {
          if (opts.length < i + 2) {
            simpleLog('Please specifiy out dir! e.g.: --outDir dist', 'error');
            ok = false;
          } else {
            i++;
            options[_o.substring(2)] = opts[i];
          }
        }
      }
      if (ok) await ssrBuild(options);
      break;

    default:
      break;
  }
};
