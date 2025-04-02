import type {FC} from '#src/disreact/model/entity/fc.ts'
import {Fibril, Monomer} from '#src/disreact/model/fibril/fibril.ts'


export * as UseUtility from '#src/disreact/model/hooks/use-utility.ts'
export type UseUtility = never

export const interaction = () => {
  const node = Fibril.λ.get()

  if (!node.stack[node.pc]) {
    node.stack[node.pc] = null
  }

  if (!Monomer.isNull(node.stack[node.pc])) {
    throw new Error('Hooks must be called in the same order')
  }

  node.pc++

  return node.nexus?.request
}

export const message = (_: FC[]) => {
  const node = Fibril.λ.get()

  if (!node.stack[node.pc]) {
    node.stack[node.pc] = null
  }

  if (!Monomer.isNull(node.stack[node.pc])) {
    throw new Error('Hooks must be called in the same order')
  }

  node.pc++

  return {
    next: (next: FC, props: any = {}) => {
      node.nexus!.next.id = next.name
      node.nexus!.next.props = props
    },

    close: () => {
      node.nexus!.next.id = null
    },
  }
}
