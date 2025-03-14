import {E, L} from '#src/internal/pure/effect.ts';
import {Data, Mailbox, pipe} from 'effect';



type Status = Data.TaggedEnum<{
  PartialPublic   : {};
  PartialEphemeral: {};
  Complete        : {};
}>;

const Status = Data.taggedEnum<Status>();

export class RootStatus extends E.Service<RootStatus>()('disreact/RootStatus', {
  accessors: true,

  effect: pipe(
    Mailbox.make<Status>(),
    E.map((mailbox) => ({
      shutdown: () => mailbox.shutdown,
      complete: () => mailbox.done,
      await   : () => mailbox.take,
      send    : mailbox.offer,
    })),
  ),
}) {
  static readonly Fresh = L.fresh(RootStatus.Default);
  static readonly Data  = Status;
}
