import {Codec} from '#src/disreact/codec/Codec.ts';
import * as Doken from '#src/disreact/codec/rest/doken.ts';
import type {DokenMemoryError} from '#src/disreact/runtime/DokenMemory.ts';
import {DokenMemory} from '#src/disreact/runtime/DokenMemory.ts';
import type {HttpClientError} from '@effect/platform/HttpClientError';
import type {TimeoutException} from 'effect/Cause';
import * as Data from 'effect/Data';
import * as Deferred from 'effect/Deferred';
import * as Duration from 'effect/Duration';
import * as E from 'effect/Effect';
import * as FiberHandle from 'effect/FiberHandle';
import {flow, pipe} from 'effect/Function';
import * as L from 'effect/Layer';
import * as SynchronizedRef from 'effect/SynchronizedRef';

export class DokenDefect extends Data.TaggedError('DokenDefect')<{
  cause?: any;
}> {}

export class DokenState extends E.Service<DokenState>()('disreact/DokenState', {
  scoped: E.fnUntraced(function* (init: any) {
    const rx = yield* Codec.decodeRequest(init);
    const latest = structuredClone(rx.fresh);
    const serial = structuredClone(rx.doken);
    const synced = yield* SynchronizedRef.make<Doken.Doken>(latest);
    const active = yield* Deferred.make<Doken.Active | undefined, DokenMemoryError | TimeoutException>();
    const result = yield* Deferred.make<Doken.Doken>();
    const timing = yield* FiberHandle.make<void, HttpClientError | DokenDefect>();

    if (!serial || Doken.isSingle(serial)) {
      yield* Deferred.succeed(active, undefined);
    }
    else if (Doken.isActive(serial)) {
      serial.app = latest.app;
      yield* pipe(
        SynchronizedRef.setAndGet(synced, serial) as E.Effect<Doken.Active>,
        E.intoDeferred(active),
      );
    }
    else {
      yield* pipe(
        DokenMemory.load(serial.id),
        E.timeout(Duration.seconds(1)),
        E.tap((cached) => cached ? cached.app = latest.app : undefined),
        E.intoDeferred(active),
        E.tapDefect(E.logFatal),
        E.fork,
      );
    }

    return {
      rx,
      latest: E.succeed(init.latest),
      synced: synced.get,
      update: (dk: Doken.Doken) => SynchronizedRef.setAndGet(synced, dk),
      active: active,
      result: result,
      finish: (dk: Doken.Doken) => SynchronizedRef.setAndGet(synced, dk).pipe(E.intoDeferred(result)),
      timing: timing,
    };
  }),
  accessors: true,
}) {
  static readonly Fresh = flow(this.Default, L.fresh);
}
