import * as DateTime from 'effect/DateTime';
import type * as Duration from 'effect/Duration';
import {hole} from 'effect/Function';
import * as S from 'effect/Schema';

export * as Snowflake from '#src/disreact/codec/dapi/snowflake.ts';
export type Snowflake = string;

export const toDateTime = (id: string) =>
  DateTime.unsafeMake(
    Number(BigInt(id) >> 22n) + 1420070400000,
  );

export const Id = S.String;

export const Epoch = S.transform(
  Id,
  S.typeSchema(S.DateTimeUtcFromSelf),
  {
    strict: true,
    encode: hole,
    decode: (id) => toDateTime(id),
  },
);

export const TimeToLive = (duration: Duration.Duration) =>
  S.transform(
    Id,
    S.typeSchema(S.DateTimeUtcFromSelf),
    {
      encode: () => '',
      decode: (id) => DateTime.addDuration(toDateTime(id), duration),
    },
  );
