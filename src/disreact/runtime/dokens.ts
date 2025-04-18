import {Doken} from '#src/disreact/codec/doken.ts';
import type {DokenError} from '#src/disreact/utils/DokenMemory.ts';
import {DokenMemory} from '#src/disreact/utils/DokenMemory.ts';
import {E, pipe} from '#src/disreact/utils/re-exports.ts';
import type { FiberRef} from 'effect';
import {DateTime, Deferred, Duration, Fiber, FiberHandle, type Scope, SynchronizedRef} from 'effect';

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

export * as Dokens from '#src/disreact/runtime/dokens.ts';
export type Dokens = {
  fresh   : Doken.Fresh;
  active  : Fiber.Fiber<Doken.Active | undefined, DokenError>;
  current : SynchronizedRef.SynchronizedRef<Doken>;
  deferred: Deferred.Deferred<Doken.Active | Doken.Never>;
  handle  : Fiber.Fiber<any>;
};

export const make = (fresh: Doken.Fresh, serial?: Doken.Serial): E.Effect<Dokens, DokenError, DokenMemory> =>
  E.all({
    fresh   : E.succeed(fresh),
    active  : E.fork(resolveActive(fresh, serial)),
    current : SynchronizedRef.make<Doken>(fresh),
    deferred: Deferred.make<Doken.Active | Doken.Never>(),
    handle  : Fiber.void as Fiber.Fiber<any>,
  });

export const isDeferPhase = (ds: Dokens) => DateTime.isPast(ds.fresh.ttl);

export const current = (ds: Dokens) => SynchronizedRef.get(ds.current);

export const set = (ds: Dokens, next?: Doken) => SynchronizedRef.updateAndGet(ds.current, (prev) => {
  if (!next) {
    switch (prev._tag) {
      case Doken.FRESH:
        return Doken.active(prev);
      default:
        return prev;
    }
  }

  switch (prev._tag) {
    case Doken.NEVER:
    case Doken.SOURCE:
    case Doken.UPDATE:
    case Doken.MODAL:
      return prev;
    default:
      return next;
  }
});

export const final = (ds: Dokens) => Deferred.await(ds.deferred);

export const finalize = (ds: Dokens, next?: Doken.Active | Doken.Never) => {
  const doken = next ?? Doken.active(ds.fresh);

  return pipe(
    set(ds, doken),
    E.tap(() => Deferred.succeed(ds.deferred, doken)),
  );
};

export const finalizeModal = (ds: Dokens) => {
  return pipe(
    set(ds, Doken.modal(ds.fresh)),
    E.tap(() => Deferred.succeed(ds.deferred, Doken.never())),
  );
};

export const finalizeWith = <A, I, R>(ds: Dokens, next?: Doken.Active | Doken.Never) => (effect: E.Effect<A, I, R>) => {
  const doken = next ?? Doken.active(ds.fresh);

  return pipe(
    SynchronizedRef.update(ds.current, (prev) => {
      switch (prev._tag) {
        case Doken.NEVER:
        case Doken.SOURCE:
        case Doken.UPDATE:
        case Doken.MODAL:
          return prev;
        default:
          return doken;
      }
    }),
    E.tap(() => effect),
    E.tap(() => Deferred.succeed(ds.deferred, doken)),
  );
};

export const stop = (d: Dokens) => FiberHandle.clear(d.handle);

export const fiber = (d: Dokens) => FiberHandle.run(d.handle);

export const wait = (d: Dokens) => FiberHandle.awaitEmpty(d.handle);
