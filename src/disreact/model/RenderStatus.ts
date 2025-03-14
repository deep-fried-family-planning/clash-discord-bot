import {E, L} from '#src/internal/pure/effect.ts';
import {Data, Mailbox, pipe} from 'effect';



type Status = Data.TaggedEnum<{
  PartialPublic   : {};
  PartialEphemeral: {};
  Complete        : {};
}>;

const Status = Data.taggedEnum<Status>();

export class RenderStatus extends E.Service<RenderStatus>()('disreact/RenderStatus', {
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
  static readonly Fresh = L.fresh(RenderStatus.Default);
  static readonly Data  = Status;
}
