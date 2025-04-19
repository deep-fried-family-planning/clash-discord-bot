import {DisReact} from '#src/disreact/runtime/DisReact.ts';
import {DisReactConfig} from '#src/disreact/runtime/DisReactConfig.ts';
import {L, pipe} from '#src/internal/pure/effect.ts';
import {OmniBoard} from './omni-board/omni-board';
import {StartMenu} from './omni-board/start-menu';

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
