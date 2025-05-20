import * as Elem from '#src/disreact/mode/entity/elem.ts';
import type {Hook} from '#src/disreact/mode/hook.ts';
import {ModelCodec} from '#src/disreact/mode/ModelCodec.ts';
import * as Rehydrant from '#src/disreact/mode/state/rehydrant.ts';
import * as E from 'effect/Effect';
import * as ML from 'effect/MutableList';
import * as P from 'effect/Predicate';



export const dismount = (elem: Elem.Elem) => {
  const stack = ML.make(elem);

  return E.void;
};

export const mount = (elem: Elem.Elem) => {
  const stack = ML.make(elem);
};

export const effect = (effect: Hook.Effect) => E.suspend(() => {
  const out = effect();
  if (P.isPromise(out)) {
    return E.promise(async () => await out) as E.Effect<void>;
  }
  if (E.isEffect(out)) {
    return out as E.Effect<void>;
  }
  ;
  return E.void as E.Effect<void>;
});

export const encode = (root: Rehydrant.Rehydrant | null) => ModelCodec.use((codec) => {
  if (!root) return null;
  if (Elem.isVal(root.elem)) return null;

  const result = {} as any,
        stack  = ML.make<[any, Elem.Elem[]]>([result, [root.elem]]),
        args   = new WeakMap<Elem.Node, any>();

  while (ML.tail(stack)) {
    const [acc, cs] = ML.pop(stack)!;

    for (let i = 0; i < cs.length; i++) {
      const c = cs[i];

      if (Elem.isVal(c)) {
        acc[codec.primitive] ??= [];
        acc[codec.primitive].push(c);
      }
      else if (args.has(c as any) && Elem.isApi(c)) {
        const norm = codec.normalization[c.type as any];
        const arg = args.get(c)!;
        acc[norm] ??= [];
        acc[norm].push((codec.encoding[c.type](c, arg)));
      }
      else if (!c.nodes.length && Elem.isApi(c)) {
        const norm = codec.normalization[c.type as any];
        const arg = {} as any;
        args.set(c, arg);
        acc[norm] ??= [];
        acc[norm].push((codec.encoding[c.type](c, arg)));
      }
      else {
        ML.append(stack, [acc, cs.slice(i)]);
        const arg = {} as any;
        args.set(c, arg);

        if (Elem.isApi(c)) {
          ML.append(stack, [arg, c.nodes]);
        }
        else {
          ML.append(stack, [acc, c.nodes]);
        }
        break;
      }
    }
  }

  for (const key of Object.keys(result)) {
    if (result[key]) {
      return {
        _tag    : key,
        hydrator: Rehydrant.dehydrate(root),
        data    : result[key][0],
      };
    }
  }

  return null;
});
