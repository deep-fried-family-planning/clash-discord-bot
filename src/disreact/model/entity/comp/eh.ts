import {E} from '#src/disreact/re-exports.ts'
import {isPromise} from 'effect/Predicate'

export * as EH from '#src/disreact/model/entity/comp/eh.ts'
export type EH<A> = (event: A) => void | Promise<void> | E.Effect<void>

export const make = () => {}

export const apply = <A>(eh: EH<A>, event: A) => E.suspend(() => {
  const output = eh(event)

  if (isPromise(output)) {
    return E.tryPromise(async () => await output)
  }

  if (E.isEffect(output)) {
    return output
  }

  return E.void
})
