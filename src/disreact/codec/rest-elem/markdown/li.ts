import {declareElem, declareProps} from '#src/disreact/codec/rest-elem/util.ts'
import {S} from '#src/disreact/utils/re-exports.ts'
import type {Elem} from '#src/disreact/model/entity/elem.ts'

export * as ListItem from '#src/disreact/codec/rest-elem/markdown/li.ts'
export type ListItem = never

export const TAG  = 'li',
             NORM = TAG

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
  throw new Error('Not implemented')
}
