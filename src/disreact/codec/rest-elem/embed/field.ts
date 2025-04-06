import {declareElem, declareProps} from '#src/disreact/codec/rest-elem/util.ts'
import {S} from '#src/disreact/utils/re-exports.ts'
import {Keys} from '#src/disreact/codec/rest-elem/keys.ts'
import type {Elem} from '#src/disreact/model/entity/elem.ts'

export * as Field from '#src/disreact/codec/rest-elem/embed/field.ts'
export type Field = never

export const TAG = 'field',
             NORM = Keys.fields

export const Children = S.Undefined

export const Attributes = declareProps(
  S.Struct({
    name  : S.String,
    value : S.optional(S.String),
    inline: S.optional(S.Boolean),
  }),
)

export const Element = declareElem(
  TAG,
  Attributes,
)

export const encode = (self: Elem, acc: any) => {
  return {
    name  : self.props.name,
    value : self.props.value ?? acc[Keys.primitive]?.join(''),
    inline: self.props.inline,
  }
}
