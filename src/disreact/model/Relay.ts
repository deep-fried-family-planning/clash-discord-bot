import type {Elem} from '#src/disreact/model/entity/elem.ts'
import type {Root} from '#src/disreact/model/entity/root.ts'
import {D, DF, E, L, pipe} from '#src/disreact/re-exports.ts'
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
        awaitOutput: () => DF.await(current),
        setComplete: () => mailbox.done,
        awaitStatus: () => mailbox.take,
        sendStatus : (msg: Status) => mailbox.offer(msg),
      }),
    ),
  ),
  accessors: true,
}) {
  static readonly Fresh = L.fresh(Relay.Default)
}

export const relayPartial = (elem: Elem.Rest) => {
  if (elem.type === 'modal') {
    return pipe(
      Relay.sendStatus(
        Status.Partial({
          type: 'modal',
        }),
      ),
      E.as(true),
    )
  }
  if (elem.type === 'message') {
    return pipe(
      Relay.sendStatus(
        Status.Partial({
          type : 'message',
          flags: elem.props.display === 'ephemeral' ? 2 : 1,
        }),
      ),
      E.as(true),
    )
  }
  return E.succeed(false)
}
