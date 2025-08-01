import {Codec} from '#disreact/core/a/codec/Codec.ts';
import * as Doken from '#disreact/core/a/codec/doken.ts';
import type {Envelope} from '#disreact/core/a/adaptor/envelope.ts';
import * as Model from '#disreact/core/a/adaptor/Model.ts';
import {Relay} from '#disreact/core/a/adaptor/Relay.ts';
import * as Progress from '#disreact/core/a/codec/old/progress2.ts';
import {DiscordDOM} from '#disreact/adaptor-discord/service/DiscordDOM.ts';
import {DokenDefect, DokenState} from '#disreact/core/a/DokenState.ts';
import type {HttpClientError} from '@effect/platform/HttpClientError';
import * as DateTime from 'effect/DateTime';
import * as Deferred from 'effect/Deferred';
import * as Duration from 'effect/Duration';
import * as E from 'effect/Effect';
import * as Fiber from 'effect/Fiber';
import * as FiberHandle from 'effect/FiberHandle';
import {pipe} from 'effect/Function';
import * as Option from 'effect/Option';

export const registerRoot = Model.registerRoot;

export const createRoot = (id: Envelope.SourceId, props?: any, data?: any) =>
  pipe(
    Model.createRoot(id, props, data),
    E.flatMap((root) => {
      if (!root) {
        return E.succeed(null);
      }

      return Codec.encodeResponse({
        base    : 'https://dffp.org',
        doken   : Doken.synthetic(),
        encoding: root as any,
      });
    }),
  );

const pollDeferred = <A, E>(deferred: Deferred.Deferred<A, E>) =>
  pipe(
    Deferred.poll(deferred),
    E.flatMap(E.transposeOption),
    E.map(Option.getOrUndefined),
  );

const isTimingArmed = pipe(
  DokenState.timing,
  E.flatMap(FiberHandle.get),
  E.optionFromOptional,
  E.map(Option.match({
    onNone: () => false,
    onSome: () => true,
  })),
);

const awaitDisarm = pipe(
  DokenState.timing,
  E.tap(E.logTrace('disarming')),
  E.tap((timing) => FiberHandle.clear(timing)),
  E.tap(E.logTrace('awaiting disarm')),
  E.tap((timing) => FiberHandle.awaitEmpty(timing)),
  E.tap(E.logTrace('disarmed')),
);

const interruptDisarm = pipe(
  DokenState.timing,
  E.tap(E.logTrace('disarming interrupt')),
  E.tap((timing) => FiberHandle.clear(timing)),
  E.tap(E.logTrace('disarmed')),
);

const awaitDisarmIfArmed = pipe(
  awaitDisarm,
  E.whenEffect(isTimingArmed),
);

const armTiming = (duration: Duration.Duration) => <R>(effect: E.Effect<void, HttpClientError | DokenDefect, R>) =>
  DokenState.use((ds) =>
    pipe(
      E.logTrace('dispatched'),
      E.andThen(effect),
      E.delay(duration),
      FiberHandle.run(ds.timing, {
        onlyIfMissing        : false,
        propagateInterruption: true,
      }),
      E.tap(E.logTrace(`armed ${Duration.toSeconds(duration)}s`)),
      E.asVoid,
    ),
  );

const armImmediate = <R>(effect: E.Effect<void, HttpClientError | DokenDefect, R>) =>
  DokenState.use((ds) =>
    pipe(
      E.logTrace('immediate dispatching'),
      E.andThen(effect),
      E.tapDefect(E.logFatal),
      FiberHandle.run(ds.timing, {
        onlyIfMissing        : false,
        propagateInterruption: true,
      }),
      E.tap(E.logTrace('immediate armed')),
    ),
  );

const isDone = DokenState.use((ds) => ds.result.pipe(pollDeferred));

