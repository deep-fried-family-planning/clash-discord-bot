import {declareElem, declareProps} from '#src/disreact/codec/elem/util.ts';
import {S} from '#src/disreact/utils/re-exports.ts';
import type {Elem} from '#src/disreact/model/elem/elem.ts';
import { Keys } from '../keys';

export * as MaskAnchor from '#src/disreact/codec/elem/markdown/mask.ts';
export type MaskAnchor = never;

export const TAG  = 'mask',
             NORM = TAG;

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
    return `[${acc[Keys.primitive][0]}](${self.props.href})`;
  }
  return `[${acc[Keys.primitive][0]}](<${self.props.href}>)`;
};
