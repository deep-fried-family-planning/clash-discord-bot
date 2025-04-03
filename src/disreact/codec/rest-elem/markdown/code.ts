import {Keys} from '#src/disreact/codec/rest-elem/keys.ts'
import {declareElem, declareProps} from '#src/disreact/codec/rest-elem/util.ts'
import {S} from '#src/disreact/codec/re-exports.ts'
import type {Elem} from '#src/disreact/model/entity/elem.ts'

export * as Code from '#src/disreact/codec/rest-elem/markdown/code.ts'
export type Code = never

export const TAG  = 'code',
             NORM = Keys.primitive

export const Children = S.Union(
  S.String,
)

export const Attributes = declareProps(
  S.Struct({}),
)

export const Element = declareElem(
  TAG,
  Attributes,
)

export const encode = (self: Elem, acc: any) => {
  return `\`${acc[Keys.primitive][0]}\``
}
