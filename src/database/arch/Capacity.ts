import { E } from '#src/internal/pure/effect';
import {pipe} from '#src/internal/pure/effect.ts';
import {Data, flow, Number, RateLimiter} from 'effect';

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

export class Capacity extends E.Service<Capacity>()('deepfryer/Capacity', {
  scoped: E.gen(function* () {
    const capacity = {
      readUnits : 10,
      writeUnits: 10,
    };

    const readCapacityUnit = yield* RateLimiter.make({
      limit   : capacity.readUnits,
      interval: 1000,
    });

    const writeCapacityUnit = yield* RateLimiter.make({
      limit   : capacity.writeUnits,
      interval: 1000,
    });

    return {
      ...capacity,
      readCapacityUnit,
      writeCapacityUnit,

      partitionedReadUnits: flow(readCapacityUnit, RateLimiter.withCost(capacity.readUnits / 4)),
      indexedReadUnits    : flow(readCapacityUnit, RateLimiter.withCost(capacity.readUnits / 2)),

      withEstimatedReadCapacity: (estimate?: number) => <A, E, R>(effect: E.Effect<A, E, R>) => {
        if (!estimate) {
          return pipe(
            effect,
            readCapacityUnit,
          );
        }
        const units = Math.ceil(estimate);

        if (units > capacity.readUnits) {
          return E.die(new CapacityDefect());
        }

        return pipe(
          effect,
          readCapacityUnit,
          RateLimiter.withCost(units),
        );
      },

      withEstimatedWriteCapacity: (estimate?: number) => <A, E, R>(effect: E.Effect<A, E, R>) => {
        if (!estimate) {
          return pipe(
            effect,
            writeCapacityUnit,
          );
        }
        const units = Math.ceil(estimate);

        if (units > capacity.readUnits) {
          return E.die(new CapacityDefect());
        }

        return pipe(
          effect,
          writeCapacityUnit,
          RateLimiter.withCost(units),
        );
      },

      // array overhead?
      withEncodedWriteCapacity: (encoded: any) => <A, E, R>(effect: E.Effect<A, E, R>) => {
        const units = estimateRecordWriteCapacity(encoded);

        if (units > capacity.writeUnits) {
          return E.die(new CapacityDefect());
        }

        return pipe(
          effect,
          writeCapacityUnit,
          RateLimiter.withCost(units),
        );
      },
    };
  }),
}) {}
