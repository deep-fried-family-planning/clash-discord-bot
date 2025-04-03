import {S} from '#src/disreact/codec/re-exports.ts'
import {Util} from '../util.ts'

export * as DM from './dm.ts'
export type DM = never

export const TAG  = 'dm',
             NORM = TAG

export const Attributes = Util.declareProps(
  S.Struct({}),
)

export const Element = Util.declareElem(
  TAG,
  Attributes,
)
