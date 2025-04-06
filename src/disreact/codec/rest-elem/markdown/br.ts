import {Keys} from '#src/disreact/codec/rest-elem/keys.ts'
import {declareElem, declareProps} from '#src/disreact/codec/rest-elem/util.ts'
import {S} from '#src/disreact/utils/re-exports.ts'
import type {Elem} from '#src/disreact/model/entity/elem.ts'

export * as Break from '#src/disreact/codec/rest-elem/markdown/br.ts'
export type Break = never

export const TAG  = 'br',
             NORM = Keys.primitive

export const Children = S.Never

export const Attributes = declareProps(
  S.Struct({}),
)

export const Element = declareElem(
  TAG,
  Attributes,
)

export const encode = (self: Elem, acc: any) => {
  return '\n'
}
