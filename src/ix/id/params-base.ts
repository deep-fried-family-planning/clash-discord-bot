/* eslint-disable @typescript-eslint/only-throw-error */


import {Ar, Kv, p, pipe} from '#src/internal/pure/effect.ts';
import {inject as routeInject, parse as routeParse} from 'regexparam';
import type {num, str} from '#src/internal/pure/types-pure.ts';
import {ParamsError} from '#src/ix/id/params-error.ts';


export type ParamsBase<T extends str = str> = {
    [k in T]: str
};


const makeParser = (route: str) => {
    const parser = routeParse(route);

    return {
        template: route,
        keys    : parser.keys,
        pattern : parser.pattern,
    };
};


export const parse = <P extends ParamsBase>(routes: str[]) => {
    const routeParsers = routes.map(makeParser);

    return (id: str) => {
        const parser = routeParsers.find((rP) => rP.pattern.test(id));

        if (!parser) {
            throw new ParamsError({
                title  : 'RoutingParse',
                message: '[No Implementation] You interacted with a message that is either outdated or not fully implemented.',
                params : id,
            });
        }

        const parsed = parser.pattern.exec(id);

        if (!parsed) {
            throw new ParamsError({
                title  : 'RoutingParse',
                message: '[Bad Implementation] Someone wrote some bad code...',
                params : id,
            });
        }

        const [, ...matches] = parsed;

        return p(
            parser.keys,
            Ar.reduce(
                Kv.empty<str, str>(),
                (ps, p, idx) => {
                    ps[p] ??= matches[idx];
                    return ps;
                },
            ),
        ) as {[k in keyof P]: str};
    };
};


export const build = <P extends ParamsBase>(routes: str[]) => {
    const routeParsers = routes.map(makeParser);

    return (p: {[k in str]: str}) => {
        const defined = pipe(p, Kv.filter((v) => !!v));
        const keys = Kv.keys(defined);

        const parser = routeParsers.find((rP) =>
            rP.keys.length === keys.length
            && rP.keys.every((k) => keys.includes(k)),
        );

        if (!parser) {
            throw new ParamsError({
                title  : 'RoutingBuild',
                message: '[No Implementation] You interacted with a message that is either outdated or not fully implemented.',
                params : p,
            });
        }

        return routeInject(parser.template, defined);
    };
};


export const set = <
    P extends ParamsBase,
>(
    a: keyof P, b: P[typeof a] | str | num,
) => (
    c: {[k in keyof P]: str | num},
) => {
    const ope = {...c};

    ope[a] = b;
    return ope as {[k in keyof P]: str};
};


