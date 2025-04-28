import {DELIM_DATA, DELIM_PIPE, DELIM_SLASH} from '#src/internal/discord-old/constants/delim.ts';
import {RK_CLOSE} from '#src/internal/discord-old/constants/route-kind.ts';
import {ID_ROUTES, type Route} from '#src/internal/discord-old/store/id-routes.ts';
import {idPredicate} from '#src/internal/discord-old/store/id.ts';
import {pipe} from '#src/internal/pure/effect.ts';
import {emptyKV} from '#src/internal/pure/pure-kv.ts';
import {reduceL} from '#src/internal/pure/pure-list.ts';
import type {str} from '#src/internal/pure/types-pure.ts';

export const fromId = (custom_id: str): Route => {
  const route = ID_ROUTES.find((r) => r.pattern.test(custom_id));

  if (!route) {
    return {
      custom_id,
      template: '',
      params  : {
        kind: RK_CLOSE,
        data: [],
      },
      predicate    : RK_CLOSE,
      nextPredicate: RK_CLOSE,
      backPredicate: RK_CLOSE,
    } as const satisfies Route;
  }

  const [, ...matches] = route.pattern.exec(custom_id)!;

  const params = pipe(
    route.keys,
    reduceL(emptyKV<string, string>(), (ks, k, idx) => {
      ks[k] ??= matches[idx];
      return ks;
    }),
  );

  return {
    custom_id,
    template: route.template,
    params  : {
      kind: params.kind,
      type: params.type,
      data: 'data' in params
        ? params.data.split(DELIM_DATA).map((d) => d.replaceAll(DELIM_PIPE, DELIM_SLASH))
        : [],
      nextKind: params.nextKind,
      nextType: params.nextType,
      forward : params.forward,
    },
    predicate    : idPredicate(params.kind, params.type),
    nextPredicate: idPredicate(params.nextKind, params.nextType),
    backPredicate: idPredicate(params.backKind, params.backType),
  } as const satisfies Route;
};
