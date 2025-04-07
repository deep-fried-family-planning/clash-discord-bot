import type {DR} from 'src/disreact/utils/re-exports.ts'
import { DT, hole, S} from 'src/disreact/utils/re-exports.ts'

export * as Snowflake from '#src/disreact/codec/snowflake.ts'
export type Snowflake = string

export const toDateTime = (id: string) =>
  DT.unsafeMake(
    Number(BigInt(id) >> 22n) + 1420070400000,
  )

export const Id = S.String

export const Epoch = S.transform(
  Id,
  S.typeSchema(S.DateTimeUtcFromSelf),
  {
    strict: true,
    encode: hole,
    decode: (id) => toDateTime(id),
  },
)

export const Meta = S.transform(
  Id,
  S.Struct({
    id   : Id,
    epoch: Epoch,
  }),
  {
    strict: true,
    encode: (self) => self.id,
    decode: (self) => ({
      id   : self,
      epoch: self,
    }),
  },
)

export const TimeToLive = (duration: DR.Duration) =>
  S.transform(
    Id,
    S.typeSchema(S.DateTimeUtcFromSelf),
    {
      strict: true,
      encode: hole,
      decode: (id) => DT.addDuration(toDateTime(id), duration),
    },
  )
