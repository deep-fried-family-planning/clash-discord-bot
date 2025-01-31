import {CloseButton} from '#src/discord/omni-board/components/close-button.tsx';
import {Header} from '#src/discord/omni-board/components/header.tsx';
import {Link} from '#src/discord/omni-board/link/link.tsx';
import {usePage} from '#src/disreact/model/danger.ts';



export const OmniPrivate = () => {
  const setPage = usePage([Link]);

  return (
    <message>
      <embeds>
        <Header
          title={'Welcome!'}
          description={''}
        />
      </embeds>
      <components>
        <success
          label={'Link'}
          onClick={() => setPage(Link)}
        />
        <CloseButton/>
      </components>
    </message>
  );
};
