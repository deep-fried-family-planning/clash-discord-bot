import {AccountLinker} from '#src/discord/omni-board/accounts/account-linker.tsx';
import {OmniUser} from '#src/discord/omni-board/accounts/omni-user.tsx';
import {TagTokenModal} from '#src/discord/omni-board/accounts/tag-token-modal.tsx';
import {DisReact} from '#src/disreact/DisReact.ts';
import {DisReactConfig} from '#src/disreact/model/DisReactConfig.ts';
import {pipe} from 'effect/Function';
import * as L from 'effect/Layer';
import {OmniBoard} from './omni-board/omni-board';
import {StartMenu} from './omni-board/start-menu';

export const ComponentRouter = pipe(
  DisReact.Default,
  L.provideMerge(DisReactConfig.configLayer({
    token  : '',
    sources: [
      OmniBoard,
      StartMenu,
      OmniUser,
      AccountLinker,
      TagTokenModal,
    ],
  })),
);
