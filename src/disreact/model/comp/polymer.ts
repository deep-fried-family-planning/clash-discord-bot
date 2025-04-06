import {S} from '#src/disreact/utils/re-exports.ts'
import {Monomer} from '#src/disreact/model/comp/monomer.ts'

export * as Polymer from '#src/disreact/model/comp/polymer.ts'
export type Polymer = {
  pc   : number
  stack: Chain[]
}

export const Chain = S.mutable(S.Array(Monomer.Any))

export type Chain = typeof Chain.Type
