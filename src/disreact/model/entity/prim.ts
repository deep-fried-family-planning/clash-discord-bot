export * as Prim from '#src/disreact/model/entity/prim.ts'
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
