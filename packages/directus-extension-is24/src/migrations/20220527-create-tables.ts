import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
	await knex.schema.createTable('is24_client', (table) => {
		table.increments();
		table.string('client_id');
		table.string('client_secret');
	});

	await knex.schema.createTable('is24_secret', (table) => {
		table.increments();
		table.string('key');
		table.string('secret');
	});

	await knex('directus_collections').insert([
		{
			collection: 'Immoscout24',
			icon: 'folder',
			hidden: false,
			singleton: false,
			archive_app_filter: true,
			accountability: 'all',
			collapse: 'open',
		},
		{
			collection: 'is24_client',
			hidden: false,
			singleton: true,
			archive_app_filter: true,
			accountability: 'all',
			collapse: 'open',
			group: 'Immoscout24',
			sort: 1,
		},
		{
			collection: 'is24_secret',
			hidden: false,
			singleton: true,
			archive_app_filter: true,
			accountability: 'all',
			collapse: 'open',
			group: 'Immoscout24',
			sort: 2,
		},
	]);

	await knex('directus_fields').insert([
		{
			collection: 'is24_client',
			field: 'id',
			interface: 'input',
			readonly: true,
			hidden: true,
			width: 'full',
			required: false,
		},
		{
			collection: 'is24_client',
			field: 'client_id',
			interface: 'input',
			display: 'raw',
			readonly: false,
			hidden: false,
			width: 'half',
			required: true,
		},
		{
			collection: 'is24_client',
			field: 'client_secret',
			interface: 'input',
			options: JSON.stringify({ masked: true }),
			display: 'raw',
			readonly: false,
			hidden: false,
			width: 'half',
			required: true,
		},
		{
			collection: 'is24_secret',
			field: 'id',
			interface: 'input',
			readonly: true,
			hidden: true,
			width: 'full',
			required: false,
		},
		{
			collection: 'is24_secret',
			field: 'key',
			interface: 'input',
			display: 'raw',
			readonly: true,
			hidden: false,
			width: 'half',
			required: true,
		},
		{
			collection: 'is24_secret',
			field: 'secret',
			interface: 'input',
			options: JSON.stringify({ masked: true }),
			display: 'raw',
			readonly: true,
			hidden: false,
			width: 'half',
			required: true,
		},
	]);
};

export const down = async (knex: Knex) => {
	await knex.schema.dropTableIfExists('is24_config');
	await knex('directus_collections').where({ collection: 'is24_client' }).del();
	await knex('directus_fields').where({ collection: 'is24_client' }).del();
};
