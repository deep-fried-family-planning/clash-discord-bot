import {decode, encode} from '@msgpack/msgpack';
import * as S from 'effect/Schema';
import {deflate, inflate} from 'pako';

export const Null = S.Null;
export const State = S.Struct({s: S.Any}).pipe(S.mutable);
export const Dep = S.Struct({d: S.Any}).pipe(S.mutable);
export const Monomer = S.Union(
  Null,
  State,
  Dep,
);
export const Chain = S.Array(Monomer);

export const Hydrator = S.Struct({
  id    : S.String,
  props : S.optional(S.Any),
  stacks: S.Record({key: S.String, value: Chain}),
});

export const HydratorTransform = S.transform(
  S.String,
  Hydrator,
  {
    encode: (dry) => {
      const pack = encode(dry);
      const pako = deflate(pack);
      return Buffer.from(pako).toString('base64url');
    },
    decode: (hash) => {
      const buff = Buffer.from(hash, 'base64url');
      const pako = inflate(buff);
      return decode(pako) as any;
    },
  },
);
