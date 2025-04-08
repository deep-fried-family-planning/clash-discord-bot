import {Doken} from '#src/disreact/codec/doken.ts';
import {DokenMemory} from '#src/disreact/codec/DokenMemory.ts';
import {DisReactDOM} from '#src/disreact/runtime/DisReactDOM.ts';
import {Misc} from '#src/disreact/utils/misc.ts';
import {E, flow, pipe} from '#src/disreact/utils/re-exports.ts';
import {DateTime, Deferred, Duration, Either, Fiber, FiberHandle, Schedule, type Scope, SynchronizedRef} from 'effect';
import console from 'node:console';

export * as Dokens from '#src/disreact/runtime/dokens.ts';
export type Dokens = {
  fresh  : Doken.Fresh;
  active : Deferred.Deferred<Doken.Active | undefined>;
  final  : Deferred.Deferred<Doken.Active>;
  timeout: FiberHandle.FiberHandle;
  current: SynchronizedRef.SynchronizedRef<Doken>;
};

export const make = (fresh: Doken.Fresh): E.Effect<Dokens, never, Scope.Scope> =>
  E.all({
    fresh  : E.succeed(fresh),
    active : Deferred.make<Doken.Active | undefined>(),
    final  : Deferred.make<Doken.Active>(),
    timeout: FiberHandle.make(),
    current: SynchronizedRef.make<Doken>(fresh),
  });

export const getCurrent = (d: Dokens) =>
  SynchronizedRef.get(d.current);

export const currentModal = (d: Dokens) =>
  SynchronizedRef.set(d.current, Doken.makeModal(d.fresh));

export const currentSource = (d: Dokens) =>
  SynchronizedRef.set(d.current, Doken.makeSource(d.fresh));

export const currentUpdate = (d: Dokens) =>
  SynchronizedRef.set(d.current, Doken.makeUpdate(d.fresh));

export const currentActive = (d: Dokens, active: Doken.Active) =>
  SynchronizedRef.set(d.current, active);

export const awaitFinal = (d: Dokens) => Deferred.await(d.final);

export const setFinal = (d: Dokens, final: Doken.Active) => Deferred.succeed(d.final, final);

export const pollFinal = (d: Dokens) => Misc.pollDeferred(d.final);

export const finalActive = (d: Dokens) => Deferred.succeed(d.final, Doken.makeActive(d.fresh));

export const awaitActive = (d: Dokens) => Deferred.await(d.active);

export const resolveActive = (d: Dokens, active: Doken.Serial | undefined) => {
  if (!active || active._tag === Doken.SINGLE) {
    return Deferred.succeed(d.active, undefined);
  }

  if (active._tag === Doken.ACTIVE) {
    return E.flatMap(DateTime.isPast(active.ttl), (isPast) => {
      if (isPast) {
        return Deferred.succeed(d.active, undefined);
      }
      active.app = d.fresh.app;
      return Deferred.succeed(d.active, active);
    });
  }

  return E.flatMap(DateTime.isPast(active.ttl), (isPast) => {
    if (isPast) {
      return Deferred.succeed(d.active, undefined);
    }
    return pipe(
      E.flatMap(DokenMemory, (memory) => memory.load(active.id)),
      E.timeoutTo({
        duration : Duration.seconds(1),
        onSuccess: (cached) => cached,
        onTimeout: () => undefined,
      }),
      E.flatMap((cached) => {
        if (!cached) {
          return Deferred.succeed(d.active, undefined);
        }
        cached.app = d.fresh.app;
        return Deferred.succeed(d.active, cached);
      }),
    );
  });
};

export const disengageTimeout = (d: Dokens) => FiberHandle.clear(d.timeout);

export const handleClose = (d: Dokens) => E.zipRight(
  disengageTimeout(d),
  pipe(
    E.all([
      DisReactDOM,
      awaitActive(d),
      pollFinal(d),
    ]),
    E.flatMap(([dom, active, final]) => {
      if (final?._tag === 'Active') {
        return dom.dismount(final);
      }
      if (active) {
        return dom.dismount(active);
      }
      return pipe(
        dom.deferUpdate(d.fresh),
        E.flatMap(() => dom.dismount(d.fresh)),
      );
    }),
  ),
);

export const engageDeferSource = (d: Dokens) => E.zipRight(
  disengageTimeout(d),
  E.tap(DateTime.now, (now) =>
    pipe(
      DateTime.distanceDurationEither(now, d.fresh.ttl),
      Either.map((time) =>
        pipe(
          E.tap(DisReactDOM, (dom) => dom.deferSource(d.fresh)),
          E.tap(() => finalActive(d)),
          E.schedule(Schedule.fromDelay(time).pipe(Schedule.asVoid)),
          FiberHandle.run(d.timeout),
        ),
      ),
      Either.getOrElse(() =>
        pipe(
          E.tap(DisReactDOM, (dom) => dom.deferSource(d.fresh)),
          E.tap(() => finalActive(d)),
        ),
      ),
    ),
  ),
);

export const engageDeferUpdate = (d: Dokens) => E.zipRight(
  disengageTimeout(d),
  E.tap(DateTime.now, (now) =>
    pipe(
      DateTime.distanceDurationEither(now, d.fresh.ttl),
      Either.map((time) =>
        pipe(
          E.tap(DisReactDOM, (dom) => dom.deferUpdate(d.fresh)),
          E.tap(() => finalActive(d)),
          E.schedule(Schedule.fromDelay(time).pipe(Schedule.asVoid)),
          FiberHandle.run(d.timeout),
        ),
      ),
      Either.getOrElse(() =>
        pipe(
          E.tap(DisReactDOM, (dom) => dom.deferUpdate(d.fresh)),
          E.tap(() => finalActive(d)),
        ),
      ),
    ),
  ),
);
