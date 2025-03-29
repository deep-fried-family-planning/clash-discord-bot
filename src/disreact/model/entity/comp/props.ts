import {Data, Equal} from 'effect'

export * as Props from '#src/disreact/model/entity/comp/props.ts'
export type Props<P = any, A = any> =
  | None
  | Zero<P, A>
  | Only<P, A>
  | Many<P, A>

export const ZeroSymbol = Symbol.for('disreact/Props/zero')
export const OnlySymbol = Symbol.for('disreact/Props/only')
export const ManySymbol = Symbol.for('disreact/Props/many')

export const DISCRIMINANT = '_tag' as const,
             NONE         = 'None' as const,
             ONLY         = 'Only' as const,
             MANY         = 'Many' as const,
             CHILDREN     = 'children' as const

type None = null | undefined | never
type Zero<P = any, A = any> = Omit<P, 'children' | '_tag'> & {_tag: typeof ZERO, children: never}
type Only<P = any, A = any> = Omit<P, 'children' | '_tag'> & {_tag: typeof ONLY, children: A}
type Many<P = any, A = any> = Omit<P, 'children' | '_tag'> & {_tag: typeof MANY, children: A[]}


export const ZERO = 'ZERO' as const

export const isNone = <P, A>(self: Props<P, A>): self is None => self === null || self === undefined
export const isZero = <P, A>(self: Props<P, A>): self is Zero<P, A> => self?._tag === ZERO
export const isOnly = <P, A>(self: Props<P, A>): self is Only<P, A> => self?._tag === ONLY
export const isMany = <P, A>(self: Props<P, A>): self is Many<P, A> => self?._tag === MANY

export const jsx = <P, A>(props: any): None | Zero<P, A> | Only<P, A> => {
  if (!props) {
    return props
  }

  if (!props.children) {
    props._tag = ZERO
  }
  else {
    props._tag = ONLY
    props.children = [props.children]
  }

  return props
}

export const jsxs = <P, A>(props: any): Many<P, A> => {
  props._tag = MANY
  return props
}

export const isEqual = (a: Props, b: Props): boolean => {
  if (a === b) {
    return true
  }
  if (a === null || b === null) {
    return false
  }
  if (a === undefined || b === undefined) {
    return false
  }
  if (a._tag !== b._tag) {
    return false
  }

  const cprops = Data.struct(a)
  const rprops = Data.struct(b)

  return Equal.equals(cprops, rprops)
}

export const isDeepEqual = (a: any, b: any) => {
  if (a === b) return true
  if (!a || !b) return false

  const typeA = typeof a
  const typeB = typeof b

  if (typeA !== 'object') return false
  if (typeB !== 'object') return false

  if (typeof a !== 'object' || typeof b !== 'object') return false
  if (a.constructor !== b.constructor) return false
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; ++i) {
      if (!isDeepEqual(a[i], b[i])) return false
    }
    return true
  }
}
