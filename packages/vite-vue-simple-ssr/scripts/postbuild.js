import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const src = resolve(dirname(fileURLToPath(import.meta.url)), '../src');
const dist = resolve(dirname(fileURLToPath(import.meta.url)), '../dist');

// fs.readdirSync(resolve(src))
//   .filter((file) => file.endsWith('d.ts'))
//   .forEach((file) => {
//     console.log(`copy file ${resolve(src, file)} to ${resolve(dist, file)}`);
//     fs.copyFileSync(resolve(src, file), resolve(dist, file));
//   });

fs.readdirSync(resolve(src, 'cli'))
  .filter((file) => file.endsWith('js'))
  .forEach((file) =>
    fs.copyFileSync(join(src, 'cli', file), join(dist, 'cli', file)),
  );
