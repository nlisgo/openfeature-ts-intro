# Open Feature TypeScript Demo

## Flagd Provider

```shell
OPENFEATURE_PROVIDER=flagd docker compose up --wait
```

Visit: http://localhost:5000

Change `flags.flagd.one.json` value `flags.welcome-message.defaultVariant` from `off` to `on` and visit http://localhost:5000 again

## Environment Variable Provider

```shell
OPENFEATURE_PROVIDER=env-var docker compose up --wait
```

Visit: http://localhost:5000

```shell
 OPENFEATURE_PROVIDER=env-var SHOW_WELCOME_MESSAGE=true WELCOME_MESSAGE='Custom welcome message!' docker compose up --wait --build
```

Visit: http://localhost:5000 again

## Multi Provider

I have chosen the default setup to be a multi-provider which can either insist on no conflicts between the multi-providers or can allow implement a "First Successful" strategy which I have chosen. I have setup 2 instances of flagd and one environment variable provider.

```javascript
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
```

```shell
docker compose up --wait
```

Visit: http://localhost:5000

Experiment by changing values in `flags.flagd.one.json`, `flags.flagd.two.json` or setting the appropriate environment variables. Also, try changing the order of the providers.

## Documentation

Here are the [docs for Open Feature](https://openfeature.dev/docs/reference/intro).
