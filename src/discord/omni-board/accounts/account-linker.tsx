import {CloseButton} from '#src/discord/components/close-button.tsx';
import {SELECT_ACCOUNT_TYPE} from '#src/discord/old/ix-constants.ts';
import {TagTokenModal} from '#src/discord/omni-board/accounts/tag-token-modal.tsx';
import {usePage, useState} from '#src/disreact/index.ts';

type Props = {
  success?: boolean;
  type?   : string;
};

export const AccountLinker = (props: Props) => {
  const page = usePage([]);
  const [success, setSuccess] = useState(props.success);
  const [type, setType] = useState(props.type ?? SELECT_ACCOUNT_TYPE[0].value);

  return (
    <ephemeral>
      <embed
        title={'New Account Link'}
      >
        {'Select the type of COC account to link.'}
        {'Then use the Tag/Token button to submit your in-game player tag and API token'}
      </embed>
      {success === false && (
        <embed title={'Link Failed'}>
          {'Please try again.'}
        </embed>
      )}
      <select
        placeholder={'Select Account Type'}
        onselect={(event) => {
          setType(event.values[0]);
          setSuccess(undefined);
        }}
      >
        {SELECT_ACCOUNT_TYPE.map((aT) =>
          <option
            label={aT.label}
            value={aT.value}
            description={aT.description}
            default={aT.value === type}
          />,
        )}
      </select>
      <actions>
        <success
          label={'Tag/Token'}
          onclick={() => {
            setSuccess(undefined);
            page.next(TagTokenModal, {account_type: type});
          }}
        />
        <CloseButton/>
      </actions>
    </ephemeral>
  );
};
