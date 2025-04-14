import {declareElem, declareProps} from '#src/disreact/codec/rest-elem/util.ts';
import {S} from '#src/disreact/utils/re-exports.ts';
import type {Elem} from '#src/disreact/model/entity/elem.ts';
import { Keys } from '../keys';

export * as H2 from '#src/disreact/codec/rest-elem/markdown/h2.ts';
export type H2 = never;

export const TAG  = 'h2',
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
  return `## ${acc[Keys.primitive][0]}`;
};
