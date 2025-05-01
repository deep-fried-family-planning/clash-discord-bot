import {Socket} from '@effect/platform';
import {NodeRuntime, NodeSocket} from '@effect/platform-node';
import {Effect, Layer, Logger, LogLevel, pipe} from 'effect';
import {ProxyConfig} from 'scripts/dev/proxy-config.ts';
import {devServer} from 'scripts/dev/dev-server.ts';

const program = Effect.gen(function* () {
  const config = yield* ProxyConfig;
  const wss = `${config.protocol}://${config.host}:${config.port}`;
  yield* Effect.logInfo(wss);

  const socket = yield* Socket.makeWebSocket(wss);

  return yield* socket.run((chunk) => {
    const message = Buffer.from(chunk).toString();
    const event = JSON.parse(message);

    return pipe(
      Effect.logDebug(event),
      Effect.tap(() => {
        return Effect.promise(
          async () => await devServer(event.kind, event.data),
        );
      }),
    );
  });
});

NodeRuntime.runMain(
  program.pipe(Effect.provide(
    Layer.mergeAll(
      NodeSocket.layerWebSocketConstructor,
      Logger.minimumLogLevel(LogLevel.All),
    ),
  )),
);
