/* eslint-disable @typescript-eslint/only-throw-error */

import {Ar, Kv, p, pipe} from '#src/internal/pure/effect.ts';
import {inject as routeInject, parse as routeParse} from 'regexparam';
import type {str} from '#src/internal/pure/types-pure.ts';
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
                title  : 'No Implementation',
                message: 'You interacted with a message that is either outdated or not fully implemented.',
            });
        }

        const parsed = parser.pattern.exec(id);

        if (!parsed) {
            throw new ParamsError({
                title  : 'Bad Implementation',
                message: 'Someone wrote some bad code...',
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
        ) as P;
    };
};


export const build = <P extends ParamsBase>(routes: str[]) => {
    const routeParsers = routes.map(makeParser);

    return (p: P) => {
        const defined = pipe(p, Kv.filter((v) => !!v));
        const keys = Kv.keys(defined);

        const parser = routeParsers.find((rP) =>
            rP.keys.length === keys.length
            && rP.keys.every((k) => keys.includes(k)),
        );

        if (!parser) {
            throw new ParamsError({
                title  : 'No Implementation',
                message: 'You interacted with a message that is either outdated or not fully implemented.',
            });
        }

        return routeInject(parser.template, defined);
    };
};


export const set = <P extends ParamsBase, T extends keyof P = keyof P>(a: T, b: P[T]) => (c: P) => {
    c[a] = b;
    return c;
};


