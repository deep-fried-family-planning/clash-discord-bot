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
      pipe(
        Console.log(`[runtime] ${signal} received`),
        E.andThen(managedRuntime.disposeEffect),
        E.andThen(Console.log('[runtime] exiting')),
        E.andThen(E.sync(() => process.exit(0))),
      ),
    );
  };

  process.on('SIGTERM', signalHandler);
  process.on('SIGINT', signalHandler);

  return managedRuntime.runPromise;
};
