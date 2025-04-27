import {StartMenu} from '#src/discord/omni-board/start-menu.tsx';
import {usePage} from '#src/disreact/index.ts';
import type {FC} from '#src/disreact/model/elem/fc.ts';

export const OmniBoard: FC = () => {
  const page = usePage([StartMenu]);

  return (
    <message display={'public'}>
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
    </message>
  );
};

OmniBoard.displayName = 'OmniBoard';
