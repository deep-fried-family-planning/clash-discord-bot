import * as JsxDefault from '#disreact/adaptor/codec/intrinsic/index.ts';
import type * as Elem from '#disreact/model/Element.ts';
import * as E from 'effect/Effect';

export type EncoderConfig = {
  primitive: string;
  encoders : Record<string, (self: Elem.Intrinsic, args: any) => any>;
  normalize: Record<string, string>;
};

const purgeUndefinedKeys = <A extends Record<string, any>>(obj: A): A =>
  Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined),
  ) as A;

export class ModelEncoder extends E.Service<ModelEncoder>()('disreact/Encoder', {
  effect: (config: EncoderConfig) => E.gen(function* () {
    const primitive = config?.primitive ?? JsxDefault.primitive,
          normalize = config?.normalize ?? JsxDefault.normalization as Record<string, string>,
          encoders  = config?.encoders ?? JsxDefault.encoding as Record<string, (self: any, acc: any) => any>;

    return {
      encodeText: (node: Elem.Text, acc: any) => {
        if (!node.text) {
          return acc;
        }
        acc[primitive] ??= [];
        acc[primitive].push(node.text);
        return acc;
      },
      encodeRest: (node: Elem.Intrinsic, acc: any, arg: any) => {
        const key = normalize[node.type];
        const encoder = encoders[node.type];

        if (!encoder) {
          throw new Error();
        }

        const encoded = encoder(node, arg);

        acc[key] ??= [];
        acc[key].push(purgeUndefinedKeys(encoded));
        return acc;
      },
    };
  }),
})
{}
