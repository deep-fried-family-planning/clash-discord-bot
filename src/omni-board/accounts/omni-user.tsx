import {useCaller} from '#src/omni-board/hooks/use-caller.ts';
import {AccountLinker} from '#src/omni-board/accounts/account-linker.tsx';
import {usePage} from '#src/disreact/index.ts';
import * as E from 'effect/Effect';

export const OmniUser = () => E.gen(function* () {
  const caller = useCaller();
  const page = usePage();

  return (
    <ephemeral>
      <embed
        title={'Links'}
      >
        <at user={caller.user_id}/>
        {''}
      </embed>
      <actions>
        <success
          label={'New Link'}
          onclick={() => page.next(AccountLinker, {})}
        />
      </actions>
    </ephemeral>
  );
});
