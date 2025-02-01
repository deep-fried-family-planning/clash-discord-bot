import {NONE, Rest} from '#src/disreact/runtime/enum/index.ts';
import {DokenCache} from '#src/disreact/runtime/service/DokenCache.ts';
import {CriticalFailure } from '#src/disreact/runtime/service.ts';
import {E} from '#src/internal/pure/effect.ts';
import type {rec} from '#src/internal/pure/pure.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import {URL} from 'node:url';
import type {RouteParams} from 'regexparam';
import {inject, parse as makeParser} from 'regexparam';



const makeRoute = <A extends string>(template: A) => {
  type Params = RouteParams<A>;
  const {keys, pattern} = makeParser(template);

  const test = (input: string) => pattern.test(input);
  const exec = (input: string) => pattern.exec(input);

  const empty = () => {
    const acc = {} as rec<str>;
    for (const k of keys) acc[k] = NONE;
    return acc as Params;
  };

  const parse = (input: string) => {
    const result = exec(input);
    if (!result) return null;
    const acc = {} as rec<str>;
    for (let i = 0; i < keys.length; i++) acc[keys[i]] ??= result[i + 1];
    return acc as Params;
  };

  const build = (params: Params) => inject<A>(template, params);

  return {Type: null as unknown as Params, template, keys, test, exec, empty, parse, build};
};

const main = makeRoute('/jsx/:root/:node/:type/:flags/:id/:ttl/:token');

export type Main = typeof main.Type;

export const encodeAsPath = (params: rec<str>) => main.build(params as typeof main.Type);

export const encodeAsUrl = (params: rec<str>, search?: URLSearchParams) => {
  const url      = new URL('https://dffp.org');
  const pathname = encodeAsPath(params);
  url.pathname   = pathname;

  if (search) {
    url.search = search.toString();
  }
  return url.href;
};

const decodePath = (input: string) => E.gen(function * () {
  yield * E.logTrace('input', input);
  const params = main.parse(input);
  if (!params) {
    return yield * new CriticalFailure({});
  }
  yield * E.logTrace('params', params);

  if (params.id !== NONE) {
    yield * E.fork(DokenCache.lookup(params.id));
  }
  return params;
});

export type Routes = {
  params: Main;
  search: URLSearchParams;
};

export const decodeUrl = (rest: Rest.Interaction) => E.gen(function * () {
  if (rest.type === Rest.InteractionType.MESSAGE_COMPONENT) {
    if (!rest.message?.embeds[0].image?.url) {
      return yield * new CriticalFailure({});
    }
    const url    = new URL(rest.message.embeds[0].image.url);
    const params = yield * decodePath(url.pathname);

    return {params, search: url.searchParams} satisfies Routes;
  }
  if (!('data' in rest)) {
    return yield * new CriticalFailure({});
  }
  if (!('custom_id' in rest.data)) {
    return yield * new CriticalFailure({});
  }
  const params = yield * decodePath(rest.data.custom_id);

  return {params, search: new URLSearchParams()} satisfies Routes;
});
