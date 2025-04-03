import {declareElem, declareProps} from '#src/disreact/codec/rest-elem/util.ts'
import {S} from '#src/disreact/codec/re-exports.ts'
import type {Elem} from '#src/disreact/model/entity/elem.ts'
import { Keys } from '../keys'

export * as Italic from '#src/disreact/codec/rest-elem/markdown/i.ts'
export type Italic = never

export const TAG  = 'i',
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
  return `*${acc[Keys.primitive][0]}*`
}
