import {Keys} from '#src/disreact/codec/dapi-elem/keys.ts';
import {declareElem, declareProps} from '#src/disreact/codec/dapi-elem/util.ts';
import {S} from '#src/disreact/utils/re-exports.ts';
import type {Elem} from '#src/disreact/model/elem/elem.ts';

export * as Code from '#src/disreact/codec/dapi-elem/markdown/code.ts';
export type Code = never;

export const TAG  = 'code',
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

export const encode = (self: Elem.Rest, acc: any) => {
  return `\`${acc[Keys.primitive][0]}\``;
};
