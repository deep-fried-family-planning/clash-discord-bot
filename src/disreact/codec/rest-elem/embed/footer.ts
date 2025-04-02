import {declareElem, declareProps} from '#src/disreact/codec/rest-elem/util.ts'
import {S} from '#src/disreact/re-exports.ts'
import {Keys} from '#src/disreact/codec/rest-elem/keys.ts'
import type {Elem} from '#src/disreact/model/entity/elem.ts'

export * as Footer from '#src/disreact/codec/rest-elem/embed/footer.ts'
export type Footer = never

export const TAG = 'footer',
             NORM = TAG

export const Children = S.Undefined

export const Attributes = declareProps(
  S.Struct({
    text: S.optional(S.String),
  }),
)

export const Element = declareElem(
  TAG,
  Attributes,
)

export const encode = (self: Elem, acc: any) => {
  return {
    text: self.props.text ?? acc[Keys.primitive]?.join(''),
  }
}
