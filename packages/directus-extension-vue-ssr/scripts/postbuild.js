import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const dist = resolve(dirname(fileURLToPath(import.meta.url)), '../dist');

fs.readdirSync(dist)
	.filter((file) => file.endsWith('js'))
	.forEach((file) =>
		fs.copyFileSync(
			join(dist, file),
			resolve('/home/dmarx/marx-media/@mrx-media/examples/directus-ssr-vue/extensions/hooks/ssr-vue', file)
		)
	);
