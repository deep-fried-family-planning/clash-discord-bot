import {Socket, SocketServer} from '@effect/platform';
import {NodeRuntime, NodeSocket, NodeSocketServer} from '@effect/platform-node';
import {Effect, Layer, Logger, LogLevel, Mailbox, pipe, Redacted} from 'effect';
import {DevUrlConfig, ProxyConfig} from 'dev/proxy-config.ts';

const program = Effect.gen(function* () {
  const mailbox = yield* Mailbox.make<any>();
  const server = yield* SocketServer.SocketServer;
  yield* Effect.logInfo(server.address);

  const config = yield* DevUrlConfig;
  const wss = Redacted.value(config);
  yield* Effect.logInfo(wss);

  const socket = yield* Socket.makeWebSocket(wss);

  yield* Effect.forkScoped(
    socket.run((chunk) => {
      const message = Buffer.from(chunk).toString();
      const event = JSON.parse(message);
      return pipe(
        Effect.logDebug(JSON.stringify(event, null, 2)),
        Effect.tap(mailbox.offer(event)),
      );
    }),
  );

  return yield* server.run((client) => Effect.gen(function* () {
    const writer = yield* client.writer;

    yield* Effect.forkScoped(
      client.run((chunk) =>
        Effect.logDebug(
          Buffer.from(chunk).toString(),
        ),
      ),
    );

    yield* Effect.forkScoped(Effect.loop(undefined, {
      while: () => true,
      step : () => {},
      body : () =>
        pipe(
          mailbox.take,
          Effect.map((mail) => JSON.stringify(mail)),
          Effect.tap(writer),
        ),
    }));
  }));
});

const layer = pipe(
  Layer.mergeAll(
    NodeSocket.layerWebSocketConstructor,
    Layer.scoped(
      SocketServer.SocketServer,
      ProxyConfig.pipe(Effect.flatMap((config) =>
        NodeSocketServer.makeWebSocket({
          host: config.host,
          port: config.port,
        }),
      )),
    ),
    Layer.scope,
    Logger.minimumLogLevel(LogLevel.All),
  ),
);

NodeRuntime.runMain(program.pipe(Effect.provide(layer)));
