import {S} from '#src/disreact/re-exports.ts'
import type {Elem} from '#src/disreact/model/entity/elem/elem.ts'
import { Keys } from '../keys.ts'
import {Util} from '../util.ts'

export * as Body from './body.ts'
export type Body = never

export const TAG  = 'body',
             NORM = TAG

export const Attributes = Util.declareProps(
  S.Struct({
    id: S.String,
  }),
)

export const Element = Util.declareElem(
  TAG,
  Attributes,
)

export const encode = (self: Elem, acc: any) => {
  if (acc[Keys.modal][0].open) {
    const {open, ...rest} = acc[Keys.modal][0]
    return rest
  }
  if (acc[Keys.message][0]) {
    return acc[Keys.message][0]
  }
  throw new Error('Expected open modal or message')
}
