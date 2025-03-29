import type { Elem } from '#src/disreact/model/entity/elem/elem.ts'

export * as Prim from '#src/disreact/model/entity/elem/prim.ts'
export type Prim =
  | symbol
  | string
  | bigint
  | number
  | boolean
  | null
  | undefined

export const isPrim = (self: unknown): self is Prim => {
  if (!self) return true
  switch (typeof self) {
    case 'object':
    case 'function':
      return false
  }
  return true
}

export const clonePrim = (self: Prim): Prim => structuredClone(self)

export const diffPrim = (a: Prim, b: Elem.Any): b is Prim => a === b
