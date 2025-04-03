import {declareElem, declareProps} from '#src/disreact/codec/rest-elem/util.ts'
import {S} from '#src/disreact/codec/re-exports.ts'
import type {Elem} from '#src/disreact/model/entity/elem.ts'
import { Keys } from '../keys'

export * as Anchor from '#src/disreact/codec/rest-elem/markdown/a.ts'
export type Anchor = never

export const TAG  = 'a',
             NORM = Keys.primitive

export const Children = S.Union(
  S.String,
)

export const Attributes = declareProps(
  S.Struct({
    href : S.String,
    embed: S.optional(S.Boolean),
  }),
)

export const Element = declareElem(
  TAG,
  Attributes,
)

export const encode = (self: Elem, acc: any) => {
  if (self.props.embed) {
    return `${self.props.href}`
  }
  return `<${self.props.href}>`
}
