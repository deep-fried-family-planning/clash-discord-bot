import {S} from '#src/disreact/codec/re-exports.ts'
import {Util} from '../util.ts'

export * as Channel from './channel.ts'
export type Channel = never

export const TAG = 'channel',
             NORM = TAG

export const Attributes = Util.declareProps(
  S.Struct({}),
)

export const Element = Util.declareElem(
  TAG,
  Attributes,
)
