import {declareElem, declareProps} from '#src/disreact/codec/rest-elem/util.ts'
import {S} from '#src/disreact/re-exports.ts'
import type {Elem} from '#src/disreact/model/entity/elem/elem.ts'
import {Keys} from '../keys'

export * as Bold from '#src/disreact/codec/rest-elem/markdown/b.ts'
export type Bold = never

export const TAG  = 'b',
             NORM = Keys.primitive

export const Children = S.Union(
  S.String,
)

export const Attributes = declareProps(S.Struct({}))

export const Element = declareElem(
  TAG,
  Attributes,
)

export const encode = (self: Elem, acc: any) => {
  return `**${acc[Keys.primitive][0]}**`
}
