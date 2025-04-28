import {OmniBoard} from '#src/discord/omni-board/omni-board.tsx';
import {StartMenu} from '#src/discord/omni-board/start-menu.tsx';
import {DisReact} from '#src/disreact/runtime/DisReact.ts';
import {DisReactConfig} from '#src/disreact/runtime/DisReactConfig.ts';
import {L, pipe} from '#src/internal/pure/effect.ts';

export const ComponentRouter = pipe(
  DisReact.Default,
  L.provideMerge(DisReactConfig.configLayer({
    token  : '',
    sources: [
      <OmniBoard/>,
      <StartMenu/>,
    ],
  })),
);
