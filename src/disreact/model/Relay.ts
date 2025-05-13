import type {Rehydrant} from '#src/disreact/model/meta/rehydrant.ts';
import * as Data from 'effect/Data';
import * as Deferred from 'effect/Deferred';
import * as Layer from 'effect/Layer';
import * as Mailbox from 'effect/Mailbox';
import * as Effect from 'effect/Effect';
import {pipe} from 'effect/Function';

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
