import {E, L, Logger, LogLevel, pipe} from '#src/internal/pure/effect.ts';
import {Console, ManagedRuntime, Runtime} from 'effect';

export const BaseLambdaLayer = L.mergeAll(
  Logger.replace(Logger.defaultLogger, Logger.prettyLoggerDefault),
  Logger.minimumLogLevel(LogLevel.All),
  L.setTracerTiming(true),
  L.setTracerEnabled(true),
);

export const makeLambdaRuntime =  <A, E>(layer: L.Layer<A, E, never>) => {
  const managedRuntime = ManagedRuntime.make(layer);

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
