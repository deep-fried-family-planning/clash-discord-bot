import {Header} from '#src/discord/omni-board/components/header.tsx';
import {OmniPrivate} from '#src/discord/omni-board/omni-private.tsx';
import {usePage, useState} from '#src/disreact/interface/hook.ts';



export const OmniPublic = () => {
  const page          = usePage([OmniPrivate]);
  const [num, setNum] = useState(0);

  return (
    <message public>
      <Header
        title={'Omni Board'}
        description={'V2 - JSX Pragma'}
      />
      <buttons>
        <button
          primary
          label={'Start'}
          onclick={() => setNum(num + 1)}
        />
        <button secondary label={'Help'}>
          <emoji
            name={'💩'}
          />
        </button>
        <button
          secondary
          label={'Entry'}
          onclick={() => page.next(OmniPrivate)}
        />
      </buttons>
    </message>
  );
};
