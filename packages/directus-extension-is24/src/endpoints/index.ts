import { defineEndpoint } from '@directus/extensions-sdk';
import { useIS24 } from './useIS24';

export default defineEndpoint({
	id: 'is24',
	handler: (router, { database }) => {
		router.get('/requestToken', async (req, res) => {
			const { requestToken } = useIS24();
			return await requestToken(res, database);
		});

		router.get('/callback', async (req, res) => {
			const params = req.query as {
				oauth_token: string;
				oauth_verifier: string;
				state: string;
			};
			const { accessToken } = useIS24();
			await accessToken(params, database);
			res.redirect('/admin/content/is24_secret');
		});

		router.get('/listRealEstates', async (req, res) => {
			const { listRealEstates } = useIS24();
			const isRaw = !!req.query.raw;
			const result = await listRealEstates(database, isRaw);
			res.send(result);
		});
	},
});
