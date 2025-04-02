import type {Elem} from '#src/disreact/model/entity/elem.ts'
import type {Root} from '#src/disreact/model/entity/root.ts'
import {D, DF, E, L, pipe, SR} from '#src/disreact/re-exports.ts'
import * as Mailbox from 'effect/Mailbox'

export type Status = D.TaggedEnum<{
  None    : {}
  Partial : {type: 'modal' | 'message', flags?: number}
  Complete: {}
  Handled : {}
  Next    : {id: string, props?: any | undefined}
  Close   : {}
}>
export const Status = D.taggedEnum<Status>()

export class Relay extends E.Service<Relay>()('disreact/Relay', {
  effect: pipe(
    E.all([
      Mailbox.make<Status>(),
      DF.make<Root | null>(),
    ]),
    E.map(([mailbox, current]) =>
      ({
        setOutput  : (root: Root | null) => DF.succeed(current, root),
        pollOutput : () => DF.poll(current),
        awaitOutput: () => DF.await(current),

        shutdown: () => mailbox.shutdown,
        complete: () => mailbox.done,
        take    : () => mailbox.take,
        send    : (msg: Status) => mailbox.offer(msg),
      }),
    ),
  ),
  accessors: true,
}) {
  static readonly Fresh = L.fresh(Relay.Default)

  static readonly None = Status.None as () => Status
  static readonly Partial = Status.Partial
  static readonly Complete = Status.Complete
  static readonly Next = Status.Next
  static readonly Close = Status.Close
  static readonly Handled = Status.Handled
  static readonly isNone = Status.$is('None')
  static readonly isPartial = Status.$is('Partial')
  static readonly isComplete = Status.$is('Complete')
  static readonly isNext = Status.$is('Next')
  static readonly isClose = Status.$is('Close')
  static readonly isHandled = Status.$is('Handled')
  static readonly match = Status.$match
}

export const relayPartial = (elem: Elem.Rest) => {
  if (elem.type === 'modal') {
    return pipe(
      Relay.send(Relay.Partial({
        type: 'modal',
      })),
      E.as(true),
    )
  }
  else if (elem.type === 'message') {
    return pipe(
      Relay.send(Relay.Partial({
        type : 'message',
        flags: elem.props.display === 'ephemeral' ? 2 : 1,
      })),
      E.as(true),
    )
  }
  return E.succeed(false)
}
