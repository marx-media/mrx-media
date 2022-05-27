import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const endpoints = resolve(dirname(fileURLToPath(import.meta.url)), '../dist/endpoints');
const migrations = resolve(dirname(fileURLToPath(import.meta.url)), '../dist/migrations');

fs.readdirSync(endpoints)
	.filter((file) => file.endsWith('js'))
	.forEach((file) =>
		fs.copyFileSync(
			join(endpoints, file),
			resolve('/home/dmarx/marx-media/directus-instance/sites/marx-ulm.de/extensions/endpoints/is24', file)
		)
	);

fs.readdirSync(migrations)
	.filter((file) => file.endsWith('js'))
	.forEach((file) =>
		fs.copyFileSync(
			join(migrations, file),
			resolve('/home/dmarx/marx-media/directus-instance/sites/marx-ulm.de/extensions/migrations', file)
		)
	);
