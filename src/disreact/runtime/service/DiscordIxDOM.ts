import {DiscordDOM} from '#src/disreact/runtime/service/DiscordDOM.ts';
import {E, L} from '#src/internal/pure/effect.ts';
import {pipe} from 'effect';



export type DiscordIxDOMConfig = {
  rest: any;
};



export const make = (config: DiscordIxDOMConfig) => E.gen(function* () {
  const discordDOM = yield* DiscordDOM;

  return {
    close: () =>
      pipe(
        discordDOM.dismount,
      ),

    defer: () => {

    },
  };
});



export class DiscordIxDOM extends E.Tag('DisReact.DiscordIxDOM')<
  DiscordIxDOM,
  E.Effect.Success<ReturnType<typeof make>>
>() {
  static readonly makeLayer = (config: DiscordIxDOMConfig) =>
    L.effect(this, make(config));
}
