import {Header} from '#src/discord/omni-board/components/header.tsx';
import {OmniPrivate} from '#src/discord/omni-board/omni-private.tsx';
import {usePage} from '#src/disreact/model/danger.ts';
import {useRef} from '#src/disreact/model/hooks.ts';
import {E} from '#src/internal/pure/effect.ts';



export const OmniPublic = () => {
  const setPage = usePage([OmniPrivate]);

  return (
    <message public>
      <embeds>
        <Header
          title={'Omni Board'}
          description={'V2 - JSX Pragma'}
        />
      </embeds>
      <components>
        <button
          label={'Start'}
          onClick={() => setPage(OmniPrivate)}
        />
      </components>
    </message>
  );
};
