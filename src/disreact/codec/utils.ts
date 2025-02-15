import {NONE_STR} from '#src/disreact/codec/abstract/index.ts';
import {DT, OPT} from '#src/internal/pure/effect.ts';
import type {rec} from '#src/internal/pure/pure.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import {flow} from 'effect';
import {inject, parse as makeParser, type RouteParams} from 'regexparam';



export const makeRoute = <A extends string>(template: A) => {
  type Params = RouteParams<A>;
  const {keys, pattern} = makeParser(template);

  return {
    Type: null as unknown as Params,
    template,
    keys,
    test: (input: string) => pattern.test(input),

    empty: () => {
      const acc = {} as rec<str>;
      for (const k of keys) acc[k] = NONE_STR;
      return acc as Params;
    },

    decode: (input: string) => {
      const result = pattern.exec(input);
      if (!result) return null;
      const acc = {} as rec<str>;
      for (let i = 0; i < keys.length; i++) acc[keys[i]] ??= result[i + 1];
      return acc as Params;
    },

    encode: (params: Params) => inject<A>(template, params),
  };
};



export const makeDateTime = flow(DT.make, OPT.getOrThrow);
