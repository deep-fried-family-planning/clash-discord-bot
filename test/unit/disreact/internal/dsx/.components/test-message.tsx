import {Header} from '#src/discord/components/header.tsx';
import {useState} from '#src/disreact/interface/hook.ts';



export const TestMessage = () => {
  const [num, setNum] = useState(0);

  return (
    <message public>
      <Header
        title={'Omni Board'}
        description={'V2 - JSX Pragma'}
      />
      <embed title={'Test Title - NOT markdown'}>
          <h3>{'H3'}</h3>
          <small>
            <p>
              <at user={'123456'}/>{'welcome!'}
            </p>
          </small>
          <br/>
          <u>{'not a link'}</u>
      </embed>
      <actions>
        <primary
          label={'Start'}
          onclick={() => setNum(num + 1)}
        />
        <secondary label={'Help'}>
          <emoji
            name={'ope'}
          />
        </secondary>
      </actions>
    </message>
  );
};
