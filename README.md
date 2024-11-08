# Open Feature TypeScript Demo

## Flagd Provider

```shell
OPENFEATURE_PROVIDER=flagd docker compose up --wait
```

Visit: http://localhost:5000

Change flags.flagd.json value `flags.welcome-message.defaultVariant` from `off` to `on` and visit http://localhost:5000 again

## Environment Variable Provider

```shell
OPENFEATURE_PROVIDER=env-var docker compose up --wait
```

Visit: http://localhost:5000

```shell
 OPENFEATURE_PROVIDER=env-var SHOW_WELCOME_MESSAGE=true WELCOME_MESSAGE='Custom welcome message!' docker compose up --wait --build
```

Visit: http://localhost:5000 again

## Documentation

Here are the [docs for Open Feature](https://openfeature.dev/docs/reference/intro).
