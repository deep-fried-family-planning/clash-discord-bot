import {Fibril, Monomer} from '#src/disreact/model/fibril/fibril.ts'


export * as UseReducer from '#src/disreact/model/hooks/use-reducer.ts'
export type UseReducer = never

export const reducer = <A, B>(reducer: (prev: A, action: B) => A, initialState: A): readonly [A, (action: B) => void] => {
  return [] as any
}

interface SetState<A> {
  (next: A): void
  (updater: (prev: A) => A): void
}

export const state = <A>(initial: A): readonly [A, SetState<A>] => {
  const node = Fibril.λ.get()

  node.stack[node.pc] ??= {s: initial}

  const curr = node.stack[node.pc]

  if (!Monomer.isState(curr)) {
    throw new Error('Hooks must be called in the same order')
  }

  const set: SetState<A> = (next) => {
    if (typeof next === 'function') {
      curr.s = (next as (prev: A) => A)(curr.s)
    }
    else {
      curr.s = next
    }
  }

  node.pc++

  return [curr.s, set]
}
