import {D} from '#pure/effect';
import {Templating} from 'src/internal/disreact/virtual/route/index.ts';



const template = '/:ref/:row/:col';

export type T = D.TaggedEnum<{
  ComponentRoute: Templating.Common<typeof template>;
}>;

const internal = D.taggedEnum<T>();

const T = Templating.makeTemplate(template, internal.ComponentRoute);

export const empty  = T.empty;
export const decode = T.decode;
export const encode = T.encode;
