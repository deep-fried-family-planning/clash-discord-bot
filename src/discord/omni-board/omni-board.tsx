import {StartMenu} from '#src/discord/omni-board/start-menu.tsx';
import {usePage, useState} from '#src/disreact/index.ts';
import type {FC} from '#src/disreact/model/elem/fc.ts';

export const OmniBoard: FC = () => {
  const page = usePage([StartMenu]);
  const [state, update] = useState('');

  return (
    <ephemeral>
      <embed
        title={'DisReact Tester'}
      >
        {'Hello World!'}
      </embed>
      <actions>
        <primary
          label={'Start'}
          onclick={() => {
            page.next(StartMenu);
          }}
        />
      </actions>
    </ephemeral>
  );
};

OmniBoard.displayName = 'OmniBoard';
