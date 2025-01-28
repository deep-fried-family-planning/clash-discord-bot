import {NONE} from '#src/disreact/api/constants.ts';
import { Rest} from '#src/disreact/api/index.ts';
import {Defer} from '#src/disreact/api/index.ts';
import {CriticalFailure} from '#src/disreact/enum/errors.ts';
import {decodeHooks, type HookStates} from '#src/disreact/model/hooks/hook-state.ts';
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
    for (const k of keys) acc[k] = NONE;
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


const main = makeRoute('/dr/:root/:node/:id/:defer/:ttl');


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
  return {
    defer : Defer.decodeDefer(params.defer),
    params,
    search: new URLSearchParams(),
  };
});


export type FullRouting = {
  params: Main;
  defer : Defer.Defer;
  search: URLSearchParams;
  states: HookStates;
};


export const decodeUrl = (rest: Rest.Interaction) => E.gen(function * () {
  if (rest.type === Rest.InteractionType.MESSAGE_COMPONENT) {
    if (!rest.message?.embeds[0].image?.url) return yield * new CriticalFailure();

    const url    = new URL(rest.message.embeds[0].image.url);
    const parsed = yield * decodePath(url.pathname);

    return {
      ...parsed,
      search: url.searchParams,
      states: decodeHooks(url.searchParams),
    } satisfies FullRouting;
  }

  if (rest.type === Rest.InteractionType.MODAL_SUBMIT) {
    if (!('data' in rest)) return yield * new CriticalFailure();
    if (!('custom_id' in rest.data)) return yield * new CriticalFailure();

    const parsed = yield * decodePath(rest.data.custom_id);

    return {
      ...parsed,
      states: {},
    } satisfies FullRouting;
  }

  return yield * new CriticalFailure();
});
