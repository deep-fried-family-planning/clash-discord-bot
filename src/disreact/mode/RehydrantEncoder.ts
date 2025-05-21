import * as El from '#src/disreact/mode/entity/el.ts';
import * as JsxSchema from '#src/disreact/mode/entity/schema/jsx.ts';
import {Progress} from '#src/disreact/mode/RehydrantDOM.ts';
import * as Rehydrant from '#src/disreact/mode/entity/rehydrant.ts';
import * as E from 'effect/Effect';
import * as L from 'effect/Layer';
import * as Stack from 'effect/MutableList';

export type RehydrantEncoderConfig = {
  primitive?    : string;
  normalization?: Record<string, string>;
  encoding?     : Record<string, (self: any, acc: any) => any>;
};

const make = (config: RehydrantEncoderConfig) => {
  const {
    primitive     = JsxSchema.primitive,
    normalization = JsxSchema.normalization,
    encoding      = JsxSchema.encoding,
  } = config;

  const partials = {
    ephemeral: (id: string, type: string, props?: any) => Progress.Part({id, type, props}),
    message  : (id: string, type: string, props?: any) => Progress.Part({id, type, props}),
    modal    : (id: string, type: string, props?: any) => Progress.Part({id, type, props}),
  } as Record<string, any>;

  const encode = (root: Rehydrant.Rehydrant | null) => {
    if (!root || El.isVal(root.elem)) {
      return null;
    }
    const result = {} as any,
          stack  = Stack.make<[any, El.El[]]>([result, [root.elem]]),
          args   = new WeakMap<El.Nd, any>();

    while (Stack.tail(stack)) {
      const [acc, cs] = Stack.pop(stack)!;

      for (let i = 0; i < cs.length; i++) {
        const c = cs[i];

        if (El.isVal(c)) {
          acc[primitive] ??= [];
          acc[primitive].push(c);
        }
        else if (args.has(c) && El.isApi(c)) {
          const norm = normalization[c.type];
          const arg = args.get(c)!;
          acc[norm] ??= [];
          acc[norm].push((encoding[c.type](c, arg)));
        }
        else if (!c.nodes.length && El.isApi(c)) {
          const norm = normalization[c.type];
          const arg = {};
          args.set(c, arg);
          acc[norm] ??= [];
          acc[norm].push((encoding[c.type](c, arg)));
        }
        else {
          Stack.append(stack, [acc, cs.slice(i)]);
          const arg = {};
          args.set(c, arg);
          const next = El.isApi(c) ? arg : acc;
          Stack.append(stack, [next, c.nodes]);
          break;
        }
      }
    }

    for (const key of Object.keys(result)) {
      if (result[key]) {
        return {
          _tag    : key,
          hydrator: Rehydrant.hydrator(root),
          data    : result[key][0],
        };
      }
    }
    return null;
  };

  return {
    primitive,
    normalization,
    encoding,
    partials,
    encode,
  };
};

export class RehydrantEncoder extends E.Service<RehydrantEncoder>()('disreact/ModelCodec', {
  succeed  : make({}),
  accessors: true,
}) {
  static readonly config = (config: RehydrantEncoderConfig) => L.succeed(this, this.make(make(config)));
}
