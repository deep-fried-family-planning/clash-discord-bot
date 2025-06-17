import type {Envelope} from '#src/disreact/model/internal/rehydrant.ts';
import type {EventDefect, RenderDefect, UpdateDefect} from '#src/disreact/model/lifecycle.ts';
import type {SourceDefect} from '#src/disreact/model/Rehydrator.ts';
import * as Progress from '#src/disreact/codec/old/progress2.ts';
import * as Deferred from 'effect/Deferred';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as L from 'effect/Layer';
import * as Mailbox from 'effect/Mailbox';

type RelayError = | SourceDefect
                  | RenderDefect
                  | UpdateDefect
                  | EventDefect;

const service = pipe(
  E.zip(
    Mailbox.make<Progress.Progress2, RelayError>(),
    Deferred.make<Progress.Exit | Progress.Same | Progress.Next, RelayError>(),
  ),
  E.map(([mailbox, final]) => {
    const fail = (error: RelayError) =>
      mailbox.fail(error).pipe(
        E.tap(Deferred.fail(final, error)),
      );

    const take = mailbox.take
      .pipe(
        E.catchTag('NoSuchElementException', () => E.succeed(Progress.done())),
      );

    const send = (progress: Progress.Progress2) =>
      mailbox.offer(progress).pipe(
        E.asVoid,
      );

    const finalize = (progress: Progress.Exit | Progress.Same | Progress.Next) =>
      send(progress).pipe(
        E.andThen(Deferred.succeed(final, progress)),
      );

    return {
      fail : fail,
      end  : mailbox.end,
      take : take,
      send : send,
      sendN: (ps: Progress.Progress2[]) => mailbox.offerAll(ps),
      final: finalize,
      await: Deferred.await(final),
    };
  }),
);

export class Relay extends E.Service<Relay>()('disreact/RehydrantDOM', {
  effect   : service,
  accessors: true,
}) {
  static readonly Fresh = L.fresh(this.Default);
}
