// import {D, pipe} from '#pure/effect';
// import {DFFP_URL} from 'src/constants/dffp-alias.ts';
// import type {DA} from 'src/internal/disreact/virtual/entities/index.ts';
// import {Err} from 'src/internal/disreact/virtual/kinds/index.ts';
// import {Templating} from 'src/internal/disreact/virtual/route/index.ts';
// import type {mut, str} from 'src/internal/pure/types-pure.ts';
//
//
//
// const template = '/:root/:node/:ref/:id/:active/:defer';
//
// export type T = D.TaggedEnum<{
//   MainRoute: Templating.Common<typeof template>;
// }>;
//
// const internal = D.taggedEnum<T>();
//
// const T = Templating.makeTemplate(template, internal.MainRoute);
//
// export const empty = T.empty;
// export const decode = T.decode;
// export const encode = T.encode;
//
//
// export const setSearch = (search: URLSearchParams) => (mr: T) => {
//   (mr as mut<typeof mr>).query = new URLSearchParams(search);
//   return mr;
// };
//
// export const setRoot = (root: str) => (mr: T) => {
//   mr.params.root = root;
//   return mr;
// };
//
// export const setNode = (node: str) => (mr: T) => {
//   mr.params.node = node;
//   return mr;
// };
//
// export const setId = (id: str) => (mr: T) => {
//   mr.params.id = id;
//   return mr;
// };
//
// export const setActive = (active: str) => (mr: T) => {
//   mr.params.active = active;
//   return mr;
// };
//
// export const setDefer = (defer: str) => (mr: T) => {
//   mr.params.defer = defer;
//   return mr;
// };
//
// export const setRef = (rf: str) => (mr: T) => {
//   mr.params.ref = rf;
//   return mr;
// };
//
//
// export const decodeFromMainEmbed = (rest: DA.Ix) => {
//   const main = rest.message?.embeds.at(0)?.image?.url;
//
//   if (!main) {
//     throw new Err.Critical();
//   }
//
//   return decodeUrl(main);
// };
//
//
// export const decodeUrl = (encoded: str) => {
//   const url = new URL(encoded);
//
//   return pipe(
//     decode(url.pathname) ?? empty(),
//     setSearch(url.searchParams),
//   );
// };
//
//
// export const encodeUrl = (route: T) => {
//   if (!route.query) {
//     throw new Err.Critical();
//   }
//   const url = new URL(DFFP_URL);
//   url.pathname = encode(route);
//   url.search = route.query.toString();
//   return url.href;
// };
