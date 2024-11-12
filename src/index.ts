import express from 'express';
import { OpenFeature } from '@openfeature/server-sdk';
import { EnvVarProvider } from '@openfeature/env-var-provider';
import { FlagdProvider } from '@openfeature/flagd-provider';
import { FirstSuccessfulStrategy, MultiProvider } from '@openfeature/multi-provider';

const app = express();
const port = 3000;

const flagdOneProvider = new FlagdProvider({
  host: process.env.FLAGD_HOST_ONE,
});

const flagdTwoProvider = new FlagdProvider({
  host: process.env.FLAGD_HOST_TWO,
});

const envVarProvider = new EnvVarProvider();

switch (process.env.OPENFEATURE_PROVIDER) {
  case 'flagd':
  case 'flagd-one':
    OpenFeature.setProvider(flagdOneProvider);
    break;
  case 'flagd-two':
    OpenFeature.setProvider(flagdTwoProvider);
    break;
  case 'env-var':
    OpenFeature.setProvider(envVarProvider);
    break;
  default:
    // Try changing the order of these!
    OpenFeature.setProvider(new MultiProvider(
      [
        {
          provider: flagdOneProvider,
        },
        {
          provider: flagdTwoProvider,
        },
        {
          provider: envVarProvider,
        },
      ],
      new FirstSuccessfulStrategy(),
    ));
}

const client = OpenFeature.getClient();

app.get('/', async (_, res) => {
  const showWelcomeMessage = await client.getBooleanValue('show-welcome-message', false);
  const welcomeMessage = await client.getStringValue('welcome-message', 'Default welcome message');
  const moreFun = await client.getStringValue('more-fun', '');
  res.send(`Express + TypeScript${showWelcomeMessage ? ' + OpenFeature Server' : ''}: ${welcomeMessage}${!!moreFun ? ` (${moreFun})` : ''}`);
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
