import {Codec} from '#src/disreact/codec/Codec.ts';
import type {Root} from '#src/disreact/model/entity/root.ts';
import {E} from '#src/disreact/utils/re-exports.ts';
import {Doken} from '../codec/doken.ts';
import {RxTx} from '../codec/rxtx.ts';
import {Fibril} from '../model/comp/fibril.ts';
import {Misc} from '../utils/misc.ts';

export * as Helpers from './helpers.ts';
export type Helpers = never;

export const decodeRequestEvent = (input: any) => E.map(Codec, (codec) => {
  const request = codec.decodeRequest(input);
  const event = codec.decodeEvent(request);

  return [request, event] as const;
}).pipe(
  Misc.trackDecodeTime,
);

export const encodeActiveReply = (root: Root, doken: Doken.Active) => E.map(Codec, (codec) => {
  const encoded = codec.encodeRoot(root);

  return codec.encodeResponse({
    _tag   : 'Message',
    base   : RxTx.DEFAULT_BASE_URL,
    serial : doken,
    hydrant: Fibril.encodeNexus(root.nexus),
    data   : encoded as any,
  });
}).pipe(
  Misc.trackEncodeTime,
);

export const encodeModalReply = (root: Root, doken: Doken.Fresh) => E.map(Codec, (codec) => {
  const encoded = codec.encodeRoot(root);

  return codec.encodeResponse({
    _tag   : 'Modal',
    base   : RxTx.DEFAULT_BASE_URL,
    serial : Doken.makeSingle(doken),
    hydrant: Fibril.encodeNexus(root.nexus),
    data   : encoded as any,
  });
}).pipe(
  Misc.trackEncodeTime,
);
