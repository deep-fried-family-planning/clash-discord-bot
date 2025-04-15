import {Codec} from '#src/disreact/codec/Codec.ts';
import {Elem} from '#src/disreact/model/entity/elem.ts';
import {ML, S} from '#src/disreact/utils/re-exports.ts';

export * as LifecycleIO from 'src/disreact/model/lifecycle-io.ts';
export type LifecycleIO = never;

export const jsxFragment = undefined;

export const jsx = (type: any, props: any) => {

};

export const jsxs = (type: any, props: any) => {

};

export const jsxDEV = (type: any, props: any) => {

};

export const clone = () => {};

export type Encoded =
  | {
      _tag: string;
      data: any;
    }
  | null;

export const encode = (root: Elem.Any) => Codec.use((codec) => {
  if (Elem.isValue(root)) {
    return null;
  }

  const result = {} as any,
        stack  = ML.make<[any, Elem.Any[]]>([result, [root]]),
        args   = new WeakMap<Elem, any>();

  while (ML.tail(stack)) {
    const [acc, cs] = ML.pop(stack)!;

    for (let i = 0; i < cs.length; i++) {
      const c = cs[i];

      if (Elem.isValue(c)) {
        acc[codec.primitive] ??= [];
        acc[codec.primitive].push(c);
      }
      else if (args.has(c as any)) {
        if (Elem.isRest(c)) {
          const norm = codec.normalization[c.type as any];
          const arg = args.get(c)!;
          acc[norm] ??= [];
          acc[norm].push(removeUndefined(codec.encoding[c.type](c, arg)));
        }
      }
      else if (!c.nodes.length) {
        if (Elem.isRest(c)) {
          const norm = codec.normalization[c.type as any];
          const arg = {} as any;
          args.set(c, arg);
          acc[norm] ??= [];
          acc[norm].push(removeUndefined(codec.encoding[c.type](c, arg)));
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
        _tag: key,
        data: result[key][0],
      } as Encoded;
    }
  }

  return null;
});

const removeUndefined = (encoded: any) => {
  for (const key in Object.keys(encoded)) {
    if (encoded[key] === undefined) {
      delete encoded[key];
    }
  }
  return encoded;
};
