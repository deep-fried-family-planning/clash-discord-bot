import {Ar, Kv, p, pipe} from '#src/internal/pure/effect.ts';
import type {num, str} from '#src/internal/pure/types-pure.ts';
import {inject as routeInject, parse as routeParse} from 'regexparam';


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
      throw new Error();
    }

    const parsed = parser.pattern.exec(id);

    if (!parsed) {
      throw new Error();
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
    ) as { [k in keyof P]: str };
  };
};


export const build = <P extends ParamsBase>(routes: str[]) => {
  const routeParsers = routes.map(makeParser);

  return (p: { [k in keyof P]: str }) => {
    const defined = pipe(p, Kv.filter((v) => !!v));
    const keys    = [...Kv.keys(defined)];

    const parser = routeParsers.find((rP) =>
      (rP.keys.length === keys.length || rP.keys.length === keys.length - 1)
      && rP.keys.every((k) => keys.includes(k)),
    );

    if (!parser) {
      throw new Error();
    }

    return routeInject(parser.template, defined);
  };
};


export const set = <
  P extends ParamsBase,
>(
  a: keyof P, b: P[typeof a] | str | num,
) => (
  c: { [k in keyof P]: str | num },
) => {
  const ope = {...c};

  ope[a] = b;
  return ope as { [k in keyof P]: str };
};
