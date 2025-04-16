import {Doken} from '#src/disreact/codec/doken.ts';
import {Intrinsic} from '#src/disreact/codec/rest-elem/index.ts';
import {Keys} from '#src/disreact/codec/rest-elem/keys.ts';
import {RxTx} from '#src/disreact/codec/rxtx.ts';
import type {Declare} from '#src/disreact/model/meta/declare.ts';
import {Rehydrant} from '#src/disreact/model/meta/rehydrant.ts';
import {Trigger} from '#src/disreact/model/elem/trigger.ts';
import {DisReactConfig} from '#src/disreact/utils/DisReactConfig.ts';
import {DokenMemory} from '#src/disreact/utils/DokenMemory.ts';
import {E, pipe, S} from '#src/disreact/utils/re-exports.ts';
import type { Elem } from 'src/disreact/model/elem/elem.ts';

export const decodeParamsRequest = S.decodeSync(RxTx.ParamsRequest);

export const decodeEvent = (route: RxTx.ParamsRequest): Trigger => {
  if (route._tag === 'Message') {
    return Trigger.make(route.body.data.custom_id, route.body.data);
  }

  if (route._tag === 'Modal') {
    return Trigger.make(route.custom_id, route.body.data);
  }

  // @ts-expect-error temporary
  throw new Error(`Invalid request type: ${route.body.type}`);
};

const finalEncoder = S.encodeSync(RxTx.OutTransform);

const encodeFinal = (config: DisReactConfig.Resolved) => (doken: Doken, encoding: Declare.Encoded) => {
  if (!encoding) {
    return E.succeed(null);
  }

  if (encoding?._tag !== 'Ephemeral' && Doken.isActive(doken)) {
    return pipe(
      E.succeed(
        finalEncoder({
          base    : config.baseUrl,
          serial  : Doken.cache(doken),
          hydrant : encoding.rehydrant,
          encoding: encoding as any,
        }),
      ),
      E.tap(() =>
        E.fork(DokenMemory.use((memory) => memory.save(doken))),
      ),
    );
  }

  return E.succeed(
    finalEncoder({
      base    : config.baseUrl,
      serial  : doken as any,
      hydrant : encoding.rehydrant,
      encoding: encoding as any,
    }),
  );
};

export class Codec extends E.Service<Codec>()('disreact/Codec', {
  effect: DisReactConfig.use((config) => {
    return {
      primitive    : Keys.primitive,
      normalization: Intrinsic.NORM,
      encoding     : Intrinsic.ENC,
      decodeRequest: decodeParamsRequest,
      decodeEvent,
      encodeFinal  : encodeFinal(config),
    };
  }),
  accessors: true,
}) {}
