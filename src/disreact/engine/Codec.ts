import * as JsxDefault from '#disreact/adaptor/codec/intrinsic/index.ts';
import type * as Document from '#disreact/core/Document.ts';
import type * as Node from '#disreact/core/Node.ts';
import {FRAGMENT, FUNCTIONAL, INTRINSIC, LIST_NODE, TEXT_NODE} from '#disreact/core/primitives/constants.ts';
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
            args  = new WeakMap(),
            outs  = new WeakMap(),
            last  = {} as any;
      outs.set(d.body, last);

      while (MutableList.tail(stack)) {
        const n   = MutableList.pop(stack)!,
              out = outs.get(n);

        switch (n._tag) {
          case TEXT_NODE: {
            if (!n.text) {
              continue;
            }
            out[primitive] ??= [];
            out[primitive].push(n.text);
            continue;
          }
          case LIST_NODE:
          case FRAGMENT:
          case FUNCTIONAL: {
            if (!n.children) {
              continue;
            }
            for (const c of n.children.toReversed()) {
              outs.set(c, out);
              MutableList.append(stack, c);
            }
            if (n._tag === FUNCTIONAL) {

            }
            continue;
          }
          case INTRINSIC: {
            if (args.has(n)) {
              const norm = normalization[n.component];
              out[norm] ??= [];
              out[norm].push((encoding[n.component](n, args.get(n)!)));
            }
            else if (!n.children || n.children.length === 0) {
              const norm = normalization[n.component];
              out[norm] ??= [];
              out[norm].push((encoding[n.component](n, {})));
            }
            else {
              const arg = {};
              args.set(n, arg);
              MutableList.append(stack, n);

              for (const c of n.children.toReversed()) {
                outs.set(c, arg);
                MutableList.append(stack, c);
              }
            }
          }
        }
      }
      for (const key of Object.keys(last)) {
        if (last[key]) {
          return {
            _tag    : key,
            hydrator: d.trie,
            data    : last[key][0],
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
