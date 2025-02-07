import {Header} from '#src/discord/omni-board/components/header.tsx';
import {useState} from '#src/disreact/interface/hook.ts';



export const TestMessage = () => {
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
            name={'ope'}
          />
        </button>
      </buttons>
    </message>
  );
};
