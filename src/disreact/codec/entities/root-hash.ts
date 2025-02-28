import {NONE_STR} from '#src/disreact/codec/rest/index.ts';
import * as MsgPack from '@msgpack/msgpack';
import type {Schema} from 'effect/Schema';
import {Any, String, Struct} from 'effect/Schema';
import * as pako from 'pako';
import * as FiberState from './fiber-state.ts';
import type * as RootState from './root-state.ts';



export const Encoded = String;

export type Encoded = Schema.Type<typeof Encoded>;

export const Type = Struct({
  props: Any,
});


export type Type = {
  props : object | null;
  fibers: { [K in string]: FiberState.Type };
};

export const isEmpty = (hash: Encoded): boolean => hash === NONE_STR;



export const hash = (state: RootState.Type): Encoded => compressStack({
  props: state.props,
  ...state.fibers,
});



export const decode = (hash: Encoded): Type => {
  const stacks = decompressStack(hash);

  const acc = {
    props : null,
    fibers: {},
  } as any;

  for (const [k, v] of Object.entries(stacks)) {
    if (k === 'props') {
      acc.props = v;
      continue;
    }

    acc.fibers[k]       = FiberState.make();
    acc.fibers[k].stack = v;
    FiberState.savePrior(acc[k]);
  }

  return acc;
};



const compressStack = (data: Record<string, any>): string => {
  const binary     = MsgPack.encode(data);
  const compressed = pako.deflate(binary);
  return b64UrlSafe(compressed);
};

const decompressStack = (url: string): Record<string, any> => {
  const compressed   = b64FromUrl(url);
  const decompressed = pako.inflate(compressed);
  return MsgPack.decode(decompressed) as Record<string, any>;
};

const b64UrlSafe = (buffer: Uint8Array) => Buffer.from(buffer).toString('base64url');
const b64FromUrl = (url: string) => Buffer.from(url, 'base64url');
