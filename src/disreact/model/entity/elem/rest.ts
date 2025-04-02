import {Keys} from '#src/disreact/codec/rest-elem/keys.ts'
import type {Elem} from '#src/disreact/model/entity/elem.ts'

export * as Rest from '#src/disreact/model/entity/elem/rest.ts'

export interface Rest extends Elem.MetaProps {
  type   : string
  handler: any
}

export const isRest = (self: unknown): self is Rest => {
  switch (typeof self) {
    case 'object':
      return typeof (self as any).type === 'string'
  }
  return false
}

const HANDLER_KEYS = [
  Keys.onclick,
  Keys.onselect,
  Keys.onsubmit,
]

export const makeRest = (type: string, props: any, nodes: any[]): Rest => {
  const rest = {
    type,
    props,
    nodes,
  } as Rest

  for (let i = 0; i < HANDLER_KEYS.length; i++) {
    const hkey = HANDLER_KEYS[i]
    const handler = props[hkey]
    if (handler) {
      rest.handler = handler
      delete props[hkey]
    }
  }

  return rest
}

export const jsxRest = (type: string, props: any): Rest => {
  const child = props.children
  delete props.children
  return makeRest(type, props, child ? [child] : [])
}

export const jsxsRest = (type: string, props: any): Rest => {
  const nodes = props.children
  delete props.children
  return makeRest(type, props, nodes)
}

const RESERVED = [
  ...HANDLER_KEYS,
  Keys.children,
  Keys.handler,
]

export const cloneRest = (self: Rest): Rest => {
  const {props, nodes, handler, parent, ...rest} = self

  const reserved = {} as any

  for (const key of RESERVED) {
    const prop = props[key]
    if (prop) {
      reserved[key] = prop
      delete props[key]
    }
  }

  const cloned = structuredClone(rest) as Rest
  cloned.props = structuredClone(props)
  cloned.nodes = nodes
  cloned.handler = handler

  for (const key of Object.keys(reserved)) {
    cloned.props[key] = reserved[key]
    props[key] = reserved[key]
  }

  return cloned
}
