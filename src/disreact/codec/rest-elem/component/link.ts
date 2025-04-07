import {Keys} from '#src/disreact/codec/rest-elem/keys.ts'
import {Emoji} from '#src/disreact/codec/rest-elem/markdown/emoji.ts'
import {declareElem, declareProps} from '#src/disreact/codec/rest-elem/util.ts'
import {S} from '#src/disreact/utils/re-exports.ts'
import type {Elem} from '#src/disreact/model/entity/elem.ts'
import {DAPIComponent} from '#src/disreact/codec/dapi/dapi-component'

export * as Link from '#src/disreact/codec/rest-elem/component/link.ts'
export type Link = never

export const TAG  = 'link',
             NORM = Keys.buttons

export const Children = S.Union(
  S.String,
  Emoji.Element,
)

export const Attributes = declareProps(
  S.Struct({
    url     : S.String,
    label   : S.optional(S.String),
    emoji   : S.optional(Emoji.Attributes),
    disabled: S.optional(S.Boolean),
  }),
)

export const Element = declareElem(
  TAG,
  Attributes,
)

export const encode = (self: Elem, acc: any) => {
  return {
    type    : DAPIComponent.BUTTON,
    style   : DAPIComponent.LINK,
    url     : self.props.url,
    label   : self.props.label ?? acc[Keys.primitive]?.[0],
    emoji   : self.props.emoji ?? acc[Keys.emoji]?.[0],
    disabled: self.props.disabled,
  }
}
