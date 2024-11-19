import {DELIM, ID_ROUTES, type Route, type RouteParams} from '#src/discord/ixc/store/id-routes.ts';
import {pipe} from '#src/internal/pure/effect.ts';
import {filterL} from '#src/internal/pure/pure-list.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import {keysKv} from '#src/internal/pure/pure-kv.ts';
import {inject} from 'regexparam';


export const buildCustomId = (params: RouteParams) => {
    const redefined = {
        ...params,
        data: params.data?.map((d) => d.replaceAll(DELIM.SLASH, DELIM.PIPE)).join(DELIM.DATA),
    } as const;

    const defined = pipe(
        redefined,
        Object.entries,
        filterL(([,v]) => Boolean(v)),
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
        predicate    : `${params.kind}/${params.type}`,
        nextPredicate: `${params.nextKind}/${params.nextType}`,
    } as const satisfies Route;
};
