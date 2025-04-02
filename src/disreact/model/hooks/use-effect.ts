import {Fibril, Monomer} from '#src/disreact/model/fibril/fibril.ts'
import type {E} from '#src/internal/pure/effect.ts'


export * as UseEffect from '#src/disreact/model/hooks/use-effect.ts'
export type UseEffect = never

interface EffectFn {
  (): void | Promise<void> | E.Effect<void>
}

export const hook = (effect: EffectFn, deps?: any[]): void => {
  if (deps) {
    for (const dep of deps) {
      switch (typeof dep) {
        case 'symbol':
        case 'function':
          throw new Error(`Unsupported hook dependency type: ${dep.toString()}`)
      }
    }
  }

  const node = Fibril.λ.get()

  if (!node.stack[node.pc]) {
    node.stack[node.pc] = {d: deps ?? []}
  }

  const curr = node.stack[node.pc]

  if (!Monomer.isDependency(curr)) {
    throw new Error('Hooks must be called in the same order')
  }

  node.pc++

  if (node.rc === 0) {
    node.queue.push(effect)
    return
  }

  if (!deps) {
    return
  }

  if (curr.d.length !== deps.length) {
    throw new Error('Hook dependency length mismatch')
  }

  if (curr.d.length === 0 && deps.length === 0) {
    node.queue.push(effect)
    return
  }

  for (let i = 0; i < deps.length; i++) {
    if (deps[i] !== curr.d[i]) {
      curr.d = deps
      node.queue.push(effect)
      break
    }
  }
}
