import type {Rehydrant} from '#src/disreact/model/meta/rehydrant.ts';
import {Data, Deferred, Effect, Layer, Mailbox, pipe} from 'effect';

export const Progress = Data.taggedEnum<Relay.Progress>();

export type Progress = Data.TaggedEnum<{
  Start: {};
  Close: {};
  Same : {};
  Next : {id: string | null; props?: any};
  Part : {type: 'modal' | 'message' | 'ephemeral'; isEphemeral?: boolean};
  Done : {};
}>;

export declare namespace Relay {
  export type Progress = Data.TaggedEnum<{
    Start: {};
    Close: {};
    Same : {};
    Next : {id: string | null; props?: any};
    Part : {type: 'modal' | 'message' | 'ephemeral'; isEphemeral?: boolean};
    Done : {};
  }>;
}

const setup = Effect.all([
  Mailbox.make<Relay.Progress>(),
  Deferred.make<Rehydrant | null>(),
]);

export class Relay extends Effect.Service<Relay>()('disreact/Relay', {
  effect: Effect.map(setup, ([mailbox, current]) => {
    return {
      setOutput  : (root: Rehydrant | null) => Deferred.succeed(current, root),
      awaitOutput: Deferred.await(current),
      setComplete: () => mailbox.end,
      sendStatus : (msg: Progress) => mailbox.offer(msg),
      awaitStatus: pipe(
        mailbox.take,
        Effect.catchTag('NoSuchElementException', () =>
          Effect.succeed(Progress.Done()),
        ),
      ),
    };
  }),
}) {
  static readonly Fresh = Layer.fresh(Relay.Default);
}
