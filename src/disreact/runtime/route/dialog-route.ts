import {D} from '#pure/effect';
import {Templating} from '#disreact/runtime/route/index.ts';
import type {str} from '#src/internal/pure/types-pure.ts';



const template = '/:root/:node/:id/:active/:defer';

export type T = D.TaggedEnum<{
  DialogRoute: Templating.Common<typeof template>;
}>;

const internal = D.taggedEnum<T>();

const T = Templating.makeTemplate(template, internal.DialogRoute);


export const empty  = T.empty;
export const decode = T.decode;
export const encode = T.encode;


export const setRoot = (root: str) => (mr: T) => {
  mr.params.root = root;
  return mr;
};

export const setNode = (node: str) => (mr: T) => {
  mr.params.node = node;
  return mr;
};

export const setId = (id: str) => (mr: T) => {
  mr.params.id = id;
  return mr;
};

export const setActive = (active: str) => (mr: T) => {
  mr.params.active = active;
  return mr;
};

export const setDefer = (defer: str) => (mr: T) => {
  mr.params.defer = defer;
  return mr;
};
