import {Header} from '#src/discord/omni-board/components/header.tsx';
import {useState} from '#src/disreact/interface.ts';
// import {OmniPrivate} from '#src/discord/omni-board/omni-private.tsx';
// import {usePage} from '#src/disreact/model/danger.ts';



export const OmniPublic = () => {
  // const setPage = usePage([OmniPrivate]);

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
          // onClick={() => setPage(OmniPrivate)}
        />
        <button secondary label={'Help'}>
          <emoji
            name={'ope'}
          />
        </button>
      </buttons>
    </message>
  );
};
