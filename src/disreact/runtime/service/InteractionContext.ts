import type {DAuth, Events, Rest, DRoute} from '#src/disreact/runtime/enum/index.ts';
import {E, L} from '#src/internal/pure/effect.ts';

const empty = () => ({
  clk  : Date.now(),
  rest : null as unknown as Rest.Interaction,
  auths: null as unknown as DAuth.TAuth[],
  route: null as unknown as DRoute.Routes,
  event: null as unknown as Events.Events,
});

const make = E.sync(() => {
  let self = null as unknown as ReturnType<typeof empty>;
  return {
    free: () => self = empty(),
    read: () => self,
    save: (next: ReturnType<typeof empty>) => self = next,
  };
});

export class InteractionContext extends E.Tag('DisReact.InteractionContext')<
  InteractionContext,
  E.Effect.Success<typeof make>
>() {
  static makeLayer = () => L.effect(this, make);
}
