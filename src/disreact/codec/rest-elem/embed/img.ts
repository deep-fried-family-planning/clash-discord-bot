import {Keys} from '#src/disreact/codec/rest-elem/keys.ts'
import {declareElem, declareProps} from '#src/disreact/codec/rest-elem/util.ts'
import {S} from '#src/disreact/re-exports.ts'
import type {Elem} from '#src/disreact/model/entity/elem/elem.ts'

export * as Img from '#src/disreact/codec/rest-elem/embed/img.ts'
export type Img = never

export const TAG  = 'img',
             NORM = Keys.image

export const Children = S.Undefined

export const Attributes = declareProps(
  S.Struct({
    url: S.String,
  }),
)

export const Element = declareElem(TAG, Attributes)

export const encode = (self: Elem, acc: any) => {
  return {
    url: self.props.url,
  }
}
