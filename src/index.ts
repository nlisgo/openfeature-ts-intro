import express from 'express';
import { OpenFeature } from '@openfeature/server-sdk';
import { FlagdProvider } from '@openfeature/flagd-provider';

const app = express();
const port = 3000;
OpenFeature.setProvider(new FlagdProvider());
const client = OpenFeature.getClient();

app.get('/', async (_, res) => {
  const showWelcomeMessage = await client.getBooleanValue('welcome-message', false);
  if (showWelcomeMessage) {
    res.send('Express + TypeScript + OpenFeature Server');
  } else {
    res.send('Express + TypeScript Server');
  }
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
