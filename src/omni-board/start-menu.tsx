import {CloseButton} from '#src/components/close-button.tsx';
import {OmniUser} from '#src/omni-board/accounts/omni-user.tsx';
import {useIx, usePage} from '#src/disreact/index.ts';
import type {FC} from '#disreact/a/codec/fc.ts';
import console from 'node:console';

export const StartMenu: FC = () => {
  const ix = useIx();
  const page = usePage();

  console.log('ix:ix', ix);

  return (
    <ephemeral>
      <embed
        title={'Start Board'}
      >
        {'Welcome '}
        <at user={ix.member?.user.id ?? ''}/>
      </embed>
      <actions>
        <success
          label={'Link'}
          onclick={() => {
            page.next(OmniUser);
          }}
        />
        <primary
          label={'Info'}
          onclick={() => {

          }}
        />
        <primary
          label={'Clans'}
          onclick={() => {

          }}
        />
        <primary
          label={'Config'}
          onclick={() => {}}
        />
      </actions>
      <actions>
        <CloseButton/>
      </actions>
    </ephemeral>
  );
};