const armExit = E.gen(function* () {
  yield* E.logTrace('armExit');

  if (yield* isTimingArmed) {
    yield* E.fork(awaitDisarm);
  }
  const dokens = yield* DokenState;
  const latest = yield* dokens.latest;
  const active = yield* pollDeferred(dokens.active);
  const synced = yield* dokens.synced;
  const result = yield* pollDeferred(dokens.result);

  yield* dokens.finish(synced);
  const now = yield* DateTime.now;

  if (Doken.isActive(result) && Doken.ttl(result, now)) {
    return yield* pipe(
      DiscordDOM.dismount(result),
      E.uninterruptible,
      armImmediate,
    );
  }
  if (Doken.isActive(synced) && Doken.ttl(synced, now)) {
    return yield* pipe(
      DiscordDOM.dismount(synced),
      E.uninterruptible,
      armImmediate,
    );
  }
  if (Doken.ttl(latest, now)) {
    return yield* pipe(
      DiscordDOM.deferUpdate(synced),
      E.tap(DiscordDOM.dismount(synced)),
      E.uninterruptible,
      armImmediate,
    );
  }
  if (Doken.isActive(active) && Doken.ttl(active, now)) {
    return yield* pipe(
      DiscordDOM.dismount(active),
      E.uninterruptible,
      armImmediate,
    );
  }
  return yield* new DokenDefect({
    utc   : now,
    latest: latest,
    synced: synced,
    active: active,
    result: result,
    cause : new Error('No tokens available to dismount'),
  });
});

const armReuse = E.gen(function* () {
  yield* E.logTrace('armReuse');
  yield* awaitDisarmIfArmed;

  const now = yield* DateTime.now;

  if (yield* isDone) {
    return yield* new DokenDefect({
      utc  : now,
      cause: new Error('Interaction already finished'),
    });
  }
  const latest = yield* DokenState.latest;
  const active = yield* DokenState.active;

  const latestTtl = Doken.ttl(latest, now);
  const activeTtl = Doken.ttl(active, now);

  if (activeTtl) {
    if (!latestTtl) {
      return yield* DokenState.finish(active!).pipe(E.asVoid);
    }
    return yield* pipe(
      E.logTrace('discard'),
      E.tap(DiscordDOM.discard(latest)),
      E.tap(DokenState.finish(active!)),
      E.uninterruptible,
      E.asVoid,
    );
  }
  if (!latestTtl) {
    return yield* new DokenDefect({
      utc  : now,
      latest,
      active,
      cause: new Error('Latest token expired'),
    });
  }
  return yield* pipe(
    DiscordDOM.deferUpdate(latest),
    E.tap(DokenState.finish(Doken.active(latest))),
    armTiming(latestTtl),
  );
});

const armSource = E.gen(function* () {
  yield* E.logTrace('armSource');
  yield* awaitDisarmIfArmed;

  const now = yield* DateTime.now;

  if (yield* isDone) {
    return yield* new DokenDefect({
      utc  : now,
      cause: new Error('Interaction already finished'),
    });
  }
  const latest = yield* DokenState.latest;
  const freshTtl = Doken.ttl(latest, now);

  yield* DokenState.sync(Doken.source(latest));

  if (!freshTtl) {
    return yield* pipe(
      DiscordDOM.deferSource(latest),
      E.zipLeft(DokenState.finish(Doken.active(latest))),
      E.uninterruptible,
    );
  }
  return yield* pipe(
    DiscordDOM.deferSource(latest),
    E.tap(DokenState.finish(Doken.active(latest))),
    armTiming(freshTtl),
  );
});

const armUpdate = E.gen(function* () {
  yield* E.logTrace('armUpdate');
  yield* awaitDisarmIfArmed;

  const now = yield* DateTime.now;

  if (yield* isDone) {
    return yield* new DokenDefect({
      utc  : now,
      cause: new Error('Interaction already finished'),
    });
  }
  const latest = yield* DokenState.latest;
  const freshTtl = Doken.ttl(latest, now);

  yield* E.log(freshTtl);

  yield* pipe(
    latest,
    Doken.update,
    DokenState.sync,
  );

  if (!freshTtl) {
    return yield* pipe(
      DiscordDOM.deferUpdate(latest),
      E.tap(DokenState.finish(Doken.active(latest))),
      E.uninterruptible,
    );
  }
  return yield* pipe(
    DiscordDOM.deferUpdate(latest),
    E.tap(DokenState.finish(Doken.active(latest))),
    armTiming(freshTtl),
  );
});

