import {useCaller} from '#src/discord/hooks/use-caller.ts';
import {AccountLinker} from '#src/discord/omni-board/accounts/account-linker.tsx';
import {useIx, usePage} from '#src/disreact/index.ts';
import * as E from 'effect/Effect';

export const OmniUser = () => E.gen(function* () {
  const caller = useCaller();
  const page = usePage([]);

  return (
    <ephemeral>
      <embed
        title={'Links'}
      >
        <at user={caller.user_id}/>{''}
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
