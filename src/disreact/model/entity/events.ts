import {D, E, S} from '#src/disreact/utils/re-exports.ts'
import type {Cause} from 'effect'
import {Predicate} from 'effect'

export * as Events from 'src/disreact/model/entity/events.ts'
export type Events<A = any> = {
  id  : string
  data: A
}

export type EventData<A> = Events<A>['data']

export const declareEvent = <A, I, R>(data: S.Schema<A, I, R>) =>
  S.Struct({
    id  : S.String,
    data: data,
  })

export type Handler<A> = <E, R>(event: EventData<A>) =>
  | void
  | Promise<void>
  | E.Effect<void, E, R>

const typeHandler = <A>(h: unknown): h is Handler<A> =>
  typeof h === 'function'

export const declareHandler = <A, I, R>(data: S.Schema<A, I, R>) =>
  S.declare(
    typeHandler<typeof data.Type>,
  )

export const renderHandler = <A = any>(handler: Handler<A>, event: Events<A>) => E.suspend(() => {
  const output = handler(event.data)

  if (!output) {
    return E.void
  }

  if (E.isEffect(output)) {
    return output as E.Effect<void>
  }

  if (Predicate.isPromise(output)) {
    return E.tryPromise(() => output)
  }

  return E.fail(
    new EventDefect({
      message: 'Invalid handler output',
    }),
  ) as E.Effect<void, Cause.UnknownException | EventDefect>
})

export class EventDefect extends D.TaggedError('disreact/EventDefect')<{
  message?: string
  cause?  : Error
}> {}
