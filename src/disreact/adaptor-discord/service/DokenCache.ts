import * as Doken from '#disreact/adaptor-discord/core/Doken.ts';
import type * as Cause from 'effect/Cause';
import * as Cache from 'effect/Cache';
import * as Data from 'effect/Data';
import * as DateTime from 'effect/DateTime';
import * as Duration from 'effect/Duration';
import * as Effect from 'effect/Effect';
import * as Exit from 'effect/Exit';
import {pipe} from 'effect/Function';
import * as Option from 'effect/Option';

export class DokenCacheError extends Data.TaggedError('DokenCacheDefect')<{
  cause: Cause.Cause<Error> | Error;
}> {}

const timeToLive = (exit: Exit.Exit<Doken.Value, DokenCacheError>): Duration.Duration =>
  exit.pipe(
    Exit.getOrElse(() => undefined),
    Option.fromNullable,
    Option.flatMap((doken) =>
      pipe(
        Effect.runSync(DateTime.now),
        DateTime.distanceDurationEither(doken.until),
        Option.getRight,
      ),
    ),
    Option.getOrElse(() => Duration.zero),
  );

export type DokenCacheConfig = {
  capacity: number;
};

export class DokenCache extends Effect.Service<DokenCache>()('disreact/DokenCache', {
  effect: Effect.fnUntraced(function* (config: DokenCacheConfig) {
    const cache = yield* Cache.makeWith({
      timeToLive,
      capacity: config.capacity,
      lookup  : (_: string): Effect.Effect<Doken.Value, DokenCacheError> =>
        new DokenCacheError({
          cause: new Error('not cached'),
        }),
    });

    return {
      save: (doken: Doken.Defer): Effect.Effect<void, DokenCacheError> => {
        const exposed = Doken.toValue(doken);

        return cache.set(exposed.id, exposed);
      },
      load: (id: string): Effect.Effect<Doken.Value, DokenCacheError> => cache.get(id),
      free: (id: string): Effect.Effect<void, DokenCacheError> => cache.invalidate(id),
    };
  }),
  accessors: true,
}) {}
