import {SSMService} from '@effect-aws/client-ssm';
import {ConfigProvider} from '@effect-aws/ssm';
import {Config, Effect, Layer, pipe} from 'effect';

export const DevUrlConfig = pipe(
  Config.redacted('/dffp/qual/dev_ws'),
  Effect.provide(
    ConfigProvider.setParameterStoreConfigProvider().pipe(
      Layer.provide(SSMService.defaultLayer),
    ),
  ),
  Effect.catchAllDefect((e) => Effect.die(e)),
);

export const ProxyConfig = pipe(
  Config.all({
    protocol: Config.succeed('ws'),
    host    : Config.succeed('localhost'),
    port    : Config.succeed(3000),
  }),
  Effect.catchAllDefect((e) => Effect.die(e)),
);
