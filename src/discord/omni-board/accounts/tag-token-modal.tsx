import { UserPlayerRegistry } from '#src/data';
import {useCaller} from '#src/discord/hooks/use-caller.ts';
import * as E from 'effect/Effect';

type Props = {
  account_type: string;
};

export const TagTokenModal = (props: Props) => {
  const caller = useCaller();

  return (
    <modal
      title={'Player Tag & API Token'}
      onsubmit={E.fn(function* (event) {
        const texts = event.data.components.map((c) => c.components[0].value);

        yield* UserPlayerRegistry.register({
          caller_roles: caller.roles,
          caller_id   : caller.user_id,
          player_tag  : texts[0]!,
          api_token   : texts[1]!,
          payload     : {
            account_type: props.account_type,
          },
        });
      })}
    >
      <textinput
        label={'Player Tag'}
        placeholder={'Paste your in-game player tag.'}
        required
      />
      <textinput
        label={'API Token'}
        placeholder={'Paste your in-game API token from account settings.'}
        required
      />
    </modal>
  );
};
