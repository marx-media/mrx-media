import express from 'express';
import { expressMiddleware } from '@mrx-media/vite-vue-simple-ssr/server';

export const startServer = async () => {
  const app = express();

  await expressMiddleware(app);

  try {
    app.listen(1337);
    // eslint-disable-next-line no-console
    console.log(`server is listening on port 1337`);
  } catch (e: any) {
    console.error(e.message);
    process.exit(1);
  }
};

startServer();
