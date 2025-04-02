import {declareElem, declareProps} from '#src/disreact/codec/rest-elem/util.ts'
import {S} from '#src/disreact/re-exports.ts'
import type {Elem} from '#src/disreact/model/entity/elem.ts'
import { Keys } from '../keys'

export * as Pre from '#src/disreact/codec/rest-elem/markdown/pre.ts'
export type Pre = never

export const TAG  = 'pre',
             NORM = TAG

export const Children = S.Union(
  S.String,
)

export const Attributes = declareProps(
  S.Struct({
    lang: S.optional(S.String),
  }),
)

export const Element = declareElem(
  TAG,
  Attributes,
)

export const encode = (self: Elem, acc: any) => {
  if (!self.props.lang) {
    return `\`\`\`\n${acc[Keys.primitive][0]}\n\`\`\``
  }
  return `\`\`\`${self.props.lang}\n${acc[Keys.primitive][0]}\n\`\`\``
}
