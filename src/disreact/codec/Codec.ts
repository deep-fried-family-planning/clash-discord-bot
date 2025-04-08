import {Elem} from '#src/disreact/model/entity/elem.ts';
import type {Root} from '#src/disreact/model/entity/root.ts';
import {E, ML, S} from '#src/disreact/utils/re-exports.ts';
import type {Events} from '../model/entity/events';
import {Intrinsic} from './rest-elem';
import {Keys} from './rest-elem/keys';
import {RxTx} from './rxtx';

export const encodeResponse = S.encodeSync(RxTx.ParamsResponse);
export const decodeRequest = S.decodeSync(RxTx.ParamsRequest);

export const encodeRoot = (root: Root): RxTx.ParamsResponse['data'] => {
  const result = {} as any,
        list   = ML.make<[any, Elem.Any[]]>([result, [root.elem]]),
        args   = new WeakMap<Elem, any>();

  while (ML.tail(list)) {
    const [acc, cs] = ML.pop(list)!;

    for (let i = 0; i < cs.length; i++) {
      const c = cs[i];

      if (Elem.isPrim(c)) {
        acc[Keys.primitive] ??= [];
        acc[Keys.primitive].push(c);
      }
      else if (args.has(c as any)) {
        if (Elem.isRest(c)) {
          const norm = Intrinsic.NORM[c.type as any];
          const encode = Intrinsic.ENC[c.type];
          const arg = args.get(c)!;
          acc[norm] ??= [];
          acc[norm].push(encode(c, arg));
        }
        else {
          //
        }
      }
      else if (!c.nodes.length) {
        if (Elem.isRest(c)) {
          const norm = Intrinsic.NORM[c.type as any];
          const encode = Intrinsic.ENC[c.type];
          const arg = {} as any;
          args.set(c, arg);
          acc[norm] ??= [];
          acc[norm].push(encode(c, arg));
        }
        else {
          //
        }
      }
      else {
        ML.append(list, [acc, cs.slice(i)]);
        const arg = {} as any;
        args.set(c, arg);

        if (Elem.isRest(c)) {
          ML.append(list, [arg, c.nodes]);
        }
        else {
          ML.append(list, [acc, c.nodes]);
        }

        break;
      }
    }
  }

  if (result.modal?.[0]) {
    return result.modal?.[0];
  }

  return result.message?.[0];
};

export const decodeEvent = (route: RxTx.ParamsRequest): Events => {
  const req = route.body;

  if (req.type === 2) {
    return {
      id  : req.data.custom_id,
      data: {
        data: route.body.data,
      },
    };
  }

  if (req.type === 5) {
    throw new Error(`Invalid request type: ${req.type}`);
  }

  // @ts-expect-error temporary
  throw new Error(`Invalid request type: ${req.type}`);
};

export class Codec extends E.Service<Codec>()('disreact/Codec', {
  succeed: {
    decodeRequest,
    encodeResponse,
    encodeRoot,
    decodeEvent,
  },
  accessors: true,
}) {}
