import {Default} from '#src/disreact/codec/intrinsic/select/default.ts';
import {Keys} from '#src/disreact/codec/intrinsic/keys.ts';
import {declareHandlerElem, declareProps} from '#src/disreact/codec/intrinsic/util.ts';
import {Declare} from '#src/disreact/model/declare.ts';
import type {Elem} from '#src/disreact/model/elem/elem.ts';
import * as S from 'effect/Schema';
import {DAPI} from 'src/disreact/codec/dapi/dapi.ts';

export * as Mentions from '#src/disreact/codec/intrinsic/select/mentions.ts';
export type Mentions = never;

export const TAG  = 'mentions',
             NORM = Keys.components;

export const EventData = S.Struct({
  data: DAPI.Component.MentionableSelectData,
});

export const Handler = Declare.handler(EventData);

export const Children = S.Union(
  Default.Element,
);

export const Attributes = declareProps(
  S.Struct({
    custom_id      : S.optional(S.String),
    placeholder    : S.optional(S.String),
    min_values     : S.optional(S.Number),
    max_values     : S.optional(S.Number),
    disabled       : S.optional(S.Boolean),
    [Keys.onselect]: Handler,
  }),
);

export const Element = declareHandlerElem(
  TAG,
  Attributes,
  Handler,
);

export const encode = (self: Elem.Rest, acc: any) => {
  return {
    type      : DAPI.Component.ACTION_ROW,
    components: [{
      type          : DAPI.Component.MENTION_SELECT,
      custom_id     : self.props.custom_id ?? self.ids,
      placeholder   : self.props.label ?? acc[Keys.primitive]?.[0],
      min_values    : self.props.min_values,
      max_values    : self.props.max_values,
      default_values: self.props.default_values ?? acc[Keys.default_values]?.[0],
      disabled      : self.props.disabled,
    }],
  };
};
