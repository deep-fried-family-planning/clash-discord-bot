import {Codec} from '#src/disreact/codec/Codec.ts';
import * as Doken from '#src/disreact/codec/doken.ts';
import type {DokenCacheDefect} from '#src/disreact/adaptor/DokenCache.ts';
import {DokenCache} from '#src/disreact/adaptor/DokenCache.ts';
import type {HttpClientError} from '@effect/platform/HttpClientError';
import type {TimeoutException} from 'effect/Cause';
import * as Data from 'effect/Data';
import type * as DateTime from 'effect/DateTime';
import * as Deferred from 'effect/Deferred';
import * as Duration from 'effect/Duration';
import * as E from 'effect/Effect';
import * as FiberHandle from 'effect/FiberHandle';
import {flow, pipe} from 'effect/Function';
import * as L from 'effect/Layer';
import * as SynchronizedRef from 'effect/SynchronizedRef';

export class DokenDefect extends Data.TaggedError('DokenDefect')<{
  utc    : DateTime.Utc;
  latest?: Doken.Latest | undefined;
  synced?: Doken.Doken | undefined;
  active?: Doken.Active | undefined;
  result?: Doken.Doken | undefined;
  cause? : any;
}> {}

export class DokenState extends E.Service<DokenState>()('disreact/DokenState', {
  scoped: E.fn('DokenState')(function* (init: any) {
    const rx = yield* Codec.decodeRequest(init);
    const latest = rx.fresh;
    const serial = rx.doken;

    yield* E.logTrace('latest', latest);

    const synced = yield* SynchronizedRef.make<Doken.Doken>(latest);
    const active = yield* Deferred.make<Doken.Active | undefined, DokenCacheDefect | TimeoutException>();
    const result = yield* Deferred.make<Doken.Doken>();
    const timing = yield* FiberHandle.make<void, HttpClientError | DokenDefect | DokenCacheDefect>();

    if (!serial) {
      yield* pipe(
        Deferred.succeed(active, undefined),
        E.tap(E.logTrace('no serial')),
      );
    }
    else if (Doken.isSingle(serial)) {
      yield* pipe(
        Deferred.succeed(active, undefined),
        E.tap(() => E.logTrace('single', serial)),
      );
    }
    else if (Doken.isActive(serial)) {
      serial.app = latest.app;
      yield* pipe(
        SynchronizedRef.setAndGet(synced, serial) as E.Effect<Doken.Active>,
        E.intoDeferred(active),
        E.tap(() => E.logTrace('active', serial)),
      );
    }
    else {
      yield* pipe(
        E.logTrace('cache load', serial.id),
        E.andThen(DokenCache.load(serial.id)),
        E.timeout(Duration.seconds(1)),
        E.tap((cached) => {
          if (cached) {
            cached.app = latest.app;
          }
          return E.logTrace('cache result', cached);
        }),
        E.intoDeferred(active),
        FiberHandle.run(timing, {
          propagateInterruption: true,
          onlyIfMissing        : false,
        }),
      );
    }

    return {
      rx,
      latest: E.succeed(rx.fresh),
      synced: synced.get,
      sync  : (dk: Doken.Doken) => SynchronizedRef.setAndGet(synced, dk).pipe(E.tap(() => E.logTrace('update', dk))),
      active: active,
      result: result,
      finish: (dk: Doken.Doken) => SynchronizedRef.setAndGet(synced, dk).pipe(E.intoDeferred(result), E.tap(() => E.logTrace('finish', dk))),
      timing: timing,
    };
  }),
  accessors: true,
}) {
  static readonly Fresh = flow(this.Default, L.fresh);
}
