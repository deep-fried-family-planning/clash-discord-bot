import {CloseButton} from '#src/discord/components/close-button.tsx';
import * as E from 'effect/Effect';

export const UserAccounts = () => E.gen(function* () {
  return (
    <ephemeral>
      <embed
        title={'Account Links'}
      />
      <actions>
        <CloseButton/>
      </actions>
    </ephemeral>
  );
});
