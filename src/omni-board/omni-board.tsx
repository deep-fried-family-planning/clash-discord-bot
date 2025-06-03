import {StartMenu} from '#src/omni-board/start-menu.tsx';
import {usePage} from '#src/disreact/index.ts';
import type {FC} from '#src/disreact/model/entity/fc.ts';

export const OmniBoard: FC = () => {
  const page = usePage();

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
