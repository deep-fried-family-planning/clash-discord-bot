import {Keys} from '#src/disreact/codec/rest-elem/keys.ts'
import {Emoji} from '#src/disreact/codec/rest-elem/markdown/emoji.ts'
import {declareEvent, declareHandler, declareHandlerElem, declareProps} from '#src/disreact/codec/rest-elem/util.ts'
import {S} from '#src/disreact/utils/re-exports.ts'
import type {Elem} from '#src/disreact/model/entity/elem.ts'
import {DAPIComponent} from '#src/disreact/codec/dapi/dapi-component'

export * as Danger from '#src/disreact/codec/rest-elem/component/danger.ts'
export type Danger = never

export const TAG  = 'danger',
             NORM = Keys.buttons

export const Event = declareEvent(
  TAG,
  S.Struct({}),
  DAPIComponent.ButtonData,
)

export const Handler = declareHandler(Event)

export const Children = S.Union(
  S.String,
  Emoji.Element,
)

export const Attributes = declareProps(
  S.Struct({
    custom_id     : S.optional(S.String),
    label         : S.optional(S.String),
    emoji         : S.optional(Emoji.Attributes),
    disabled      : S.optional(S.Boolean),
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
    type     : DAPIComponent.BUTTON,
    custom_id: self.props.custom_id ?? self.ids,
    style    : DAPIComponent.DANGER,
    label    : self.props.label ?? acc[Keys.primitive]?.[0],
    emoji    : self.props.emoji ?? acc[Keys.emoji]?.[0],
    disabled : self.props.disabled,
  }
}
