import {Header} from '#src/discord/omni-board/components/header.tsx';
import {OmniPrivate} from '#src/discord/omni-board/omni-private.tsx';
import {usePage} from '#src/disreact/model/danger.ts';



export const OmniPublic = () => {
  const setPage = usePage([OmniPrivate]);

  return (
    <message public>
      <embeds>
        <Header
          title={'Omni Board'}
          description={''}
        />
      </embeds>
      <components>
        <primary
          label={'Start'}
          onClick={() => setPage(OmniPrivate)}
        />
      </components>
    </message>
  );
};
