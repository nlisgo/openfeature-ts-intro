import express from 'express';
import { Client, OpenFeature } from '@openfeature/server-sdk';
import { EnvVarProvider } from '@openfeature/env-var-provider';
import { FlagdProvider } from '@openfeature/flagd-provider';
import { FirstSuccessfulStrategy, MultiProvider } from '@openfeature/multi-provider';
import Joi from 'joi';
import { merge } from 'ts-deepmerge';
import { GrowthbookClientProvider } from '@openfeature/growthbook-client-provider';

type Config = {
  showWelcomeMessage: boolean,
  welcomeMessage?: string,
};

const defaultConfig: Config = {
  showWelcomeMessage: false,
};

const ConfigSchema = Joi.object<Config, true>({
  showWelcomeMessage: Joi.boolean().required(),
  welcomeMessage: Joi.string().optional(),
});

const app = express();
const port = 3000;

const setProviders = async () => {
  const flagdOneProvider = new FlagdProvider({
    host: process.env.FLAGD_HOST_ONE,
  });
  
  const flagdTwoProvider = new FlagdProvider({
    host: process.env.FLAGD_HOST_TWO,
  });
  
  const envVarProvider = new EnvVarProvider();
  
  const growthbookProvider = new GrowthbookClientProvider({
    apiHost: 'http://localhost:3100',
    clientKey: 'sdk-SV1pbOiK80nZezI',
  });
  
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
    case 'growthbook':
      await OpenFeature.setProviderAndWait(growthbookProvider);
      break;
    default:
      // Try changing the order of these!
      await OpenFeature.setProviderAndWait(new MultiProvider(
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
          {
            provider: growthbookProvider,
          },
        ],
        new FirstSuccessfulStrategy(),
      ));
  }
  
  return OpenFeature.getClient();
}

const getConfig = async (client: Client) => {
  try {
    const config = await client.getObjectValue('config', {});
    const mergedConfig = (config && typeof config === 'object') ? merge(defaultConfig, config) : defaultConfig;
    
    return Joi.attempt(
      mergedConfig,
      ConfigSchema,
      {
        allowUnknown: true,
      }
    );
  } catch (error) {
    console.warn(error);
    return defaultConfig;
  }
}

app.get('/', async (_, res) => {
  const client = await setProviders();
  const showWelcomeMessage = await client.getBooleanValue('show-welcome-message', false);
  const welcomeMessage = await client.getStringValue('welcome-message', 'Default welcome message');
  const moreFun = await client.getStringValue('more-fun', 'No more-fun!!');
  const config = await getConfig(client);
  const growthbookFeatureOne = await client.getStringValue('growthbook-feature-one', 'No Growthbook setting');
  console.log(config);
  res.setHeader('Content-Type', 'text/html').send(`
    <p>Express + TypeScript${showWelcomeMessage ? ' + OpenFeature Server' : ''}: ${welcomeMessage}${!!moreFun ? ` (${moreFun})` : ''}</p>
    <p>${JSON.stringify(config)}</p>
    <p>${growthbookFeatureOne}</p>
  `);
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
