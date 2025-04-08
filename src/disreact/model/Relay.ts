import type {Root} from '#src/disreact/model/entity/root.ts';
import {D, DF, E, L} from '#src/disreact/utils/re-exports.ts';
import * as Mailbox from 'effect/Mailbox';
import {Misc} from '../utils/misc';

export type RelayStatus = D.TaggedEnum<{
  Start   : {};
  Close   : {};
  Same    : {};
  Next    : {id: string; props?: any | undefined};
  Partial : {type: 'modal' | 'message'; isEphemeral?: boolean};
  Complete: {};
}>;
export const RelayStatus = D.taggedEnum<RelayStatus>();

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
        pollOutput : () => Misc.pollDeferred(current),
        setComplete: () => mailbox.end,
        awaitStatus: () => mailbox.take.pipe(E.catchTag('NoSuchElementException', () => E.succeed(RelayStatus.Complete()))),
        sendStatus : (msg: RelayStatus) => mailbox.offer(msg),
      }),
  ),
}) {
  static readonly Fresh = L.fresh(Relay.Default);
}
