import {FC} from '#src/disreact/model/comp/fc.ts'
import {Fibril} from '#src/disreact/model/comp/fibril.ts'
import type {Elem} from '#src/disreact/model/entity/elem.ts'
import {E} from '#src/internal/pure/effect.ts'
import * as Array from 'effect/Array'
import type {UnknownException} from 'effect/Cause'
import {isPromise} from 'effect/Predicate'

export * as Task from '#src/disreact/model/entity/task.ts'
export interface Task extends Elem.MetaProps {
  type  : FC
  strand: Fibril.Strand
}

export const jsxTask = (type: any, props: any): Task => {
  const fc = FC.init(type)
  const task = {} as Task
  task.idn = FC.getName(fc)
  task.type = fc
  task.props = props
  task.nodes = [] as Elem[]
  task.strand = Fibril.makeStrand()
  return task
}

export const jsxsTask = (type: any, props: any): Task => {
  const init = jsxTask(type, props)
  return init
}

export const isTask = (self: unknown): self is Task => {
  switch (typeof self) {
    case 'object':
      return typeof (self as any).type === 'function'
  }
  return false
}

export const cloneTask = (self: Task): Task => {
  const {props, strand, type, nodes, id, idx} = self
  const clonedProps = deepCloneTaskProps(props)
  const task = jsxTask(type, clonedProps)
  task.strand = Fibril.cloneStrand(strand)
  task.nodes = nodes
  task.id = id
  task.idx = idx
  return task
}

const deepCloneTaskProps = (props: any): any => {
  if (!props) {
    return props
  }

  try {
    return structuredClone(props)
  }
  catch (e) {/**/}

  const acc = {} as any

  for (const key of Object.keys(props)) {
    const original = props[key]
    const originalType = typeof original

    if (originalType === 'object') {
      if (!original) {
        acc[key] = null
        continue
      }
      if (Array.isArray(original)) {
        acc[key] = original.map((item) => deepCloneTaskProps(item))
        continue
      }
      acc[key] = deepCloneTaskProps(original)
      continue
    }

    acc[key] = original
  }

  return props
}

export const renderSync = (self: Elem.Task): Elem.Any[] => {
  const children = self.type(self.props)

  return children
    ? Array.ensure(children)
    : []
}

export const renderAsync = (self: Elem.Task): E.Effect<Elem.Any[], UnknownException> =>
  E.tryPromise(async () => {
    const children = await self.type(self.props)

    return children
      ? Array.ensure(children)
      : []
  })

export const renderEffect = (self: Elem.Task): E.Effect<Elem.Any[]> =>
  E.map(
    self.type(self.props) as E.Effect<Elem.Any[]>,
    (cs) => {
      return cs
        ? Array.ensure(cs)
        : []
    },
  )

export const renderUnknown = (self: Elem.Task): E.Effect<Elem.Any[], UnknownException> => {
  const children = self.type(self.props)

  if (isPromise(children)) {
    self.type[FC.RenderSymbol] = FC.ASYNC

    return E.tryPromise(async () => {
      const childs = await children
      return childs
        ? Array.ensure(childs as Elem.Any)
        : []
    })
  }

  if (E.isEffect(children)) {
    self.type[FC.RenderSymbol] = FC.EFFECT

    return E.map(
      children as E.Effect<Elem.Any[]>,
      (cs) => {
        return cs
          ? Array.ensure(cs)
          : []
      },
    )
  }

  self.type[FC.RenderSymbol] = FC.SYNC

  return E.succeed(
    children
      ? Array.ensure(children)
      : [],
  )
}
