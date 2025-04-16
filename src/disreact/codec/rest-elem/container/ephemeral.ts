import {Util} from '#src/disreact/codec/rest-elem/util.ts';
import type {Elem} from '#src/disreact/model/elem/elem.ts';
import {S} from '#src/internal/pure/effect';
import { Keys } from '../keys';

export * as Ephemeral from '#src/disreact/codec/rest-elem/container/ephemeral.ts';
export type Ephemeral = never;

export const TAG  = 'ephemeral',
             NORM = TAG;

export const Attributes = Util.declareProps(
  S.Struct({
    content: S.optional(S.String),
    flags  : S.optional(S.Number),
  }),
);

export const Element = Util.declareElem(
  TAG,
  Attributes,
);

export const encode = (self: Elem.Rest, acc: any) => {
  return {
    content   : self.props.content ?? acc[Keys.primitive]?.[0] ?? undefined,
    embeds    : acc[Keys.embeds],
    components: acc[Keys.components],
    flags     : 64,
  };
};
