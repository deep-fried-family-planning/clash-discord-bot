import {Doken} from '#src/disreact/codec/doken.ts';
import {Intrinsic} from '#src/disreact/codec/rest-elem/index.ts';
import {Keys} from '#src/disreact/codec/rest-elem/keys.ts';
import {RxTx} from '#src/disreact/codec/rxtx.ts';
import {Rehydrant} from '#src/disreact/model/rehydrant.ts';
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

const encodeFinal = (config: DisReactConfig.Resolved) => (hydrant: Rehydrant, doken: Doken, encoding: Elem.Encoded) => {
  if (!encoding) {
    return E.succeed(null);
  }

  if (encoding?._tag !== 'Ephemeral' && Doken.isActive(doken)) {
    return pipe(
      E.succeed(
        finalEncoder({
          base    : config.baseUrl,
          serial  : Doken.cache(doken),
          hydrant : Rehydrant.dehydrate(hydrant),
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
      hydrant : Rehydrant.dehydrate(hydrant),
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

      // encodeResponseWithCache: (root: Rehydrant, doken: Doken.Active) => {
      //   const encoded = encodeRoot(root);
      //   const hydrant = Rehydrant.dehydrate(root);
      //   const serial = Intrinsic.isEphemeral(encoded)
      //     ? doken
      //     : Doken.convertCached(doken);
      //
      //   return pipe(
      //     E.tap(DokenMemory, (memory) => memory.save(doken)),
      //     E.as(
      //       encodeParamsResponse({
      //         _tag: 'Message',
      //         base: config.baseUrl,
      //         serial,
      //         hydrant,
      //         data: encoded,
      //       }),
      //     ),
      //   );
      // },
      // encodeResponse: (root: Rehydrant, doken: Doken) => {
      //   const encoded = encodeRoot(root);
      //   const hydrant = Rehydrant.dehydrate(root);
      //
      //   if (Intrinsic.isModal(encoded)) {
      //     return encodeParamsResponse({
      //       _tag   : 'Modal',
      //       base   : config.baseUrl,
      //       serial : Doken.single(doken),
      //       hydrant: hydrant,
      //       data   : encoded as any,
      //     });
      //   }
      //
      //   const serial = Doken.convertSerial(doken);
      //
      //   if (Intrinsic.isEphemeral(encoded)) {
      //     return encodeParamsResponse({
      //       _tag   : 'Message',
      //       base   : config.baseUrl,
      //       serial : serial,
      //       hydrant: hydrant,
      //       data   : encoded as any,
      //     });
      //   }
      //
      //   return encodeParamsResponse({
      //     _tag   : 'Message',
      //     base   : config.baseUrl,
      //     serial : serial,
      //     hydrant: hydrant,
      //     data   : encoded as any,
      //   });
      // },
      // encodeRoot,
    };
  }),
  accessors: true,
}) {}
