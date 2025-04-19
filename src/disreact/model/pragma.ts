import {Codec} from '#src/disreact/codec/Codec.ts';
import {ML} from '#src/disreact/utils/re-exports.ts';
import {MutableList} from 'effect';
import { Elem } from './elem/elem';
import { Rehydrant } from './elem/rehydrant';
import type { Declare } from './exp/declare';

export * as Pragma from '#src/disreact/model/pragma.ts';
export type Pragma = never;

export const Fragment = Elem.FragmentType;

export const jsx = (type: any, props: any): Elem => {
  if (Elem.isFragmentType(type)) {
    return Elem.makeFragment(type, props);
  }

  if (Elem.isRestType(type)) {
    const children = props.children ? [props.children] : [];
    delete props.children;

    return Elem.makeRest(type, props, children);
  }

  if (Elem.isTaskType(type)) {
    return Elem.makeTask(type, props);
  }

  throw new Error(`Invalid JSX: ${String(type)}`);
};

export const jsxs = (type: any, props: any): Elem => {
  props.children = props.children.flat();

  if (Elem.isFragmentType(type)) {
    return Elem.makeFragment(type, props);
  }

  if (Elem.isRestType(type)) {
    const children = props.children;
    delete props.children;

    return Elem.makeRest(type, props, children);
  }

  if (Elem.isTaskType(type)) {
    return Elem.makeTask(type, props);
  }

  throw new Error(`Invalid JSX: ${String(type)}`);
};

export const jsxDEV = (type: any, props: any): Elem => {
  if (Array.isArray(props.children)) {
    return jsxs(type, props);
  }
  return jsx(type, props);
};

export const clone = <A extends Elem>(elem: A): A => {
  if (Elem.isValue(elem)) {
    return Elem.cloneValue(elem) as A;
  }
  if (Elem.isFragment(elem)) {
    return Elem.cloneFragment(elem) as A;
  }
  if (Elem.isRest(elem)) {
    return Elem.cloneRest(elem) as A;
  }
  return Elem.cloneTask(elem) as A;
};

export const deepClone = <A extends Elem>(elem: A): A => {
  const cloned = clone(elem);

  if (!Elem.isNode(cloned)) {
    return cloned;
  }

  const stack = ML.make<Elem.Node>(cloned);

  while (ML.tail(stack)) {
    const next = ML.pop(stack)!;

    for (let i = 0; i < next.nodes.length; i++) {
      const child = clone(next.nodes[i]);

      next.nodes[i] = child;

      if (Elem.isNode(child)) {
        MutableList.append(stack, child);
      }
    }
  }

  return cloned;
};

export const encode = (root: Rehydrant | null) => Codec.use((codec): Declare.Encoded => {
  if (!root) return null;
  if (Elem.isValue(root.elem)) return null;

  const result = {} as any,
        stack  = ML.make<[any, Elem[]]>([result, [root.elem]]),
        args   = new WeakMap<Elem.Node, any>();

  while (ML.tail(stack)) {
    const [acc, cs] = ML.pop(stack)!;

    for (let i = 0; i < cs.length; i++) {
      const c = cs[i];

      if (Elem.isValue(c)) {
        acc[codec.primitive] ??= [];
        acc[codec.primitive].push(c);
      }
      else if (Elem.isFragment(c)) {
        ML.append(stack, [acc, c.nodes]);
      }
      else if (args.has(c as any)) {
        if (Elem.isRest(c)) {
          const norm = codec.normalization[c.type as any];
          const arg = args.get(c)!;
          acc[norm] ??= [];
          acc[norm].push((codec.encoding[c.type](c, arg)));
        }
      }
      else if (!c.nodes.length) {
        if (Elem.isRest(c)) {
          const norm = codec.normalization[c.type as any];
          const arg = {} as any;
          args.set(c, arg);
          acc[norm] ??= [];
          acc[norm].push((codec.encoding[c.type](c, arg)));
        }
      }
      else {
        ML.append(stack, [acc, cs.slice(i)]);
        const arg = {} as any;
        args.set(c, arg);

        if (Elem.isRest(c)) {
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
