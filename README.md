# clash-discord-bot
[![main](https://github.com/deep-fried-family-planning/clash-discord-bot/actions/workflows/main.yaml/badge.svg)](https://github.com/deep-fried-family-planning/clash-discord-bot/actions/workflows/main.yaml)

[![Discord](https://img.shields.io/discord/1196596661804351519?logo=discord&style=flat&color=9c6e63&label=DFFP)](https://discord.gg/cG98cXRRZB)
![Discord](https://img.shields.io/discord/1287829383544963154?logo=discord&style=flat&color=A5EF80&label=Qual)
[![Discord](https://img.shields.io/discord/1283847240061947964?logo=discord&style=flat&color=C8C4F0&label=Support)](https://discord.gg/KfpCtU2rwY)

Deep Fried Family Planning's Official Discord Bot

### Setup
Install [`pnpm`](https://pnpm.io/installation).
Then run this command:
```bash
pnpm install
```

### TypeScript
Type check code changes with [`typescript`](https://www.typescriptlang.org)
using this command:
```bash
pnpm run types
```

### Lint
Lint code changes with [`eslint`](https://eslint.org)
using this command:
```bash
pnpm run lint
pnpm run fixlint # automatically fix eslint errors if applicable
```

### Unit Test
Unit test check code changes with [`vitest`](https://vitest.dev)
using this command:
```bash
pnpm run unit
```


### Local Dev
Terminal 1:
```bash
# apply *infra* account AWS creds
pnpm run proxy
```
Terminal 2:
```bash
# apply *qual* account AWS creds
pnpm run dev
```
Source code changes for UI component messages trigger rebuilds automatically. Any local dev session may last max of 2 hours. Once that limit is reached, run `pnpm run dev-proxy` again in your first terminal.


### Terraform (todo)

