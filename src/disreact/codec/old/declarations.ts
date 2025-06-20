import type * as Rehydrant from '#src/disreact/model/domain/envelope.ts';
import {decode, encode} from '@msgpack/msgpack';
import type * as E from 'effect/Effect';
import * as S from 'effect/Schema';
import {deflate, inflate} from 'pako';

export const Null = S.Null;
export const State = S.Struct({s: S.Any}).pipe(S.mutable);
export const Dep = S.Struct({d: S.Any}).pipe(S.mutable);
export const Data = S.Struct({a: S.Any}).pipe(S.mutable);
export const Monomer = S.Union(
  Null,
  State,
  Dep,
  Data,
);
export const Chain = S.Array(Monomer);

export const Hydrator = S.Struct({
  key   : S.optional(S.Union(S.String, S.Null)),
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

export type Encoded<A extends string = string, B = any> =
  | {
      _tag    : A;
      hydrator: Rehydrant.Hydrator;
      data    : B;
    }
  | null;

export const encoded = <T extends string, A, I, R>(_tag: T, data: S.Schema<A, I, R>) =>
  S.Struct({
    _tag    : S.Literal(_tag),
    hydrator: S.typeSchema(Hydrator),
    data    : data,
  });

export const trigger = <A, I, R>(data: S.Schema<A, I, R>) =>
  S.Struct({
    id  : S.String,
    data: data,
  });

export const handler = <A, I, R>(data: S.Schema<A, I, R>) =>
  S.declare(
    (h): h is (event: typeof data.Type) =>
      | void
      | Promise<void>
      | E.Effect<void, any, any> =>
      typeof h === 'function' &&
      h.length === 1,
  );
