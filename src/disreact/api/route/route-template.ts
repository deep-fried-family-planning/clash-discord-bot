import {__DISREACT_NONE} from '#src/disreact/api/constants.ts';
import type {rec} from '#src/internal/pure/pure.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import {inject, parse} from 'regexparam';


export type Common<A extends str> = {
  original?: str;
  query?   : URLSearchParams;
  params   : Parameters<typeof inject<A>>[1];
};


export const makeTemplate = <
  Template extends str,
  Params extends Parameters<typeof inject<Template>>[1],
  Builder extends (input: {original?: str; params: Params}) => Common<Template>,
>(
  template: Template,
  builder: Builder,
) => {
  const parser = parse(template);

  const empty = () => {
    const acc = {} as rec<str>;
    for (const k of parser.keys) {
      acc[k] = __DISREACT_NONE;
    }
    return builder({params: acc as Params}) as ReturnType<Builder>;
  };

  const encode = (input: Parameters<Builder>[0]) => {
    const params = input.params as rec<str>;
    const acc    = {} as rec<str>;
    for (const k of parser.keys) if (params[k]) acc[k] ??= params[k];
    return inject(template, input.params);
  };

  const decode = (path?: str) => {
    if (!path) return null;
    if (!parser.pattern.test(path)) return null;
    const [, ...matches] = parser.pattern.exec(path)!;
    const acc            = {} as rec<str>;
    let idx              = 0;
    for (const k of parser.keys) acc[k] ??= matches[idx++];
    return builder({original: path, params: acc as Params}) as ReturnType<Builder>;
  };

  return {builder, empty, encode, decode} as const;
};
