import {__DISREACT_NONE} from '#src/disreact/api/constants.ts';
import {CriticalFailure} from '#src/disreact/enum/errors.ts';
import {E} from '#src/internal/pure/effect.ts';
import type {rec} from '#src/internal/pure/pure.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {RouteParams} from 'regexparam';
import {inject, parse as makeParser} from 'regexparam';



const makeRoute = <A extends string>(template: A) => {
  type Params = RouteParams<A>;
  type Keys = (keyof Params)[];

  const {keys, pattern} = makeParser(template);

  const test = (input: string) => pattern.test(input);
  const exec = (input: string) => pattern.exec(input);

  const empty = () => {
    const acc = {} as rec<str>;
    for (const k of keys) acc[k] = __DISREACT_NONE;
    return acc as Params;
  };

  const parse = (input: string) => {
    const acc    = {} as rec<str>;
    const result = exec(input);
    if (!result) return null;
    for (let i = 0; i < keys.length; i++) acc[keys[i]] ??= result[i + 1];
    return acc as Params;
  };

  const build = (params: Params) => {
    return inject<A>(template, params);
  };

  return {
    Type: null as unknown as Params,
    template,
    keys: keys as Keys,
    test,
    exec,
    empty,
    parse,
    build,
  } as const;
};


const main = makeRoute('/dr/:root/:node/:id/:defer');


export type Main = typeof main.Type;


export const encodeAsPath = (params: rec<str>) => {
  return main.build(params as typeof main.Type);
};


export const encodeAsUrl = (params: rec<str>, search?: URLSearchParams) => {
  const url      = new URL('https://dffp.org');
  const pathname = encodeAsPath(params);
  url.pathname   = pathname;
  if (search) {
    url.search = search.toString();
  }
  return url.href;
};


export const decodePath = (input: string) => E.gen(function * () {
  const params = main.parse(input);
  if (!params) return yield * new CriticalFailure();
  return params;
});


export const decodeUrl = (input: string) => E.gen(function * () {
  const url    = new URL(input);
  const params = yield * decodePath(url.pathname);
  return {
    params,
    search: url.searchParams,
  };
});
