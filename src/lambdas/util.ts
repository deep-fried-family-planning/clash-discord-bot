import {DeepFryerLogger} from '#src/service/DeepFryerLogger.ts';
import * as Console from 'effect/Console';
import * as E from 'effect/Effect';
import * as Effect from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as L from 'effect/Layer';
import * as Logger from 'effect/Logger';
import * as LogLevel from 'effect/LogLevel';
import * as ManagedRuntime from 'effect/ManagedRuntime';

export const BaseLambdaLayer = L.mergeAll(
  Logger.replace(Logger.defaultLogger, Logger.prettyLoggerDefault),
  Logger.minimumLogLevel(LogLevel.All),
  L.setTracerTiming(true),
  L.setTracerEnabled(true),
);
