import {Header} from '#src/discord/components/header.tsx';
import {OmniPrivate} from '#src/discord/omni-board/omni-private.tsx';
import {translations} from '#src/discord/omni-board/translations.ts';
import {usePage, useState} from '#src/disreact/hook.ts';



export const OmniPublic = () => {
  const page = usePage([OmniPrivate]);
  const [num, setNum] = useState(0);

  return (
    <message public>
      <Header
        title={translations.OMNI_BOARD}
        description={'V2 - JSX Pragma'}
      />
      <buttons>
        <button
          primary
          label={`Start ${num}`}
          onclick={() => setNum(num + 1)}
        />
        <button
          secondary
          label='Help'
        >
          <emoji name='💩'/>
        </button>
        <button
          secondary
          label='Entry'
          onclick={() => page.next(OmniPrivate)}
        />
      </buttons>
    </message>
  );
};
