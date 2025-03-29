import {E, L} from '#src/disreact/re-exports.ts'
import {Data, Mailbox, pipe} from 'effect'


type Status = Data.TaggedEnum<{
  PartialPublic   : {}
  PartialEphemeral: {}
  Complete        : {}
}>

const Status = Data.taggedEnum<Status>()

export class Relay extends E.Service<Relay>()('disreact/ModelRelay', {
  accessors: true,

  effect: pipe(
    Mailbox.make<Status>(),
    E.map((mailbox) =>
      ({
        shutdown: () => mailbox.shutdown,
        complete: () => mailbox.done,
        await   : () => mailbox.take,
        send    : mailbox.offer,
      }),
    ),
  ),
}) {
  static readonly Fresh = L.fresh(Relay.Default)
  static readonly Data = Status
}
