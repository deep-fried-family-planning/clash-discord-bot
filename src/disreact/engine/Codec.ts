import * as JsxDefault from '#disreact/adaptor/codec/intrinsic/index.ts';
import type * as Document from '#disreact/core/Document.ts';
import type * as Node from '#disreact/core/Node.ts';
import {FRAGMENT, FUNCTIONAL, INTRINSIC, LIST_NODE, TEXT_NODE} from '#disreact/core/immutable/constants.ts';
import * as E from 'effect/Effect';
import * as MutableList from 'effect/MutableList';

export type CodecConfig = {
  primitive: string;
  encoders : Record<string, (self: Node.Rest, args: any) => any>;
  normalize: Record<string, string>;
};

export class Codec extends E.Service<Codec>()('disreact/Codec', {
  effect: (config: CodecConfig) => E.gen(function* () {
    const primitive     = config?.primitive ?? JsxDefault.primitive,
          normalization = config?.normalize ?? JsxDefault.normalization as Record<string, string>,
          encoding      = config?.encoders ?? JsxDefault.encoding as Record<string, (self: any, acc: any) => any>;

    const encodeDocument = (d?: Document.Document) => {
      if (!d) {
        return null;
      }
      const stack = MutableList.make<Node.Node>(d.body),
            final  = {} as any,
            args  = new WeakMap(),
            outs  = new WeakMap().set(d.body, final);

      while (MutableList.tail(stack)) {
        const node   = MutableList.pop(stack)!,
              out = outs.get(node);

        switch (node._tag) {
          case TEXT_NODE: {
            if (!node.text) {
              continue;
            }
            out[primitive] ??= [];
            out[primitive].push(node.text);
            continue;
          }
          case LIST_NODE:
          case FRAGMENT:
          case FUNCTIONAL: {
            if (!node.children) {
              continue;
            }
            for (const c of node.children.toReversed()) {
              outs.set(c, out);
              MutableList.append(stack, c);
            }
            if (node._tag === FUNCTIONAL) {

            }
            continue;
          }
          case INTRINSIC: {
            if (args.has(node)) {
              const norm = normalization[node.component];
              out[norm] ??= [];
              out[norm].push((encoding[node.component](node, args.get(node)!)));
            }
            else if (!node.children || node.children.length === 0) {
              const norm = normalization[node.component];
              out[norm] ??= [];
              out[norm].push((encoding[node.component](node, {})));
            }
            else {
              const arg = {};
              args.set(node, arg);
              MutableList.append(stack, node);

              for (const c of node.children.toReversed()) {
                outs.set(c, arg);
                MutableList.append(stack, c);
              }
            }
          }
        }
      }
      for (const key of Object.keys(final)) {
        if (final[key]) {
          return {
            _tag    : key,
            hydrator: d.trie,
            data    : final[key][0],
          };
        }
      }
      return null;
    };

    return {};
  }),
  accessors: true,
})
{}
