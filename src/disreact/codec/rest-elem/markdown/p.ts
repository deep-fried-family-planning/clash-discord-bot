import {declareElem, declareProps} from '#src/disreact/codec/rest-elem/util.ts'
import {S} from '#src/disreact/utils/re-exports.ts'
import type {Elem} from '#src/disreact/model/entity/elem.ts'
import { Keys } from '../keys'

export * as Paragraph from '#src/disreact/codec/rest-elem/markdown/p.ts'
export type Paragraph = never

export const TAG  = 'p',
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
  return `\n${acc[Keys.primitive]?.[0]}`
}
