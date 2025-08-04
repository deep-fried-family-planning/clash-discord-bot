import * as Doken from '#disreact/adaptor-discord/core/Doken.ts';
import type * as Reply from '#disreact/adaptor-discord/core/Reply.ts';
import type {Discord} from 'dfx';
import * as DateTime from 'effect/DateTime';
import * as Effect from 'effect/Effect';
import {dual} from 'effect/Function';
import * as Option from 'effect/Option';
import * as SynchronizedRef from 'effect/SynchronizedRef';

export type Inner = {
  fresh: Doken.Fresh;
  defer: Option.Option<Doken.Defer>;
};

export type Dokens = SynchronizedRef.SynchronizedRef<Inner>;

export const make = (ix: Discord.APIInteraction): Effect.Effect<Dokens> => {
  const fresh = Doken.fresh(ix);

  return SynchronizedRef.make({
    fresh: fresh,
    defer: Option.none(),
  });
};

export const setDefer = dual<
  (defer: Doken.Defer) => (self: Dokens) => Effect.Effect<void>,
  (self: Dokens, defer: Doken.Defer) => Effect.Effect<void>
>(2, (self, defer) =>
  SynchronizedRef.update(self, (state) => ({
    ...state,
    defer: Option.some(defer),
  })),
);

export const getCompatible = (self: Dokens, reply: Reply.Reply) =>
  self.get.pipe(
    Effect.map((state) => {

    }),
  );
