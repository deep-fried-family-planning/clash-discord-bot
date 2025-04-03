import {D, DF, E, L, pipe} from '#src/disreact/codec/re-exports.ts'
import type {Elem} from '#src/disreact/model/entity/elem.ts'
import type {Root} from '#src/disreact/model/entity/root.ts'
import * as Mailbox from 'effect/Mailbox'

export type RelayStatus = D.TaggedEnum<{
  None    : {}
  Partial : {type: 'modal' | 'message', flags?: number}
  Complete: {}
  Handled : {}
  Next    : {id: string, props?: any | undefined}
  Close   : {}
}>
export const RelayStatus = D.taggedEnum<RelayStatus>()

export class Relay extends E.Service<Relay>()('disreact/Relay', {
  effect: E.map(
    E.all([
      Mailbox.make<RelayStatus>(),
      DF.make<Root | null>(),
    ]),
    ([mailbox, current]) =>
      ({
        setOutput  : (root: Root | null) => DF.succeed(current, root),
        awaitOutput: () => DF.await(current),
        setComplete: () => mailbox.done,
        awaitStatus: () => mailbox.take,
        sendStatus : (msg: RelayStatus) => mailbox.offer(msg),
      }),
  ),
}) {
  static readonly Fresh = L.fresh(Relay.Default)
}

export const relayPartial = (elem: Elem.Rest) => E.andThen(Relay, (relay) => {
  if (elem.type === 'modal') {
    return pipe(
      relay.sendStatus(
        RelayStatus.Partial({
          type: 'modal',
        }),
      ),
      E.as(true),
    )
  }
  if (elem.type === 'message') {
    return pipe(
      relay.sendStatus(
        RelayStatus.Partial({
          type : 'message',
          flags: elem.props.display === 'ephemeral' ? 2 : 1,
        }),
      ),
      E.as(true),
    )
  }
  return E.succeed(false)
})
