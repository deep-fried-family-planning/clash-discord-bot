import * as JsxDefault from '#disreact/adaptor/codec/intrinsic/index.ts';
import {PRODUCTION} from '#disreact/core/immutable/constants.ts';
import type * as Node from '#disreact/core/Element.ts';
import type * as Lifecycle from '#disreact/core/Lifecycle.ts';
import * as E from 'effect/Effect';

export type EncoderConfig = {
  primitive: string;
  encoders : Record<string, (self: Node.Rest, args: any) => any>;
  normalize: Record<string, string>;
};

const purgeUndefinedKeys = <A extends Record<string, any>>(obj: A): A =>
  Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined),
  ) as A;

export class Encoder extends E.Service<Encoder>()('disreact/Encoder', {
  effect: (config: EncoderConfig) => E.gen(function* () {
    const primitive = config?.primitive ?? JsxDefault.primitive,
          normalize = config?.normalize ?? JsxDefault.normalization as Record<string, string>,
          encoders  = config?.encoders ?? JsxDefault.encoding as Record<string, (self: any, acc: any) => any>;

    return {
      encodeText: (node: Node.Text, acc: Lifecycle.Encoding) => {
        if (!node.text) {
          return acc;
        }
        acc[primitive] ??= [];
        acc[primitive].push(node.text);
        return acc;
      },
      encodeRest: (node: Node.Rest, acc: Lifecycle.Encoding, arg: Lifecycle.Encoding) => {
        const key = normalize[node.component];
        const encoder = encoders[node.component];

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
