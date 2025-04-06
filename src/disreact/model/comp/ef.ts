import { E } from '#src/disreact/utils/re-exports.ts'
import {isPromise} from 'effect/Predicate'

export * as EF from '#src/disreact/model/comp/ef.ts'
export type EF = () => void | Promise<void> | E.Effect<void>

export const applyEffect = (ef: EF) => E.suspend(() => {
  const output = ef()

  if (isPromise(output)) {
    return E.tryPromise(async () => await output)
  }

  if (E.isEffect(output)) {
    return output
  }

  return E.void
})

export type Queue = EF[]
