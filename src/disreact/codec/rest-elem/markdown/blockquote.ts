import {Keys} from '#src/disreact/codec/rest-elem/keys.ts';
import {declareElem, declareProps} from '#src/disreact/codec/rest-elem/util.ts';
import {S} from '#src/disreact/utils/re-exports.ts';
import type {Elem} from '#src/disreact/model/elem/elem.ts';

export * as BlockQuote from '#src/disreact/codec/rest-elem/markdown/blockquote.ts';
export type BlockQuote = never;

export const TAG  = 'blockquote',
             NORM = Keys.primitive;

export const Children = S.Union(
  S.String,
);

export const Attributes = declareProps(
  S.Struct({

  }),
);

export const Element = declareElem(
  TAG,
  Attributes,
);

export const encode = (self: Elem.Rest, acc: any) => {
  return {};
};
