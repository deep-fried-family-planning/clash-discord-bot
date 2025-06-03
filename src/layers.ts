import {DiscordRESTEnv} from '#config/external.ts';
import {DeepFryerLogger} from '#src/service/DeepFryerLogger.ts';
import * as NodeHttpClient from '@effect/platform-node/NodeHttpClient';
import {DiscordConfig, DiscordRESTMemoryLive} from 'dfx';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as L from 'effect/Layer';
import * as Logger from 'effect/Logger';
import * as LogLevel from 'effect/LogLevel';

export const DiscordLive = () =>
  pipe(
    DeepFryerLogger.Default,
    L.provideMerge(DiscordRESTMemoryLive),
    L.provideMerge(NodeHttpClient.layerUndici),
    L.provideMerge(DiscordConfig.layerConfig(DiscordRESTEnv)),
    L.tap(() => E.logInfo('Discord Live')),
  );

export const LoggingLive = () =>
  pipe(
    Logger.replace(Logger.defaultLogger, Logger.prettyLogger({
      mode  : 'auto',
      colors: 'auto',
    })),
    L.provideMerge(Logger.minimumLogLevel(LogLevel.All)),
    L.provideMerge(L.setTracerTiming(true)),
    L.provideMerge(L.setTracerEnabled(true)),
    L.tap(() => E.logInfo('Logging Live')),
  );