const armDialog = E.gen(function* () {
  yield* E.logTrace('dialog');
  yield* awaitDisarmIfArmed;
  const now = yield* DateTime.now;

  if (yield* isDone) {
    return yield* new DokenDefect({
      utc  : now,
      cause: new Error('Interaction already finished'),
    });
  }

  const latest = yield* DokenState.latest;

  if (!Doken.ttl(latest, now)) {
    return yield* new DokenDefect({
      utc   : now,
      latest: latest,
      cause : new Error('Modal cannot be opened'),
    });
  }

  return yield* pipe(
    latest,
    Doken.dialog,
    DokenState.finish,
  );
});

const listen = E.gen(function* () {
  const rx = yield* DokenState.rx;

  const dom = yield* Relay;

  let isSame = false;
  let isNext = false;
  let current: Progress.Progress2;

  do {
    current = yield* dom.take;

    if (Progress.isExit(current)) {
      yield* armExit;
      continue;
    }
    else if (Progress.isSame(current)) {
      isSame = true;
      yield* armReuse;
      continue;
    }
    else if (Progress.isNext(current)) {
      isNext = true;
      yield* interruptDisarm;
      continue;
    }
    else if (Progress.isPart(current)) {
      if (isSame) {
        yield* awaitDisarm;
        continue;
      }
      if (isNext) {
        if (current.type === 'modal') {
          yield* armDialog;
          continue;
        }
        if (current.type === 'message') {
          if (rx.isEphemeral) {
            yield* armSource;
            continue;
          }
          yield* armUpdate;
          continue;
        }
        if (current.type === 'ephemeral') {
          if (rx.isEphemeral) {
            yield* armUpdate;
            continue;
          }
          yield* armSource;
        }
      }
    }
  }
  while (!Progress.isDone(current));
});

export const respond = E.fn('respond')(
  function* (body: unknown) {
    const req = yield* DokenState.rx;

    const listener = yield* E.fork(listen);
    const invoking = yield* E.fork(Model.invokeRoot(req.hydrator!, req.event, body));

    yield* Fiber.join(listener);
    const root = yield* Fiber.join(invoking);

    if (!root) {
      yield* awaitDisarm;
      return null;
    }

    const latest = yield* DokenState.latest;
    const synced = yield* DokenState.synced;
    const now = yield* DateTime.now;

    if (Doken.isDialog(synced)) {
      if (!Doken.ttl(synced, now)) {
        return yield* new DokenDefect({
          utc   : now,
          latest: latest,
          synced: synced,
          cause : new Error('Modal cannot be opened'),
        });
      }

      const payload = yield* Codec.encodeResponse({
        base    : 'https://dffp.org',
        doken   : Doken.convert(synced),
        encoding: root as any,
      });
      yield* DiscordDOM.createModal(synced, payload);
      return payload;
    }

    if (!Doken.ttl(latest, now)) {
      const result = yield* DokenState.result;

      if (!Doken.isActive(result)) {
        return yield* new DokenDefect({
          utc   : now,
          latest: latest,
          synced: synced,
          result: result,
          cause : new Error('Token must be deferred'),
        });
      }
      if (!Doken.ttl(result, now)) {
        return yield* new DokenDefect({
          utc   : now,
          latest: latest,
          synced: synced,
          result: result,
          cause : new Error('Expired token'),
        });
      }
      const payload = yield* Codec.encodeResponse({
        base    : 'https://dffp.org',
        doken   : result,
        encoding: root as any,
      });
      yield* DiscordDOM.deferEdit(result, payload);
      return payload;
    }

    if (!Doken.ttl(synced, now)) {
      return yield* new DokenDefect({
        utc   : now,
        latest: latest,
        synced: synced,
        cause : new Error('Expired token'),
      });
    }

    const payload = yield* Codec.encodeResponse({
      base    : 'https://dffp.org',
      doken   : Doken.convert(synced),
      encoding: root as any,
    });

    if (Doken.isActive(synced)) {
      yield* awaitDisarm;
      yield* DiscordDOM.deferEdit(synced, payload);
      return payload;
    }

    yield* interruptDisarm;

    if (Doken.isSource(synced)) {
      yield* DiscordDOM.createSource(synced, payload);
      return payload;
    }
    if (Doken.isUpdate(synced) || Doken.isLatest(synced)) {
      yield* DiscordDOM.createUpdate(synced, payload);
      return payload;
    }
    return null;
  },
  (effect, body) => E.provide(effect, [DokenState.Fresh(body), Relay.Fresh]),
);
