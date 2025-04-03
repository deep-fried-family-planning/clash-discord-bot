import {Prim} from '#src/disreact/model/entity/prim.ts'
import {Rest} from '#src/disreact/model/entity/rest.ts'
import {Task} from '#src/disreact/model/entity/task.ts'

export * from '#src/disreact/model/entity/frag.ts'
export * from '#src/disreact/model/entity/prim.ts'
export * from '#src/disreact/model/entity/rest.ts'
export * from '#src/disreact/model/entity/task.ts'
export * as Elem from '#src/disreact/model/entity/elem.ts'
export type Elem =
  | Rest
  | Task

export type Any =
  | Elem
  | Prim

export interface MetaProps {
  type   : any
  id?    : string | undefined
  ids?   : string | undefined
  idn?   : string | undefined
  idx?   : number | undefined
  parent?: Elem | undefined
  props  : any
  nodes  : Any[]
}

export const jsx = (type: any, props: any): Elem => {
  if (type === undefined) {
    return props.children
  }

  switch (typeof type) {
    case 'string':
      return Rest.jsxRest(type, props)
    case 'function':
      return Task.jsxTask(type, props)
    default:
      throw new Error()
  }
}

export const jsxs = (type: any, props: any): Elem => {
  props.children = props.children.flat()

  if (type === undefined) {
    return props.children
  }

  switch (typeof type) {
    case 'string':
      return Rest.jsxsRest(type, props)
    case 'function':
      return Task.jsxsTask(type, props)
    default:
      throw new Error()
  }
}

export const jsxDEV = (type: any, props: any): Elem => {
  if (!Array.isArray(props.children)) {
    return jsx(type, props)
  }
  return jsxs(type, props)
}

export const cloneElem = (self: Elem) => {
  if (Rest.isRest(self)) {
    return Rest.cloneRest(self)
  }

  return Task.cloneTask(self)
}

export const deepCloneElem = <A extends Any>(self: A): A => {
  if (Prim.isPrim(self)) {
    return Prim.clonePrim(self) as A
  }

  const cloned = cloneElem(self)

  for (let i = 0; i < cloned.nodes.length; i++) {
    const node = cloned.nodes[i]
    cloned.nodes[i] = deepCloneElem(node)
  }

  return cloned as A
}

export const linearizeElem = <A extends Elem>(self: A): A => {
  if (Task.isTask(self)) {
    delete self.strand.nexus
    delete self.strand.elem
  }

  for (let i = 0; i < self.nodes.length; i++) {
    const node = self.nodes[i]

    if (!Prim.isPrim(node)) {
      linearizeElem(node)
    }
  }

  return self
}

export const connectChild = (parent: Elem, child: Elem, idx: number) => {
  child.parent = parent
  child.idx = idx

  const child_id = `${child.idn ?? child.type}:${idx}`
  const parent_id = `${parent.idn ?? parent.type}:${parent.idx}`

  child.id = `${parent.id}:${child_id}`
  child.ids = `${parent_id}:${child_id}`
}
