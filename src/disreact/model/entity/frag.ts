export * as Frag from '#src/disreact/model/entity/frag.ts'
export type Frag = undefined

export const Type = undefined

export const isFrag = (self: unknown): self is Frag => self === undefined
