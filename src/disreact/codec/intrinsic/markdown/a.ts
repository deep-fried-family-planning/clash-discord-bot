import {declareElem, declareProps} from '#src/disreact/codec/intrinsic/util.ts';

import * as S from 'effect/Schema';
import {Keys} from '../keys';

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

export const encode = (self: any, acc: any) => {
  if (self.props.embed) {
    return `${self.props.href}`;
  }
  return `<${self.props.href}>`;
};
