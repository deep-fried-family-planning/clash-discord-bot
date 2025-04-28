import {DELIM_DATA, DELIM_PIPE, DELIM_SLASH} from '#src/internal/discord-old/constants/delim.ts';
import {ID_ROUTES, type Route, type RouteParams} from '#src/internal/discord-old/store/id-routes.ts';
import {idPredicate} from '#src/internal/discord-old/store/id.ts';
import {pipe} from '#src/internal/pure/effect.ts';
import {keysKv} from '#src/internal/pure/pure-kv.ts';
import {filterL} from '#src/internal/pure/pure-list.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import {inject} from 'regexparam';

export const toId = (params: RouteParams): Route => {
  const redefined = {
    ...params,
    data: params.data?.map((d) => d.replaceAll(DELIM_SLASH, DELIM_PIPE)).join(DELIM_DATA),
  } as const;

  const defined = pipe(
    redefined,
    Object.entries,
    filterL(([, v]) => Boolean(v)),
    Object.fromEntries,
  ) as Record<str, str>;

  const route = pipe(
    defined,
    keysKv,
    (ks) => ID_ROUTES.find((r) => r.keys.length === ks.length && r.keys.every((k) => ks.includes(k))),
  );

  return {
    custom_id    : inject(route!.template, defined as Omit<RouteParams, 'data'> & {data: string}),
    template     : route!.template,
    params,
    predicate    : idPredicate(params.kind, params.type),
    nextPredicate: idPredicate(params.nextKind, params.nextType),
    backPredicate: idPredicate(params.backKind, params.backType),
  } as const satisfies Route;
};
