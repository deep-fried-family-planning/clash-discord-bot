import {S} from '#src/disreact/codec/re-exports.ts'

export * as Route from './route.ts'
export type Route = never

export const Message = S.Struct({
  id: S.String,
})
