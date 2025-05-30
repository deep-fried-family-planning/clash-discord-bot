import {Codec} from '#src/disreact/codec/Codec.ts';
import {Doken} from '#src/disreact/codec/rest/doken.ts';
import type * as Rx from '#src/disreact/codec/rx.ts';
import type {Rehydrant} from '#src/disreact/mode/entity/rehydrant.ts';
import * as Model from '#src/disreact/mode/model.ts';
import {RehydrantDOM} from '#src/disreact/mode/RehydrantDOM.ts';
import * as Progress from '#src/disreact/mode/util/progress.ts';
import {DiscordDOM} from '#src/disreact/runtime/DiscordDOM.ts';
import {DokenDefect, DokenState} from '#src/disreact/runtime/DokenState.ts';
import type {HttpClientError} from '@effect/platform/HttpClientError';
import * as DateTime from 'effect/DateTime';
import * as Deferred from 'effect/Deferred';
import type * as Duration from 'effect/Duration';
import * as E from 'effect/Effect';
import * as Either from 'effect/Either';
import * as Fiber from 'effect/Fiber';
import * as FiberHandle from 'effect/FiberHandle';
import {pipe} from 'effect/Function';
import * as Option from 'effect/Option';

export * as Methods from '#src/disreact/runtime/methods.ts';
export type Methods = never;

export const registerRoot = Model.registerRoot;

export const createRoot = (id: Rehydrant.SourceId, props?: any, data?: any) =>
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
    E.provide(RehydrantDOM.Fresh),
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

const disarmJoinTiming = pipe(
  DokenState.timing,
  E.tap((timing) => FiberHandle.clear(timing)),
  E.tap((timing) => FiberHandle.join(timing)),
);

const armTiming = (duration: Duration.Duration) => <R>(effect: E.Effect<void, HttpClientError | DokenDefect, R>) =>
  DokenState.use((ds) =>
    pipe(
      effect,
      E.tapDefect(E.logFatal),
      E.delay(duration),
      FiberHandle.run(ds.timing, {
        onlyIfMissing        : false,
        propagateInterruption: true,
      }),
    ),
  );

const armImmediate = <R>(effect: E.Effect<void, HttpClientError | DokenDefect, R>) =>
  DokenState.use((ds) =>
    pipe(
      effect,
      E.tapDefect(E.logFatal),
      FiberHandle.run(ds.timing, {
        onlyIfMissing        : false,
        propagateInterruption: true,
      }),
    ),
  );

const isDone = DokenState.use((ds) => ds.result.pipe(pollDeferred));

