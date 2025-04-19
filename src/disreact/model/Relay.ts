import type {Rehydrant} from '#src/disreact/model/elem/rehydrant.ts';
import {E, L, pipe} from '#src/disreact/utils/re-exports.ts';
import {Data, Deferred, Mailbox} from 'effect';

export const Progress = Data.taggedEnum<Relay.Progress>();

export declare namespace Relay {
  export type Progress = Data.TaggedEnum<{
    Start: {};
    Close: {};
    Same : {};
    Next : {id: string | null; props?: any};
    Part : {type: 'modal' | 'message'; isEphemeral?: boolean};
    Done : {};
  }>;
}

export class Relay extends E.Service<Relay>()('disreact/Relay', {
  effect: E.map(
    E.all([
      Mailbox.make<Relay.Progress>(),
      Deferred.make<Rehydrant | null>(),
    ]),
    ([mailbox, current]) =>
      ({
        setOutput  : (root: Rehydrant | null) => Deferred.succeed(current, root),
        awaitOutput: () => Deferred.await(current),
        setComplete: () => mailbox.end,
        awaitStatus: mailbox.take.pipe(E.catchTag('NoSuchElementException', () => E.succeed(Progress.Done()))),
        sendStatus : (msg: Relay.Progress) => mailbox.offer(msg),
        mailbox,
      }),
  ),
}) {
  static readonly Progress = Data.taggedEnum<Relay.Progress>();

  static readonly Fresh = L.fresh(Relay.Default);
}
