import {Defer} from '#src/disreact/codec/dapi/callback-type.ts';
import {Doken} from '#src/disreact/codec/doken.ts';
import {Relay} from '#src/disreact/model/Relay.ts';
import type {Dokens} from '#src/disreact/runtime/dokens.ts';
import {handleClose, handleSame, handleSource, handleUpdate} from '#src/disreact/runtime/utils.ts';
import {DisReactDOM} from '#src/disreact/utils/DisReactDOM.ts';
import {DokenMemory} from '#src/disreact/utils/DokenMemory.ts';
import {DateTime, Deferred, Duration, Either, Fiber, FiberHandle, type Mailbox, SynchronizedRef} from 'effect';
import {Misc} from '../utils/misc.ts';
import {E, L, pipe} from '../utils/re-exports.ts';

const resolveActive = (fresh: Doken.Fresh, serial?: Doken.Serial) => {
  if (!serial || Doken.isSingle(serial)) {
    return E.succeed(undefined);
  }

  return pipe(
    DateTime.isPast(serial.ttl),
    E.flatMap((isPast) => {
      if (isPast) {
        return E.succeed(undefined);
      }
      if (serial._tag === 'Active') {
        serial.app = fresh.app;
        return E.succeed(serial);
      }
      return pipe(
        E.flatMap(DokenMemory, (memory) => memory.load(serial.id)),
        E.orElseSucceed(() => undefined),
        E.timeoutTo({
          duration : Duration.seconds(1),
          onTimeout: () => undefined,
          onSuccess: (cached) => {
            if (!cached) {
              return cached;
            }
            cached.app = fresh.app;
            return cached;
          },
        }),
      );
    }),
  );
};

const make = E.gen(function* () {
  const active = yield* Deferred.make<Doken | undefined>();
  const final = yield* Deferred.make<Doken>();
  const current = yield* SynchronizedRef.make<Doken>(Doken.synthetic());

  let fresh: Doken.Fresh = {};

  const handle = yield* FiberHandle.make();

  const handleClose = pipe(
    FiberHandle.clear(handle),
    E.zipRight(E.all([
      Misc.pollDeferred(active),
      SynchronizedRef.get(current),
      Misc.pollDeferred(final),
    ])),
    E.tap(() => Deferred.succeed(final, Doken.never())),
    E.tap(([active, current, final]) => {
      if (Doken.isNever(current)) {
        return E.void;
      }
      if (final) {
        return DisReactDOM.dismount(final);
      }
      if (Doken.isActive(current)) {
        return DisReactDOM.dismount(current);
      }
      if (active) {
        return DisReactDOM.dismount(active);
      }
      if (Doken.isFresh(current)) {
        return pipe(
          DisReactDOM.deferUpdate(current),
          E.tap(() => DisReactDOM.dismount(current)),
        );
      }
    }),
    FiberHandle.run(handle),
  );

  const handleSame = pipe(
    FiberHandle.clear(handle),
    E.flatMap(() =>
      E.all([
        Deferred.await(active),
        DateTime.now,
      ]),
    ),
    E.flatMap(([active, now]) => {
      const freshLeft = DateTime.distanceDurationEither(now, fresh.ttl).pipe(Either.getOrUndefined);

      const activeLeft = active
        ? DateTime.distanceDurationEither(now, active.ttl).pipe(Either.getOrUndefined)
        : undefined;

      if (activeLeft && !freshLeft) {
        return Deferred.succeed(final, active!);
      }

      if (!activeLeft && freshLeft) {
        return pipe(
          SynchronizedRef.set(current, Doken.update(fresh)),
          E.tap(() =>
            pipe(
              DisReactDOM.deferUpdate(fresh),
              E.tap(() => Deferred.succeed(final, Doken.active(fresh))),
              E.delay(freshLeft),
              FiberHandle.run(handle),
            ),
          ),
        );
      }

      return pipe(
        DisReactDOM.discard(fresh),
        E.flatMap(() => Deferred.succeed(final, active!)),
      );
    }),
  );

   const handleSource = pipe(
      FiberHandle.clear(handle),
      E.tap(() => SynchronizedRef.set(current, Doken.source(fresh))),
      E.flatMap(() => DateTime.now),
      E.tap((now) =>
        pipe(
          DateTime.distanceDurationEither(now, fresh.ttl),
          Either.map((delay) =>
            pipe(
              E.tap(DisReactDOM, (dom) => dom.deferSource(fresh)),
              E.tap(() => Deferred.succeed(final, Doken.active(fresh))),
              E.delay(delay),
              FiberHandle.run(handle),
            ),
          ),
          Either.getOrElse(() =>
            pipe(
              E.tap(DisReactDOM, (dom) => dom.deferUpdate(fresh)),
              E.tap(() => Deferred.succeed(final, Doken.active(fresh))),
            ),
          ),
        ),
      ),
      E.whenEffect(
        Misc.pollDeferred(active).pipe(E.map((deferred) => !deferred)),
      ),
    );

   const handleUpdate = pipe(
     FiberHandle.clear(handle),
      E.tap(() => SynchronizedRef.set(current, Doken.update(fresh))),
      E.flatMap(() => DateTime.now),
      E.tap((now) =>
        pipe(
          DateTime.distanceDurationEither(now, fresh.ttl),
          Either.map((delay) =>
            pipe(
              E.tap(DisReactDOM, (dom) => dom.deferUpdate(fresh)),
              E.tap(() => Deferred.succeed(final, Doken.active(fresh))),
              E.delay(delay),
              FiberHandle.run(handle),
            ),
          ),
          Either.getOrElse(() =>
            pipe(
              E.tap(DisReactDOM, (dom) => dom.deferUpdate(fresh)),
              E.tap(() => Deferred.succeed(final, Doken.active(fresh))),
            ),
          ),
        ),
      ),
      E.whenEffect(
        Misc.pollDeferred(active).pipe(E.map((deferred) => !deferred)),
      ),
    );

  let done = false;

  let request: any;

  return {
    current: SynchronizedRef.get(current),
    final  : Deferred.await(final),

    init: (req: any) => {
      fresh = req.fresh;
      request = req;
      return pipe(
        resolveActive(fresh, req.serial),
        E.tap((serial) => Deferred.succeed(active, serial)),
        E.fork,
      );
    },

    listen: (mailbox: Mailbox.Mailbox<Relay.Progress>) =>
      E.whileLoop({
        while: () => !done,
        step : () => {},
        body : () => E.tap(mailbox.take.pipe(E.catchTag('NoSuchElementException', () => E.succeed(Relay.Progress.Done()))), (r) => {
          if (r._tag === 'Close') {
            done = true;
            return handleClose;
          }
          if (r._tag === 'Same') {
            done = true;
            return handleSame;
          }
          if (r._tag === 'Part') {
            done = true;
            if (r.type === 'modal') {
              return pipe(
                Deferred.succeed(final, Doken.modal(fresh)),
                E.tap(() => SynchronizedRef.set(current, Doken.modal(fresh))),
              );
            }
            if (r.isEphemeral === request.isEphemeral) {
              return handleUpdate;
            }
            return handleSource;
          }
        }),
      }),

  };
});

export class DokenManager extends E.Service<DokenManager>()('disreact/DokenManager', {
  scoped   : make,
  accessors: true,
}) {
  static readonly Fresh = L.fresh(this.Default);
}
