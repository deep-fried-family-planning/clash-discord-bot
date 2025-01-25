// import {inject, parse} from 'regexparam';
// import {NONE} from 'src/internal/disreact/virtual/kinds/constants.ts';
// import type {alias, str} from 'src/internal/pure/types-pure.ts';
//
//
//
// export type Common<A extends str> = {
//   original?: str;
//   query?   : URLSearchParams;
//   params   : Parameters<typeof inject<A>>[1];
// };
//
//
// export const makeTemplate = <
//   Template extends str,
//   Params extends Parameters<typeof inject<Template>>[1],
//   Builder extends (input: {original?: str; params: Params}) => Common<Template>,
// >(
//   template: Template,
//   builder: Builder,
// ) => {
//   const parser = parse(template);
//
//   const empty = () => {
//     const acc = {} as alias;
//     for (const k of parser.keys) {
//       acc[k] = NONE;
//     }
//     return builder({params: acc as Params}) as ReturnType<Builder>;
//   };
//
//   const encode = (input: Parameters<Builder>[0]) => {
//     const params = input.params as alias;
//     const acc    = {} as alias;
//     for (const k of parser.keys) if (params[k]) acc[k] ??= params[k];
//     return inject(template, input.params);
//   };
//
//   const decode = (path?: str) => {
//     if (!path) return null;
//     if (!parser.pattern.test(path)) return null;
//     const [, ...matches] = parser.pattern.exec(path)!;
//     const acc            = {} as alias;
//     let idx              = 0;
//     for (const k of parser.keys) acc[k] ??= matches[idx++];
//     return builder({original: path, params: acc as Params}) as ReturnType<Builder>;
//   };
//
//   return {builder, empty, encode, decode} as const;
// };
