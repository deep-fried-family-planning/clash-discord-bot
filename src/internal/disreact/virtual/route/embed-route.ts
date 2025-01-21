import {D} from '#pure/effect';
import {DFFP_URL} from '#src/constants/dffp-alias.ts';
import {Templating} from '#src/internal/disreact/virtual/route/index.ts';
import type {mut, str} from '#src/internal/pure/types-pure.ts';


const template = '/:type/:ref';

export type T = D.TaggedEnum<{
  EmbedRoute: Templating.Common<typeof template>;
}>;

const internal = D.taggedEnum<T>();

const T = Templating.makeTemplate(template, internal.EmbedRoute);

export const empty  = T.empty;
export const decode = T.decode;
export const encode = T.encode;


export const setSearch = (search: URLSearchParams) => (er: T) => {
  (er as mut<typeof er>).query = new URLSearchParams(search);
  return er;
};

export const setRef = (rf: str) => (mr: T) => {
  mr.params.ref = rf;
  return mr;
};


export const encodeUrl = (er: T) => {
  const url    = new URL(DFFP_URL);
  url.pathname = encode(er);
  if (er.query) {
    url.search = er.query.toString();
  }
  return url.href;
};
