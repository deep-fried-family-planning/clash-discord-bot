import {Doken, DokenDefect} from '#src/disreact/codec/rest/doken.ts';
import {DiscordDOM} from '#src/disreact/runtime/DiscordDOM.ts';
import {Dokensz} from '#src/disreact/runtime/dokensz.ts';
import * as DateTime from 'effect/DateTime';
import * as E from 'effect/Effect';
import * as Either from 'effect/Either';
import * as Fiber from 'effect/Fiber';
import {pipe} from 'effect/Function';
import * as SynchronizedRef from 'effect/SynchronizedRef';
import {Misc} from '../utils/misc';

export const handleSame = (ds: Dokensz) =>
  pipe(
    Dokensz.stop(ds),
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
        return Dokensz.finalize(ds, active!);
      }

      if (!activeLeft && freshLeft) {
        return pipe(
          Dokensz.set(ds, Doken.update(ds.fresh)),
          E.tap(() =>
            pipe(
              E.tap(DiscordDOM, (dom) => dom.deferUpdate(ds.fresh)),
              Dokensz.finalizeWith(ds),
              Dokensz.fiber(ds),
              E.delay(freshLeft),
            ),
          ),
        );
      }

      return pipe(
        E.tap(DiscordDOM, (dom) => dom.discard(ds.fresh)),
        Dokensz.finalizeWith(ds, active!),
      );
    }),
  );

export const handleClose = (ds: Dokensz) =>
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
        return DiscordDOM.dismount(final);
      }
      if (Doken.isActive(current)) {
        return DiscordDOM.dismount(current);
      }
      if (active) {
        return DiscordDOM.dismount(active);
      }
      if (Doken.isLatest(current)) {
        return pipe(
          DiscordDOM.deferUpdate(current),
          E.tap(() => DiscordDOM.dismount(current)),
        );
      }
      return new DokenDefect({msg: 'No tokens available to dismount.'});
    }),
  );

export const handleSource = (ds: Dokensz) =>
  pipe(
    Dokens.stop(ds),
    E.tap(() => Dokens.set(ds, Doken.source(ds.fresh))),
    E.flatMap(() => DateTime.now),
    E.tap((now) =>
      pipe(
        DateTime.distanceDurationEither(now, ds.fresh.ttl),
        Either.map((delay) =>
          pipe(
            E.tap(DiscordDOM, (dom) => dom.deferSource(ds.fresh)),
            Dokens.finalizeWith(ds),
            E.delay(delay),
            Dokens.fiber(ds),
          ),
        ),
        Either.getOrElse(() =>
          pipe(
            E.tap(DiscordDOM, (dom) => dom.deferUpdate(ds.fresh)),
            Dokens.finalizeWith(ds),
          ),
        ),
      ),
    ),
  );

export const handleUpdate = (ds: Dokensz) =>
  pipe(
    Dokens.stop(ds),
    E.tap(() => Dokens.set(ds, Doken.update(ds.fresh))),
    E.flatMap(() => DateTime.now),
    E.tap((now) =>
      pipe(
        DateTime.distanceDurationEither(now, ds.fresh.ttl),
        Either.map((delay) =>
          pipe(
            E.tap(DiscordDOM, (dom) => dom.deferUpdate(ds.fresh)),
            Dokens.finalizeWith(ds),
            E.delay(delay),
            Dokens.fiber(ds),
          ),
        ),
        Either.getOrElse(() =>
          pipe(
            E.tap(DiscordDOM, (dom) => dom.deferUpdate(ds.fresh)),
            Dokens.finalizeWith(ds),
          ),
        ),
      ),
    ),
  );
