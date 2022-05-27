import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import fetch from 'node-fetch';
import type { Response } from 'express';
import type { Knex } from 'knex';
import { get } from 'lodash';

let __secret: string;

export const useIS24 = () => {
	const publicURL = process.env.PUBLIC_URL as string;
	const baseURL = 'https://rest.immobilienscout24.de/restapi';
	const baseHEAD = { Accept: 'application/json', 'Content-Type': 'application/json' };
	const getClientToken = async (db: Knex) => {
		return await db('is24_client').select('client_id', 'client_secret').orderBy('id', 'desc').first();
	};
	const initiateOauth = async (db: Knex) => {
		const client = await getClientToken(db);
		return new OAuth({
			consumer: { key: client.client_id, secret: client.client_secret },
			signature_method: 'HMAC-SHA1',
			hash_function: (base_string, key) => crypto.createHmac('sha1', key).update(base_string).digest('base64'),
		});
	};

	const parseImage = (urls: any[]): string => {
		for (const obj of urls) {
			if (get(obj, 'url') && Array.isArray(get(obj, 'url'))) {
				for (const url of obj.url) {
					if (get(url, '@href')) {
						const href: string = get(url, '@href', '');
						if (href.includes('/ORIG/')) return href.split('/ORIG/')[0];
					}
				}
			}
		}
		return '';
	};

	const parseString = (str: string): Record<string, string> => {
		return Object.assign(
			{},
			...str
				.split('&')
				.map((pair) => pair.split('='))
				.map(([key, val]) => ({ [key]: val }))
		);
	};

	const getToken = async (db: Knex) => {
		return await db('is24_secret').select('key', 'secret').orderBy('id', 'desc').first();
	};

	const requestToken = async (res: Response, db: Knex) => {
		const __oauth = await initiateOauth(db);
		const url = [baseURL, '/security/oauth/request_token'].join('');
		const authHeaders = __oauth.toHeader(
			__oauth.authorize({ url, method: 'GET', data: { oauth_callback: `${publicURL}/is24/callback` } })
		);
		const headers = {
			...baseHEAD,
			...authHeaders,
		};
		const response = await fetch(url, { headers, method: 'GET' });
		const result = await response.text();
		const parsed = parseString(result) as {
			oauth_token: string;
			oauth_token_secret: string;
			oauth_callback_confirmed: string;
		};
		__secret = decodeURIComponent(parsed.oauth_token_secret);

		return res.redirect(`${baseURL}/security/oauth/confirm_access?oauth_token=${parsed.oauth_token}`);
	};

	const accessToken = async (
		{
			oauth_token,
			oauth_verifier,
			state,
		}: {
			oauth_token: string;
			oauth_verifier: string;
			state: string;
		},
		db: Knex
	) => {
		if (state !== 'authorized') return;
		const url = [baseURL, '/security/oauth/access_token'].join('');
		const __oauth = await initiateOauth(db);
		const authHeaders = __oauth.toHeader(
			__oauth.authorize(
				{
					url,
					method: 'GET',
					data: { oauth_token, oauth_verifier },
				},
				{ key: oauth_token, secret: __secret }
			)
		);
		const headers = {
			...baseHEAD,
			...authHeaders,
		};
		const response = await fetch(url, { headers, method: 'GET' });
		const result = await response.text();
		const parsed = parseString(result) as { oauth_token: string; oauth_token_secret: string };
		parsed.oauth_token_secret = decodeURIComponent(parsed.oauth_token_secret);
		await db('is24_secret').insert({ key: parsed.oauth_token, secret: parsed.oauth_token_secret });
	};

	const formatPicture = (url: string, format = 'webp', { width = 200, height = 200 }) => {
		return `${url}/ORIG/resize/${width}x${height}/format/${format}`;
	};

	const listRealEstates = async (db: Knex, raw: boolean) => {
		const __oauth = await initiateOauth(db);
		const token = await getToken(db);

		const url = [baseURL, '/api/offer/v1.0/user/me/realestate?publishchannel=IS24'].join('');
		const headers = { ...baseHEAD, ...__oauth.toHeader(__oauth.authorize({ url, method: 'GET' }, token)) };
		const response = await fetch(url, { headers, method: 'GET' });
		const result = (await response.json()) as any;
		if (raw) return result;

		const base = result['realestates.realEstates'];
		const meta = {
			page: base.Paging.pageNumber,
			limit: base.Paging.pageSize,
			totalPages: base.Paging.numberOfPages,
			totalItems: base.Paging.numberOfHits,
		};
		const items = base.realEstateList.realEstateElement.map((obj: any) => {
			const type = get(obj, '@xsi.type', 'offerlistelement:OfferApartmentBuy').split(':')[1];
			const fetch = obj['@xlink.href'];
			const updated_at = obj['@modification'];
			const created_at = obj['@creation'];
			const id = obj['@id'];
			return {
				id,
				title: get(obj, 'title', ''),
				status: get(obj, 'realEstateState', 'INACTIVE'),
				address: {
					street: get(obj, 'address.street', ''),
					houseNo: get(obj, 'address.houseNumber', ''),
					postCode: get(obj, 'address.postcode', ''),
					city: get(obj, 'address.city', ''),
				},
				picture: {
					hasPicture: !!get(obj, 'titlePicture'),
					title: get(obj, 'titlePicture.title', ''),
					isFloorplan: get(obj, 'titlePicture.floorplan', 'false') === 'true',
					isTitlePicture: get(obj, 'titlePicture.titlePicture', 'false') === 'true',
					src: parseImage(get(obj, 'titlePicture.urls', [])),
				},
				price: {
					value: get(obj, 'price.value', 0),
					currency: get(obj, 'price.currency', 'EUR'),
					display: new Intl.NumberFormat('de-DE', {
						style: 'currency',
						currency: get(obj, 'price.currency', 'EUR'),
					}).format(get(obj, 'price.value', 0)),
				},
				type,
				externalLink: `https://immobilienscout24.de/expose/${id}`,
				fetch,
				updated_at,
				created_at,
			};
		});
		return {
			items,
			meta,
		};
	};

	return {
		formatPicture,
		requestToken,
		accessToken,
		listRealEstates,
	};
};
