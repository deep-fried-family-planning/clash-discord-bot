import {Ar, D, Kv, p, pipe} from '#pure/effect';
import type {num, str} from '#src/internal/pure/types-pure.ts';
import {inject, parse} from 'regexparam';


export class TemplatePathError extends D.TaggedError('TemplatePathError')<{
  system   : str;
  params   : object;
  serial   : str;
  original?: unknown;
  user?: {
    title  : str;
    message: str;
  };
  dev?: {
    title  : str;
    message: str;
  };
}> {}


export type Param = { [k in str]: str | num };


export type PathPattern = ReturnType<typeof makePathPattern>;


export const makePathPattern = (template: str) => {
  const parser = parse(template);

  return {
    template: template,
    keys    : parser.keys,
    pattern : parser.pattern,
  };
};


export const makePathBuilder = <A extends Param>(
  router: str,
  patterns: PathPattern[],
) => (
  params: A,
) => {
  const defined     = pipe(params, Kv.filter((v) => !!v));
  const definedKeys = Kv.keys(defined);

  const parser = patterns.find((pattern) => {
    const sameNumKeys                = pattern.keys.length === definedKeys.length;
    const sameNumKeysWithOptionalEnd = pattern.keys.length === definedKeys.length - 1;
    const allKeysSame                = pattern.keys.every((k) => definedKeys.includes(k));

    return (sameNumKeys || sameNumKeysWithOptionalEnd) && allKeysSame;
  });

  if (!parser) {
    throw new TemplatePathError({
      system: router,
      params: params,
      serial: '',
    });
  }

  return inject(parser.template, defined);
};


export const makePathParser = <A extends Param>(
  router: str,
  patterns: PathPattern[],
) => (
  serial: str,
): A => {
  const parser = patterns.find((pattern) => pattern.pattern.test(serial));

  if (!parser) {
    throw new TemplatePathError({
      system: router,
      params: {},
      serial: serial,
    });
  }

  const parsed = parser.pattern.exec(serial);

  if (!parsed) {
    throw new TemplatePathError({
      system: router,
      params: {},
      serial: serial,
    });
  }

  const [, ...matches] = parsed;

  return p(parser.keys, Ar.reduce(Kv.empty<str, str>(), (params, param, idx) => {
    params[param] ??= matches[idx];
    return params;
  })) as A;
};


export const mapParam = <A extends Param, B = A>(fa: (a: A) => B) => (a: A) => fa(a);


export const setParam = <A extends Param, B extends keyof A = keyof A>(key: B, val: A[B]) => (a: A) => {
  a[key] = val;
  return a;
};
