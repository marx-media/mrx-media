import express from 'express';
import { expressMiddleware } from '@mrx-media/vite-vue-simple-ssr/server';
import { simpleLog } from '@mrx-media/vite-vue-simple-ssr/utils';

export const startServer = async () => {
  const app = express();

  await expressMiddleware(app, { initialState: { success: true } });

  try {
    app.listen(1337);
    // eslint-disable-next-line no-console
    simpleLog(`[express] server is listening on port 1337`);
  } catch (e: any) {
    console.error(e.message);
    process.exit(1);
  }
};

startServer();
