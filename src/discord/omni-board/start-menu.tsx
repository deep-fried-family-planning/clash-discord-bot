import type {FC} from '#src/disreact/model/elem/fc.ts';

export const StartMenu: FC = () => {
  return (
    <ephemeral>
      <embed
        title={'DisReact Tester'}
      >
        {'Hello World!'}
      </embed>
    </ephemeral>
  );
};

StartMenu.displayName = 'StartMenu';
