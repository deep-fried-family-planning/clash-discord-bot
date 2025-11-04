import {AccountLinker} from '#src/omni-board/accounts/account-linker.tsx';
import {OmniUser} from '#src/omni-board/accounts/omni-user.tsx';
import {TagTokenModal} from '#src/omni-board/accounts/tag-token-modal.tsx';
import {DisReact} from '#src/disreact/DisReact.ts';
import {pipe} from 'effect/Function';
import {OmniBoard} from '#src/omni-board/omni-board.tsx';
import {StartMenu} from '#src/omni-board/start-menu.tsx';

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
