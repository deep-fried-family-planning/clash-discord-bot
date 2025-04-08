import {Doken} from '#src/disreact/codec/doken.ts';
import {DokenMemory} from '#src/disreact/codec/DokenMemory.ts';
import {Relay} from '#src/disreact/model/Relay.ts';
import {DisReactDOM} from '#src/disreact/runtime/DisReactDOM.ts';
import {Misc} from '#src/disreact/utils/misc.ts';
import {E, pipe} from '#src/disreact/utils/re-exports.ts';
import {DateTime, Deferred, FiberHandle, Schedule, type Scope} from 'effect';

export * as Dokens from '#src/disreact/runtime/dokens.ts';
export type Dokens = {
  fresh   : Doken.Fresh;
  active  : Deferred.Deferred<Doken.Active | undefined>;
  final   : Deferred.Deferred<Doken.Active | Doken.Fresh>;
  failsafe: FiberHandle.FiberHandle;
};

export const make = (fresh: Doken.Fresh): E.Effect<Dokens, never, Scope.Scope> =>
  pipe(
    E.all([
      Deferred.make<Doken.Active | undefined>(),
      Deferred.make<Doken.Active | Doken.Fresh>(),
      FiberHandle.make(),
    ]),
    E.map(([active, final, failsafe]) =>
      ({
        fresh,
        active,
        final,
        failsafe,
      }),
    ),
  );

export const resolveActive = (
  d: Dokens,
  active: Doken.Serial | undefined,
) => {
  if (!active || active._tag === Doken.SINGLE) {
    return Deferred.succeed(d.active, undefined);
  }

  if (active._tag === Doken.ACTIVE) {
    return pipe(
      DateTime.isPast(active.ttl),
      E.if({
        onTrue : () => Deferred.succeed(d.active, undefined),
        onFalse: () => Deferred.succeed(d.active, active),
      }),
    );
  }

  return pipe(
    E.flatMap(DokenMemory, (memory) => memory.load(active.id)),
    E.flatMap((cached) => {
      if (!cached) {
        return Deferred.succeed(d.active, undefined);
      }
      return pipe(
        DateTime.isPast(cached.ttl),
        E.if({
          onTrue : () => Deferred.succeed(d.active, undefined),
          onFalse: () => Deferred.succeed(d.active, cached),
        }),
      );
    }),
  );
};

export const awaitActive = (d: Dokens) => Deferred.await(d.active);

export const setFinal = (d: Dokens, final: Doken.Active | Doken.Fresh) => Deferred.succeed(d.final, final);

export const awaitFinal = (d: Dokens) => Deferred.await(d.final);

export const engageFailsafe = (d: Dokens, now: DateTime.Utc) =>
  pipe(
    E.all([
      Misc.pollDeferred(d.active),
      Misc.pollDeferred(d.final),
      E.flatMap(Relay, (relay) => relay.pollOutput()),
    ]),
    E.tap(([active, final, output]) => {
      if (!output) {
        return E.void;
      }
      if (final?._tag === 'Fresh') {
        return DisReactDOM.create(final.id, final.val, output);
      }
      if (!active) {
        return Deferred.succeed(d.final, d.fresh);
      }

      const doken = Doken.makeActive(d.fresh);

      return pipe(
        DisReactDOM.defer(doken.id, doken.val, {type: 7}),
        E.tap(Deferred.succeed(d.final, doken)),
      );
    }),
    E.schedule(
      Schedule.fromDelay(
        DateTime.distanceDuration(d.fresh.ttl, now),
      ),
    ),
    E.tap(() => FiberHandle.clear(d.failsafe)),
    FiberHandle.run(d.failsafe),
  );

export const disengageFailsafe = (d: Dokens) =>
  FiberHandle.clear(d.failsafe);

export const close = (d: Dokens) =>
  pipe(
    FiberHandle.clear(d.failsafe),
    E.flatMap(() =>
      E.all([
        Deferred.await(d.active),
        Misc.pollDeferred(d.final),
      ]),
    ),
    E.tap(([active, final]) => {
      if (final) {
        return DisReactDOM.dismount(d.fresh.app, final.val);
      }
      if (active) {
        return DisReactDOM.dismount(d.fresh.app, active.val);
      }
      return pipe(
        DisReactDOM.defer(d.fresh.id, d.fresh.val, {type: 7}),
        E.flatMap(() => DisReactDOM.dismount(d.fresh.app, d.fresh.val)),
      );
    }),
  );
