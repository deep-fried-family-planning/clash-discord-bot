import {DynamoEnv} from '#config/aws.ts';
import * as E from 'effect/Effect';
import * as Data from 'effect/Data';
import * as Duration from 'effect/Duration';
import * as RateLimiter from 'effect/RateLimiter';
import * as Number from 'effect/Number';
import {pipe, flow} from 'effect/Function';

export class CapacityDefect extends Data.TaggedError('CapacityDefect')<{
  cause?: any;
}> {}

const estimateRecordWriteCapacity = (encoding: any) =>
  pipe(
    encoding,
    JSON.stringify,
    Buffer.byteLength,
    Number.unsafeDivide(1024),
    Math.ceil,
    Number.max(1),
  );

export class DataCapacity extends E.Service<DataCapacity>()('deepfryer/DataCapacity', {
  scoped: E.gen(function* () {
    const env = yield* DynamoEnv;

    const readLimiter = yield* RateLimiter.make({
      algorithm: 'fixed-window',
      interval : Duration.seconds(1),
      limit    : env.DFFP_DDB_RCUS,
    });

    const writeLimiter = yield* RateLimiter.make({
      algorithm: 'fixed-window',
      interval : Duration.seconds(1),
      limit    : env.DFFP_DDB_WCUS,
    });

    return {
      partitionReadUnits: (consistent?: boolean) =>
        consistent
          ? flow(
            readLimiter,
            RateLimiter.withCost(env.DFFP_DDB_RCUS / 4),
          )
          : flow(
            readLimiter,
            RateLimiter.withCost(env.DFFP_DDB_RCUS / 8),
          ),

      indexReadUnits: flow(
        readLimiter,
        RateLimiter.withCost(env.DFFP_DDB_RCUS / 4),
      ),

      estimateReadUnits: <A, E, R>(estimate?: number) => (effect: E.Effect<A, E, R>) => {
        if (!estimate) {
          return readLimiter(effect);
        }

        const units = Math.ceil(estimate);

        return units > env.DFFP_DDB_RCUS
          ? E.dieSync(() => new CapacityDefect({cause: 'RCU Exceeded'}))
          : readLimiter(effect).pipe(RateLimiter.withCost(units));
      },

      estimateWriteUnits: <A, E, R>(estimate?: number) => (effect: E.Effect<A, E, R>) => {
        if (!estimate) {
          return writeLimiter(effect);
        }
        const units = Math.ceil(estimate);

        return units > env.DFFP_DDB_WCUS
          ? E.dieSync(() => new CapacityDefect({cause: 'WCU Exceeded'}))
          : writeLimiter(effect).pipe(RateLimiter.withCost(units));
      },

      // array overhead?
      encodedWriteUnits: <A, E, R>(encoded: any) => (effect: E.Effect<A, E, R>) => {
        const units = estimateRecordWriteCapacity(encoded);

        return units > env.DFFP_DDB_WCUS
          ? E.dieSync(() => new CapacityDefect({cause: 'WCU Exceeded'}))
          : writeLimiter(effect).pipe(RateLimiter.withCost(units));
      },

      readLimiter,
      writeLimiter,
    };
  }),
}) {}
