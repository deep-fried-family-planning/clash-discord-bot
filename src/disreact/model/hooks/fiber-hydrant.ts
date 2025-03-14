import {S} from '#src/internal/pure/effect.ts';
import * as MsgPack from '@msgpack/msgpack';
import * as pako from 'pako';



export type Hydrant = typeof Pack.Type;

export * as Hydrant from '#src/disreact/model/hooks/fiber-hydrant.ts';

export type Stack = typeof Stack.Items.Type;

export namespace Stack {
  export const Null  = S.Null;
  export const State = S.Struct({s: S.Any}).pipe(S.mutable);
  export const Dep   = S.Struct({d: S.Array(S.Any)}).pipe(S.mutable);
  export const Ref   = S.Struct({r: S.Any}).pipe(S.mutable);
  export const Msg   = S.Struct({e: S.Any}).pipe(S.mutable);
  export const Modal = S.Struct({m: S.Any}).pipe(S.mutable);
  export const Any   = S.Union(Null, State, Dep, Ref, Msg, Modal);
  export const Items = S.Array(Any).pipe(S.mutable);

  export const isNull  = S.is(Null);
  export const isState = S.is(State);
  export const isDep   = S.is(Dep);
  export const isRef   = S.is(Ref);
  export const isMsg   = S.is(Msg);
  export const isModal = S.is(Modal);
}

export const Hash    = S.String;
export const RootId  = S.String;
export const Props   = S.Any;
export const FiberId = S.String;

export const Pack = S.transform(
  Hash,
  S.Struct(
    {
      props: Props.pipe(S.mutable, S.optional),
    },
    S.Record({
      key  : FiberId,
      value: Stack.Items,
    }),
  ).pipe(S.mutable),
  {
    strict: true,
    encode: (hash) => deflate(hash),
    decode: (hash) => inflate(hash),
  },
);

export type Id = typeof RootId.Type;
export type FiberId = typeof FiberId.Type;
export type Props = typeof Props.Type;
export type Encoded = typeof Pack.Encoded;

const deflate = (data: any): string => {
  const binary     = MsgPack.encode(data);
  const compressed = pako.deflate(binary);

  return Buffer.from(compressed).toString('base64url');
};

const inflate = (encoded: string): any => {
  const compressed = Buffer.from(encoded, 'base64url');
  const binary     = pako.inflate(compressed);

  return MsgPack.decode(binary);
};

export const encode = S.encodeSync(Pack);
export const decode = S.decodeSync(Pack);
