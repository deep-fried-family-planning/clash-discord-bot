import {E, L, Logger, LogLevel, pipe} from '#src/internal/pure/effect.ts';
import {DeepFryerLogger} from '#src/service/DeepFryerLogger.ts';
import {Effect} from 'effect';
import {Console, ManagedRuntime} from 'effect';

export const BaseLambdaLayer = L.mergeAll(
  Logger.replace(Logger.defaultLogger, Logger.prettyLoggerDefault),
  Logger.minimumLogLevel(LogLevel.All),
  L.setTracerTiming(true),
  L.setTracerEnabled(true),
);

export const makeLambdaRuntime = <A, E>(layer: L.Layer<A, E, never>) => {
  const managedRuntime = ManagedRuntime.make(
    layer.pipe(
      L.provideMerge(
        L.mergeAll(
          Logger.replace(Logger.defaultLogger, Logger.prettyLoggerDefault),
          Logger.minimumLogLevel(LogLevel.All),
          L.setTracerTiming(true),
          L.setTracerEnabled(true),
        ),
      ),
    ),
  );

  const signalHandler: NodeJS.SignalsListener = (signal) => {
    E.runFork(
      E.gen(function* () {
        yield* Console.log(`[runtime] ${signal} received`);
        yield* managedRuntime.disposeEffect;
        yield* Console.log('[runtime] exiting');
        yield* E.sync(() => process.exit(0));
      }),
    );
  };

  process.on('SIGTERM', signalHandler);
  process.on('SIGINT', signalHandler);

  return managedRuntime.runPromise;
};

export const bindHandler = <AWS, A, E, R>(handler: (event: AWS) => Effect.Effect<A, E, R>) =>
  (event: AWS) =>
    pipe(
      handler(event),
      Effect.tapError((error) => DeepFryerLogger.logError(error)),
      Effect.tapDefect((defect) => DeepFryerLogger.logFatal(defect)),
    );
