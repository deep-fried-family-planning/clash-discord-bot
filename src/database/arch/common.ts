import {E, S} from '#src/internal/pure/effect.ts';
import {decode, encode} from '@msgpack/msgpack';
import {DateTime, type Duration, pipe} from 'effect';
import {deflate, inflate} from 'pako';

export const Created = S.transformOrFail(
  S.DateTimeUtc,
  S.UndefinedOr(S.DateTimeUtcFromSelf),
  {
    decode: (dt) => E.succeed(dt),
    encode: (dt) => dt ? E.succeed(dt) : DateTime.now,
  },
);

export const Updated = S.transformOrFail(
  S.DateTimeUtc,
  S.UndefinedOr(S.DateTimeUtcFromSelf),
  {
    decode: (dt) => E.succeed(dt),
    encode: () => DateTime.now,
  },
);

export const TimeToLive = (duration: Duration.Duration) =>
  S.transformOrFail(
    S.DateTimeUtcFromNumber,
    S.UndefinedOr(S.DateTimeUtcFromSelf),
    {
      decode: (dt) => E.succeed(dt),
      encode: (dt) => dt
        ? E.succeed(dt)
        : pipe(
          DateTime.now,
          E.map(
            DateTime.addDuration(duration),
          ),
        ),
    },
  );

export const Decoded = S.transform(
  S.Undefined,
  S.Literal(true),
  {
    decode: () => true as const,
    encode: () => undefined,
  },
);

export const Upgraded = pipe(
  S.Union(S.Undefined, S.Boolean),
  S.transform(
    S.Union(S.Undefined, S.Boolean),
    {
      decode: (enc) => enc,
      encode: () => undefined,
    },
  ),
  S.optional,
);

export const SelectMetadata = <A, I, R>(value: S.Schema<A, I, R>) =>
  S.Struct({
    value      : value,
    label      : S.String,
    description: S.optional(S.String),
    default    : S.optional(S.Boolean),
    emoji      : S.optional(S.Struct({
      name: S.String,
    })),
  });

export const CompressedBinary = <A, I, R>(schema: S.Schema<A, I, R>) =>
  S.transform(S.String, schema, {
    decode: (enc) => {
      const buff = Buffer.from(enc, 'base64');
      const pako = inflate(buff);
      return decode(pako) as any;
    },
    encode: (dec) => {
      const pack = encode(dec);
      const pako = deflate(pack);
      return Buffer.from(pako).toString('base64');
    },
  });
