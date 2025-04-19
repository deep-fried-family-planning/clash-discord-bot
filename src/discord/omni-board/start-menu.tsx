import {CloseButton} from '#src/discord/components/close-button.tsx';
import type {FC} from '#src/disreact/model/elem/fc.ts';

export const StartMenu: FC = () => {
  return (
    <ephemeral>
      <embed
        title={'DisReact Tester'}
      >
        {'Hello World!'}
      </embed>
      <actions>
        <CloseButton/>
      </actions>
    </ephemeral>
  );
};

StartMenu.displayName = 'StartMenu';
