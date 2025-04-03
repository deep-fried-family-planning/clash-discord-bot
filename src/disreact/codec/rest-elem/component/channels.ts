import {Default} from '#src/disreact/codec/rest-elem/component/default.ts'
import {Keys} from '#src/disreact/codec/rest-elem/keys.ts'
import {declareEvent, declareHandler, declareHandlerElem, declareProps} from '#src/disreact/codec/rest-elem/util.ts'
import {S} from '#src/disreact/codec/re-exports.ts'
import type {Elem} from '#src/disreact/model/entity/elem.ts'
import {DAPIComponent} from '../../rest/dapi-component'

export * as Channels from '#src/disreact/codec/rest-elem/component/channels.ts'
export type Channels = never

export const TAG  = 'channels',
             NORM = Keys.components

export const Event = declareEvent(
  TAG,
  S.Struct({}),
  DAPIComponent.ChannelSelectData,
)

export const Handler = declareHandler(Event)

export const Children = S.Union(
  Default.Element,
)

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
)

export const Element = declareHandlerElem(
  TAG,
  Attributes,
  Handler,
)

export const encode = (self: Elem, acc: any) => {
  return {
    type      : DAPIComponent.ACTION_ROW,
    components: [{
      type          : DAPIComponent.CHANNEL_SELECT,
      custom_id     : self.props.custom_id ?? self.ids,
      placeholder   : self.props.placeholder ?? acc[Keys.primitive]?.[0],
      min_values    : self.props.min_values,
      max_values    : self.props.max_values,
      channel_types : self.props.channel_types,
      default_values: self.props.default_values ?? acc[Keys.default_values],
      disabled      : self.props.disabled,
    }],
  }
}
