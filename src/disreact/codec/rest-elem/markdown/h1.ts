import {declareElem, declareProps} from '#src/disreact/codec/rest-elem/util.ts';
import {S} from '#src/disreact/utils/re-exports.ts';
import type {Elem} from '#src/disreact/model/entity/elem.ts';
import { Keys } from '../keys';

export * as H1 from '#src/disreact/codec/rest-elem/markdown/h1.ts';
export type H1 = never;

export const TAG  = 'h1',
             NORM = Keys.primitive;

export const Children = S.Union(
  S.String,
);

export const Attributes = declareProps(
  S.Struct({}),
);

export const Element = declareElem(
  TAG,
  Attributes,
);

export const encode = (self: Elem, acc: any) => {
  return `# ${acc[Keys.primitive][0]}`;
};
