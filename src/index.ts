import express from 'express';
import { OpenFeature } from '@openfeature/server-sdk';
import { EnvVarProvider } from '@openfeature/env-var-provider';
import { FlagdProvider } from '@openfeature/flagd-provider';

const app = express();
const port = 3000;

switch (process.env.OPENFEATURE_PROVIDER ?? 'flagd') {
  case 'flagd':
    OpenFeature.setProvider(new FlagdProvider());
    break;
  case 'env-var':
  default:
    OpenFeature.setProvider(new EnvVarProvider());
}
const client = OpenFeature.getClient();

app.get('/', async (_, res) => {
  const showWelcomeMessage = await client.getBooleanValue('show-welcome-message', false);
  const welcomeMessage = await client.getStringValue('welcome-message', 'Default welcome message');
  res.send(`Express + TypeScript${showWelcomeMessage ? ' + OpenFeature Server' : ''}: ${welcomeMessage}`);
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
