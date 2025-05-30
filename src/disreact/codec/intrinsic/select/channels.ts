import {Default} from '#src/disreact/codec/intrinsic/select/default.ts';
import {Keys} from '#src/disreact/codec/intrinsic/keys.ts';
import {declareHandlerElem, declareProps} from '#src/disreact/codec/intrinsic/util.ts';
import {Declare} from '#src/disreact/mode/schema/declare.ts';
import type {Elem} from '#src/disreact/model/elem/elem.ts';
import * as S from 'effect/Schema';
import {DAPI} from 'src/disreact/codec/dapi/dapi.ts';

export * as Channels from '#src/disreact/codec/intrinsic/select/channels.ts';
export type Channels = never;

export const TAG  = 'channels',
             NORM = Keys.components;

export const EventData = S.Struct({
  data: DAPI.Component.ChannelSelectData,
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
    channel_types  : S.optional(S.Array(S.Int)),
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
      type          : DAPI.Component.CHANNEL_SELECT,
      custom_id     : self.props.custom_id ?? self.ids,
      placeholder   : self.props.placeholder ?? acc[Keys.primitive]?.[0],
      min_values    : self.props.min_values,
      max_values    : self.props.max_values,
      channel_types : self.props.channel_types,
      default_values: self.props.default_values ?? acc[Keys.default_values],
      disabled      : self.props.disabled,
    }],
  };
};
