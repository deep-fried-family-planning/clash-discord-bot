import {AccountLinker} from '#src/discord/omni-board/accounts/account-linker.tsx';
import {OmniUser} from '#src/discord/omni-board/accounts/omni-user.tsx';
import {TagTokenModal} from '#src/discord/omni-board/accounts/tag-token-modal.tsx';
import {DisReact} from '#src/disreact/DisReact.ts';
import {pipe} from 'effect/Function';
import {OmniBoard} from './omni-board/omni-board';
import {StartMenu} from './omni-board/start-menu';

export const ComponentRouter = pipe(
  DisReact.Default({
    rehydrator: {
      sources: [
        OmniBoard,
        StartMenu,
        OmniUser,
        AccountLinker,
        TagTokenModal,
      ],
    },
    cache: {
      capacity: 0,
    },
  }),
);
