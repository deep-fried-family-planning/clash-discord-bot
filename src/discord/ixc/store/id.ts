import {inject} from 'regexparam';
import type {str} from '#src/internal/pure/types-pure.ts';
import {pipe} from '#src/internal/pure/effect.ts';
import {filterL, reduceL} from '#src/internal/pure/pure-list.ts';
import {emptyKV, keysKv} from '#src/internal/pure/pure-kv.ts';
import type {RDXT} from '#src/discord/ixc/store/types.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {ID_ROUTES, type Route, type RouteParams, DELIM} from '#src/discord/ixc/store/id-routes.ts';


export const parseCustomId = (custom_id: str) => {
    const route = ID_ROUTES.find((r) => r.pattern.test(custom_id));

    if (!route) {
        return {
            custom_id,
            template: '',
            params  : {
                kind: RDXK.CLOSE,
                data: [],
            },
            predicate    : RDXK.CLOSE,
            nextPredicate: RDXK.CLOSE,
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
            kind: params.kind as RDXK,
            type: params.type as RDXT,
            data: 'data' in params
                ? params.data.split(DELIM.DATA).map((d) => d.replaceAll(DELIM.PIPE, DELIM.SLASH))
                : [],
            nextKind: params.nextKind as RDXK,
            nextType: params.nextType as RDXT,
            forward : params.forward,
        },
        predicate    : `${params.kind}/${params.type}`,
        nextPredicate: `${params.nextKind}/${params.nextType}`,
    } as const satisfies Route;
};


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