const armExit = E.gen(function* () {
  if (yield* isTimingArmed) {
    yield* E.fork(disarmJoinTiming);
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
  return yield* new DokenDefect({cause: new Error('No tokens available to dismount')});
});

const armReuse = E.gen(function* () {
  if (yield* isTimingArmed) {
    yield* disarmJoinTiming;
  }
  if (yield* isDone) {
    return yield* new DokenDefect({cause: new Error('Interaction already finished')});
  }
  const latest = yield* DokenState.latest;
  const active = yield* DokenState.active;
  const now = yield* DateTime.now;

  const latestTtl = Doken.ttl(latest, now);
  const activeTtl = Doken.ttl(active, now);

  if (activeTtl) {
    if (!latestTtl) {
      return yield* DokenState.finish(active!);
    }
    return yield* pipe(
      DiscordDOM.discard(latest),
      E.tap(DokenState.finish(active!)),
      E.uninterruptible,
    );
  }
  if (!latestTtl) {
    return yield* new DokenDefect({cause: new Error('Latest token expired')});
  }
  return yield* pipe(
    DiscordDOM.deferUpdate(latest),
    E.tap(DokenState.finish(Doken.active(latest))),
    armTiming(latestTtl),
  );
});

const armSource = E.gen(function* () {
  if (yield* isTimingArmed) {
    yield* disarmJoinTiming;
  }
  if (yield* isDone) {
    return yield* new DokenDefect({cause: new Error('Interaction already finished')});
  }
  const latest = yield* DokenState.latest;
  const now = yield* DateTime.now;
  const freshTtl = Doken.ttl(latest, now);

  yield* DokenState.update(Doken.source(latest));

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
  if (yield* isTimingArmed) {
    yield* disarmJoinTiming;
  }
  if (yield* isDone) {
    return yield* new DokenDefect({cause: new Error('Interaction already finished')});
  }
  const latest = yield* DokenState.latest;
  const now = yield* DateTime.now;
  const freshTtl = Doken.ttl(latest, now);

  yield* DokenState.update(Doken.update(latest));

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

const listen = (rx: Rx.Request) => E.gen(function* () {
  let isSame = false;
  let isNext = false;

  const body = (p: Progress.Progress) => E.suspend(() => {
    if (Progress.isExit(p)) {
      return armExit;
    }
    if (Progress.isSame(p)) {
      isSame = true;
      return armReuse;
    }
    if (Progress.isNext(p)) {
      isNext = true;
      return disarmJoinTiming;
    }
    if (Progress.isPart(p)) {
      if (isSame) {
        return disarmJoinTiming;
      }
      if (isNext) {
        if (p.type === 'modal') {
          return pipe(
            disarmJoinTiming,
            E.andThen(DokenState.latest),
            E.andThen(Doken.modal),
            E.flatMap(DokenState.finish),
          );
        }
        if (p.type === 'message') {
          return rx.isEphemeral ? armSource : armUpdate;
        }
        if (p.type === 'ephemeral') {
          return rx.isEphemeral ? armUpdate : armSource;
        }
      }
    }
    return E.void;
  });

  const dom = yield* RehydrantDOM;
  const listen = dom.listen.pipe(E.orElseSucceed(Progress.done));

  const initial = yield* listen;
  yield* E.iterate(initial, {
    while: (p) => !Progress.isDone(p),
    body : (p) => body(p).pipe(E.andThen(listen)),
  });
});

export const respond = E.fnUntraced(
  function* (body: unknown) {
    const req = yield* DokenState.rx;

    const listener = yield* E.fork(listen(req));
    const invoking = yield* E.fork(Model.invokeRoot(req.hydrator!, req.event, body));

    yield* Fiber.join(listener);
    const root = yield* Fiber.join(invoking);

    if (!root) {
      return null;
    }

    const now = yield* DateTime.now;
    const isDeferPhase = Doken.ttl(req.fresh, now);

    if (isDeferPhase) {
      const doken = yield* DokenState.result;

      if (!Doken.isActive(doken)) {
        return yield* new DokenDefect({cause: new Error('Inactive token')});
      }
      if (!Doken.ttl(doken, now)) {
        return yield* new DokenDefect({cause: new Error('Expired token')});
      }
      const payload = yield* Codec.encodeResponse({
        base    : 'https://dffp.org',
        doken   : doken,
        encoding: root as any,
      });
      yield* DiscordDOM.deferEdit(doken, payload);
      return payload;
    }

    yield* disarmJoinTiming;
    const doken = yield* DokenState.synced;

    if (!Doken.ttl(doken, now)) {
      return yield* new DokenDefect({cause: new Error('Expired token')});
    }

    if (Doken.isActive(doken)) {
      const payload = yield* Codec.encodeResponse({
        base    : 'https://dffp.org',
        doken   : doken,
        encoding: root as any,
      });
      yield* DiscordDOM.deferEdit(doken, payload);
      return payload;
    }

    const payload = yield* Codec.encodeResponse({
      base    : 'https://dffp.org',
      doken   : Doken.convertSerial(doken),
      encoding: root as any,
    });

    if (Doken.isModal(doken)) {
      yield* DiscordDOM.createModal(doken, payload);
      return payload;
    }
    if (Doken.isSource(doken)) {
      yield* DiscordDOM.createSource(doken, payload);
      return payload;
    }
    if (Doken.isUpdate(doken)) {
      yield* DiscordDOM.createUpdate(doken, payload);
      return payload;
    }
    return null;
  },
  (effect, body) => E.provide(effect, [DokenState.Fresh(body), RehydrantDOM.Fresh]),
);

// export const respond = ({req, body}: thing) => E.gen(function* () {
//   const listener = yield* E.fork(listen(req));
//   const invoking = yield* E.fork(Model.invokeRoot(req.hydrator!, req.event, body));
//
//   yield* Fiber.join(listener);
//   const root = yield* Fiber.join(invoking);
//
//   if (!root) {
//     return null;
//   }
//
//   const isDeferPhase = yield* DateTime.isPast(req.fresh.ttl);
//
//   if (isDeferPhase) {
//     const doken = yield* DokenState.result;
//
//     if (Doken.isNever(doken)) {
//       return yield* E.fail(new Error('Never token found.'));
//     }
//
//     const payload = yield* Codec.encodeResponse({
//       base    : 'https://dffp.org',
//       doken   : Doken.convertSerial(doken),
//       encoding: root as any,
//     });
//     yield* DiscordDOM.deferEdit(doken, payload);
//     return payload;
//   }
//
//   yield* disarmJoinTiming;
//   const doken = yield* DokenState.synced;
//
//   if (Doken.isActive(doken)) {
//     const payload = yield* Codec.encodeResponse({
//       base    : 'https://dffp.org',
//       doken   : doken,
//       encoding: root as any,
//     });
//     yield* DiscordDOM.deferEdit(doken, payload);
//     return payload;
//   }
//
//   const payload = yield* Codec.encodeResponse({
//     base    : 'https://dffp.org',
//     doken   : Doken.convertSerial(doken),
//     encoding: root as any,
//   });
//
//   if (Doken.isModal(doken)) {
//     yield* DiscordDOM.createModal(doken, payload);
//     return payload;
//   }
//   if (Doken.isSource(doken)) {
//     yield* DiscordDOM.createSource(doken, payload);
//     return payload;
//   }
//   if (Doken.isUpdate(doken)) {
//     yield* DiscordDOM.createUpdate(doken, payload);
//     return payload;
//   }
//   return null;
// });

// export const respondv1 = (body: any) => E.gen(function* () {
//   const codec = yield* Codec;
//   const req = codec.decodeRequest(body);
//
//   const ds = yield* Dokens.make(req.fresh, req.doken);
//
//   const model = yield* E.fork(Model.invokeRoot(req.hydrator!, req.event, body));
//
//   let isSame = false;
//
//   const relay = yield* Relay;
//   const thing = yield* E.fork(E.iterate(Progress.Start(), {
//     while: (r) => r._tag !== 'Done',
//     body : () => E.tap(relay.awaitStatus, (r) => {
//       if (r._tag === 'Close') {
//         return handleClose(ds);
//       }
//       if (r._tag === 'Same') {
//         isSame = true;
//         return handleSame(ds);
//       }
//       if (r._tag === 'Part') {
//         if (isSame) {
//           return E.void;
//         }
//         if (r.type === 'modal') {
//           return Dokens.finalizeModal(ds);
//         }
//         if (r.isEphemeral === req.isEphemeral) {
//           return handleUpdate(ds);
//         }
//         return handleSource(ds);
//       }
//     }),
//   }));
//
//   const root = yield* Fiber.join(model);
//   yield* Fiber.await(thing);
//
//   if (!root) {
//     return null;
//   }
//
//   const isDeferPhase = yield* DateTime.isPast(req.fresh.ttl);
//   const dom = yield* DiscordDOM;
//
//   if (isDeferPhase) {
//     const doken = yield* Dokens.final(ds);
//
//     if (Doken.isNever(doken)) {
//       return yield* E.fail(new Error('Never token found.'));
//     }
//     const payload = codec.encodeResponse({
//       base    : 'https://dffp.org',
//       doken   : doken,
//       encoding: root as any,
//     });
//     yield* dom.deferEdit(doken, payload);
//     return payload;
//   }
//
//   yield* Dokens.stop(ds);
//   const doken = yield* Dokens.current(ds);
//
//   if (doken._tag === Doken.ACTIVE) {
//     const payload = codec.encodeResponse({
//       base    : 'https://dffp.org',
//       doken   : doken,
//       encoding: root as any,
//     });
//     yield* dom.deferEdit(doken, payload);
//     return payload;
//   }
//
//   const payload = codec.encodeResponse({
//     base    : 'https://dffp.org',
//     doken   : Doken.convertSerial(doken),
//     encoding: root as any,
//   });
//
//   if (Doken.isModal(doken)) {
//     yield* dom.createModal(doken, payload);
//     return payload;
//   }
//   if (Doken.isSource(doken)) {
//     yield* dom.createSource(doken, payload);
//     return payload;
//   }
//   if (Doken.isUpdate(doken)) {
//     yield* dom.createUpdate(doken, payload);
//     return payload;
//   }
//   return null;
// });

// const dismount = DokenState.use((ds) => pipe(
//   disarm,
//   E.whenEffect(isArmed),
//   E.andThen(
//     E.all(
//       [
//         ds.active.pipe(pollDeferred),
//         ds.current,
//         ds.final.pipe(pollDeferred),
//       ],
//       {concurrency: 1},
//     ),
//   ),
//   E.tap(([, current, final]) =>
//     ds.finalize(current).pipe(E.unless(() => !!final)),
//   ),
//   E.tap(([active, current, final]) => {
//     if (Doken.isNever(current)) {
//       return E.void;
//     }
//     if (final) {
//       return DiscordDOM.dismount(final);
//     }
//     if (Doken.isActive(current)) {
//       return DiscordDOM.dismount(current);
//     }
//     if (active) {
//       return DiscordDOM.dismount(active);
//     }
//     if (Doken.isLatest(current)) {
//       return E.andThen(
//         DiscordDOM.deferUpdate(current),
//         DiscordDOM.dismount(current),
//       );
//     }
//     return new DokenDefect({cause: new Error('No tokens available to dismount')});
//   }),
// ));
