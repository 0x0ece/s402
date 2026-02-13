/**
 * Cloudflare Workers: deploys the Express server with static assets.
 * @see https://developers.cloudflare.com/workers/tutorials/deploy-an-express-app/
 */
import { env } from 'cloudflare:workers';
import { httpServerHandler } from 'cloudflare:node';
import { createApp } from './server';

const app = createApp(env as import('./server').WorkerEnv);
const PORT = 3000;
app.listen(PORT);

export default httpServerHandler({ port: PORT });
