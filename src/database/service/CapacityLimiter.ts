import {E, pipe} from '#src/internal/pure/effect.ts';
import {Data, Duration, flow, Number, RateLimiter, Effect} from 'effect';

export class CapacityDefect extends Data.TaggedError('deepfryer/CapacityDefect')<{}> {}

const estimateRecordWriteCapacity = (encoding: any) =>
  pipe(
    encoding,
    JSON.stringify,
    Buffer.byteLength,
    Number.unsafeDivide(1024),
    Math.ceil,
    Number.max(1),
  );

export class CapacityLimiter extends Effect.Service<CapacityLimiter>()('deepfryer/DynamoLimiter', {
  scoped: Effect.gen(function* () {
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

      estimateReadUnits: <A, E, R>(estimate?: number) => (effect: Effect.Effect<A, E, R>) => {
        if (!estimate) {
          return readLimiter(effect);
        }

        const units = Math.ceil(estimate);

        return units > maxRCU
          ? E.die(new CapacityDefect())
          : readLimiter(effect).pipe(RateLimiter.withCost(units));
      },

      estimateWriteUnits: <A, E, R>(estimate?: number) => (effect: Effect.Effect<A, E, R>) => {
        if (!estimate) {
          return writeLimiter(effect);
        }

        const units = Math.ceil(estimate);

        return units > maxWCU
          ? Effect.die(new CapacityDefect())
          : writeLimiter(effect).pipe(RateLimiter.withCost(units));
      },

      // array overhead?
      encodedWriteUnits: <A, E, R>(encoded: any) => (effect: Effect.Effect<A, E, R>) => {
        const units = estimateRecordWriteCapacity(encoded);

        return units > maxWCU
          ? Effect.die(new CapacityDefect())
          : writeLimiter(effect).pipe(RateLimiter.withCost(units));
      },

      readLimiter,
      writeLimiter,
      maxRCU,
      maxWCU,
    };
  }),
}) {}
