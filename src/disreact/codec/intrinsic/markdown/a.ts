import {declareElem, declareProps} from '#src/disreact/codec/intrinsic/util.ts';
import {S} from '#src/disreact/utils/re-exports.ts';
import type {Elem} from '#src/disreact/model/elem/elem.ts';
import { Keys } from '../keys';

export * as Anchor from '#src/disreact/codec/intrinsic/markdown/a.ts';
export type Anchor = never;

export const TAG  = 'a',
             NORM = Keys.primitive;

export const Children = S.Union(
  S.String,
);

export const Attributes = declareProps(
  S.Struct({
    href : S.String,
    embed: S.optional(S.Boolean),
  }),
);

export const Element = declareElem(
  TAG,
  Attributes,
);

export const encode = (self: Elem.Rest, acc: any) => {
  if (self.props.embed) {
    return `${self.props.href}`;
  }
  return `<${self.props.href}>`;
};
