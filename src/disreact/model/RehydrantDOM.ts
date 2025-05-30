import type {Rehydrant} from '#src/disreact/model/entity/rehydrant.ts';
import type {EventDefect, RenderDefect, UpdateDefect} from '#src/disreact/model/lifecycles.ts';
import type {RehydratorError} from '#src/disreact/model/Rehydrator.ts';
import type * as Progress from '#src/disreact/model/util/progress.ts';
import * as Deferred from 'effect/Deferred';
import * as E from 'effect/Effect';
import {flow} from 'effect/Function';
import * as L from 'effect/Layer';
import * as Mailbox from 'effect/Mailbox';

type Errs = | RehydratorError
            | RenderDefect
            | UpdateDefect
            | EventDefect;

export class RehydrantDOM extends E.Service<RehydrantDOM>()('disreact/RehydrantDOM', {
  effect: E.fnUntraced(function* () {
    const mailbox = yield* Mailbox.make<Progress.Progress, Errs>();
    const final = yield* Deferred.make<Rehydrant.Rehydrant | null, Errs>();

    return {
      fail    : (error: Errs) => mailbox.fail(error).pipe(E.tap(Deferred.fail(final, error))),
      complete: mailbox.end,
      listen  : mailbox.take,
      send    : (progress: Progress.Progress) => mailbox.offer(progress),
      finalize: (root: Rehydrant.Rehydrant | null) => Deferred.succeed(final, root),
      output  : () => Deferred.await(final),
    };
  }),
  accessors: true,
}) {
  static readonly Fresh = flow(this.Default, L.fresh);
}
