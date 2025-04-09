import {Doken, DokenDefect} from '#src/disreact/codec/doken.ts';
import {DisReactDOM} from '#src/disreact/runtime/DisReactDOM.ts';
import {Dokens} from '#src/disreact/runtime/dokens.ts';
import {E, pipe} from '#src/disreact/utils/re-exports.ts';
import {DateTime, Either, Fiber, SynchronizedRef} from 'effect';
import {Misc} from '../utils/misc';

export const handleSame = (ds: Dokens) =>
  pipe(
    Dokens.stop(ds),
    E.flatMap(() =>
      E.all([
        Fiber.join(ds.active),
        DateTime.now,
      ]),
    ),
    E.flatMap(([active, now]) => {
      const freshLeft = DateTime.distanceDurationEither(now, ds.fresh.ttl).pipe(Either.getOrUndefined);

      const activeLeft = active
        ? DateTime.distanceDurationEither(now, active.ttl).pipe(Either.getOrUndefined)
        : undefined;

      if (activeLeft && !freshLeft) {
        return Dokens.finalize(ds, active!);
      }

      if (!activeLeft && freshLeft) {
        return pipe(
          Dokens.set(ds, Doken.update(ds.fresh)),
          E.tap(() =>
            pipe(
              E.tap(DisReactDOM, (dom) => dom.deferUpdate(ds.fresh)),
              Dokens.finalizeWith(ds),
              E.delay(freshLeft),
              Dokens.fiber(ds),
            ),
          ),
        );
      }

      return pipe(
        E.tap(DisReactDOM, (dom) => dom.discard(ds.fresh)),
        Dokens.finalizeWith(ds, active!),
      );
    }),
  );

export const handleClose = (ds: Dokens) =>
  pipe(
    Dokens.stop(ds),
    E.flatMap(() =>
      E.all([
        Misc.pollFiber(ds.active),
        SynchronizedRef.get(ds.current),
        Misc.pollDeferred(ds.deferred),
      ]),
    ),
    E.tap(() => Dokens.finalize(ds, Doken.never())),
    E.tap(([active, current, final]) => {
      if (Doken.isNever(current)) {
        return E.void;
      }
      if (final) {
        return E.tap(DisReactDOM, (dom) => dom.dismount(final));
      }
      if (Doken.isActive(current)) {
        return E.tap(DisReactDOM, (dom) => dom.dismount(current));
      }
      if (active) {
        return E.tap(DisReactDOM, (dom) => dom.dismount(active));
      }
      if (Doken.isFresh(current)) {
        return pipe(
          DisReactDOM,
          E.tap((dom) => dom.deferUpdate(current)),
          E.tap((dom) => dom.dismount(current)),
        );
      }
      return new DokenDefect({msg: 'No tokens available to dismount.'});
    }),
  );

export const handleSource = (ds: Dokens) =>
  pipe(
    Dokens.stop(ds),
    E.tap(() => Dokens.set(ds, Doken.source(ds.fresh))),
    E.flatMap(() => DateTime.now),
    E.tap((now) =>
      pipe(
        DateTime.distanceDurationEither(now, ds.fresh.ttl),
        Either.map((delay) =>
          pipe(
            E.tap(DisReactDOM, (dom) => dom.deferSource(ds.fresh)),
            Dokens.finalizeWith(ds),
            E.delay(delay),
            Dokens.fiber(ds),
          ),
        ),
        Either.getOrElse(() =>
          pipe(
            E.tap(DisReactDOM, (dom) => dom.deferUpdate(ds.fresh)),
            Dokens.finalizeWith(ds),
          ),
        ),
      ),
    ),
    E.whenEffect(
      Misc.pollDeferred(ds.deferred).pipe(E.map((deferred) => !deferred)),
    ),
  );

export const handleUpdate = (ds: Dokens) =>
  pipe(
    Dokens.stop(ds),
    E.tap(() => Dokens.set(ds, Doken.update(ds.fresh))),
    E.flatMap(() => DateTime.now),
    E.tap((now) =>
      pipe(
        DateTime.distanceDurationEither(now, ds.fresh.ttl),
        Either.map((delay) =>
          pipe(
            E.tap(DisReactDOM, (dom) => dom.deferUpdate(ds.fresh)),
            Dokens.finalizeWith(ds),
            E.delay(delay),
            Dokens.fiber(ds),
          ),
        ),
        Either.getOrElse(() =>
          pipe(
            E.tap(DisReactDOM, (dom) => dom.deferUpdate(ds.fresh)),
            Dokens.finalizeWith(ds),
          ),
        ),
      ),
    ),
    E.whenEffect(
      Misc.pollDeferred(ds.deferred).pipe(E.map((deferred) => !deferred)),
    ),
  );
