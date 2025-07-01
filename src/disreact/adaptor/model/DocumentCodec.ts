import * as JsxDefault from '#disreact/adaptor/codec/intrinsic/index.ts';
import type * as Document from '#disreact/core/behaviors/exp/documentold.ts';
import * as Node from '#disreact/core/behaviors/exp/nodev1.ts';
import * as E from 'effect/Effect';
import * as MutableList from 'effect/MutableList';

export type ModelCodecConfig = {
  primitive    : string;
  encoding     : Record<string, (self: any, acc: any) => any>;
  normalization: Record<string, string>;
};

export class DocumentCodec extends E.Service<DocumentCodec>()('disreact/ModelCodec', {
  effect: E.fnUntraced(function* (config?: ModelCodecConfig) {
    const
      primitive     = config?.primitive ?? JsxDefault.primitive,
          normalization = config?.normalization ?? JsxDefault.normalization as Record<string, string>,
          encoding      = config?.encoding ?? JsxDefault.encoding as Record<string, (self: any, acc: any) => any>;

    const encodeDocument = (d?: Document.Documentold) => {
      if (!d) {
        return null;
      }
      const
        stack = MutableList.make<Node.Nodev1>(d.root),
       args = new WeakMap(),
       outs = new WeakMap(),
       last = {} as any;
      outs.set(d.root, last);

      while (MutableList.tail(stack)) {
        const
          n = MutableList.pop(stack)!,
         out = outs.get(n);

        if (Node.isFunctional(n)) {
          const rs = Node.dehydrate__(n, d);
          if (!rs) {
            continue;
          }
          for (const c of rs.toReversed()) {
            outs.set(c, out);
            MutableList.append(stack, c);
          }
        }
        else if (Node.isFragment(n)) {
          const rs = n.valence;
          if (!rs) {
            continue;
          }
          for (const c of rs.toReversed()) {
            outs.set(c, out);
            MutableList.append(stack, c);
          }
        }
        else if (Node.isText(n)) {
          if (!n.component) {
            continue;
          }
          out[primitive] ??= [];
          out[primitive].push(n.component);
        }
        else if (args.has(n)) {
          const norm = normalization[n.component];
          out[norm] ??= [];
          out[norm].push((encoding[n.component](n, args.get(n)!)));
        }
        else if (!n.valence || n.valence.length === 0) {
          const norm = normalization[n.component];
          out[norm] ??= [];
          out[norm].push((encoding[n.component](n, {})));
        }
        else {
          const arg = {};
          args.set(n, arg);
          MutableList.append(stack, n);

          for (const c of n.valence.toReversed()) {
            outs.set(c, arg);
            MutableList.append(stack, c);
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

    return {
      encodeDocument,
    };
  }),
})
{}
