import {Keys} from '#src/disreact/codec/rest-elem/keys.ts'
import {Emoji} from '#src/disreact/codec/rest-elem/markdown/emoji.ts'
import {declareHandlerElem, declareProps} from '#src/disreact/codec/rest-elem/util.ts'
import type {Elem} from '#src/disreact/model/entity/elem.ts'
import {Events} from '#src/disreact/model/entity/events'
import {S} from '#src/disreact/utils/re-exports.ts'
import {DAPI} from '../../dapi/dapi'

export * as Primary from '#src/disreact/codec/rest-elem/component/primary.ts'
export type Primary = never

export const TAG  = 'primary',
             NORM = Keys.buttons

export const EventData = S.Struct({
  data: DAPI.Component.ButtonData,
})

export const Handler = Events.declareHandler(EventData)

export const Children = S.Union(
  S.String,
  Emoji.Element,
)

export const Attributes = declareProps(
  S.Struct({
    custom_id     : S.optional(S.String),
    label         : S.optional(S.String),
    [Keys.onclick]: Handler,
  }),
)

export const Element = declareHandlerElem(
  TAG,
  Attributes,
  Handler,
)

export const encode = (self: Elem, acc: any) => {
  return {
    type     : DAPI.Component.BUTTON,
    custom_id: self.props.custom_id ?? self.ids,
    style    : DAPI.Component.PRIMARY,
    label    : self.props.label ?? acc[Keys.primitive]?.[0],
    emoji    : self.props.emoji ?? acc[Keys.emoji]?.[0],
    disabled : self.props.disabled,
  }
}
