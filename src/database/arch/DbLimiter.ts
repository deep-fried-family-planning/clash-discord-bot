import {E} from '#src/internal/pure/effect';
import {pipe} from '#src/internal/pure/effect.ts';
import {Data, Duration, flow, Number, RateLimiter} from 'effect';

export class DbLimiterDefect extends Data.TaggedError('deepfryer/DbLimiterDefect')<{}> {}

const estimateRecordWriteCapacity = (encoding: any) =>
  pipe(
    encoding,
    JSON.stringify,
    Buffer.byteLength,
    Number.unsafeDivide(1024),
    Math.ceil,
    Number.max(1),
  );

export class DbLimiter extends E.Service<DbLimiter>()('deepfryer/DbLimiter', {
  scoped: E.gen(function* () {
    const maxRCU = 10;
    const maxWCU = 10;

    const readLimiter = yield* RateLimiter.make({
      algorithm: 'fixed-window',
      interval : Duration.seconds(1),
      limit    : maxRCU,
    });

    const writeLimiter = yield* RateLimiter.make({
      algorithm: 'fixed-window',
      interval : Duration.seconds(1),
      limit    : maxWCU,
    });

    return {
      partitionReadUnits: flow(
        readLimiter,
        RateLimiter.withCost(maxRCU / 4),
      ),

      indexReadUnits: flow(
        readLimiter,
        RateLimiter.withCost(maxRCU / 2),
      ),

      estimateReadUnits: (estimate?: number) => <A, E, R>(effect: E.Effect<A, E, R>) => {
        if (!estimate) {
          return readLimiter(effect);
        }

        const units = Math.ceil(estimate);

        return units > maxRCU
          ? E.die(new DbLimiterDefect())
          : readLimiter(effect).pipe(RateLimiter.withCost(units));
      },

      estimateWriteUnits: (estimate?: number) => <A, E, R>(effect: E.Effect<A, E, R>) => {
        if (!estimate) {
          return writeLimiter(effect);
        }

        const units = Math.ceil(estimate);

        return units > maxWCU
          ? E.die(new DbLimiterDefect())
          : writeLimiter(effect).pipe(RateLimiter.withCost(units));
      },

      // array overhead?
      encodedWriteUnits: (encoded: any) => <A, E, R>(effect: E.Effect<A, E, R>) => {
        const units = estimateRecordWriteCapacity(encoded);

        return units > maxWCU
          ? E.die(new DbLimiterDefect())
          : writeLimiter(effect).pipe(RateLimiter.withCost(units));
      },

      readLimiter,
      writeLimiter,
      maxRCU,
      maxWCU,
    };
  }),
}) {}
