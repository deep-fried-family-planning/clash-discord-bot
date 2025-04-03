import {declareElem, declareProps} from '#src/disreact/codec/rest-elem/util.ts'
import {S} from '#src/disreact/codec/re-exports.ts'
import type {Elem} from '#src/disreact/model/entity/elem.ts'

export * as UnorderedList from '#src/disreact/codec/rest-elem/markdown/ul.ts'
export type UnorderedList = typeof UnorderedList

export const TAG  = 'ul',
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
