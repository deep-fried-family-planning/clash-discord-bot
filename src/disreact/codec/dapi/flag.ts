import {Literal} from 'effect/Schema'

export * as Flag from '#src/disreact/codec/dapi/flag.ts'


export const FRESH = 0
export const PUBLIC = 1
export const PRIVATE = 2

export const Fresh = Literal(FRESH)
export const Public = Literal(PUBLIC)
export const Private = Literal(PRIVATE)
export const Defined = Literal(PUBLIC, PRIVATE)
export const All = Literal(FRESH, PUBLIC, PRIVATE)

export type Fresh = typeof Fresh.Type
export type Public = typeof Public.Type
export type Private = typeof Private.Type
export type Defined = typeof Defined.Type
export type All = typeof All.Type
