import * as DT from 'effect/DateTime';
import type * as DR from 'effect/Duration';
import {hole} from 'effect/Function';
import * as S from 'effect/Schema';

export * as Snowflake from '#src/disreact/codec/snowflake.ts';
export type Snowflake = string;

export const toDateTime = (id: string) =>
  DT.unsafeMake(
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

export const TimeToLive = (duration: DR.Duration) =>
  S.transform(
    Id,
    S.typeSchema(S.DateTimeUtcFromSelf),
    {
      encode: () => '',
      decode: (id) => DT.addDuration(toDateTime(id), duration),
    },
  );
