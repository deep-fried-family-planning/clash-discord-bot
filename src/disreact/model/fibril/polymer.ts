import {S} from '#src/disreact/re-exports.ts'
import {Monomer} from '#src/disreact/model/fibril/monomer.ts'

export * as Polymer from '#src/disreact/model/fibril/polymer.ts'
export type Polymer = {
  pc   : number
  stack: Chain[]
}

export const Chain = S.mutable(S.Array(Monomer.Any))

export type Chain = typeof Chain.Type
