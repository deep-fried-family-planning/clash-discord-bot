import type {Rehydrant} from '#src/disreact/mode/entity/rehydrant.ts';
import type * as Progress from '#src/disreact/mode/util/progress.ts';
import * as Data from 'effect/Data';
import * as Deferred from 'effect/Deferred';
import * as Effect from 'effect/Effect';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as L from 'effect/Layer';
import * as Mailbox from 'effect/Mailbox';

export class RehydrantDOM extends E.Service<RehydrantDOM>()('disreact/RehydrantDOM', {
  effect: E.gen(function* () {
    const mailbox = yield* Mailbox.make<Progress.Progress>();
    const first = yield* Deferred.make<Rehydrant.Rehydrant>();
    const final = yield* Deferred.make<Rehydrant.Rehydrant | null>();

    return {
      mount   : (root: Rehydrant.Rehydrant) => Deferred.succeed(first, root),
      listen  : mailbox.take,
      send    : (progress: Progress.Progress) => mailbox.offer(progress),
      finalize: (root: Rehydrant.Rehydrant | null) => Deferred.succeed(final, root),
      output  : () => Deferred.await(final),
    };
  }),
  accessors: true,
}) {
  static readonly Fresh = L.fresh(RehydrantDOM.Default);
}
