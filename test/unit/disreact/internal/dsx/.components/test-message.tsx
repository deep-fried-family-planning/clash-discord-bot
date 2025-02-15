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
      <embed>
        <title>{'Test Title - NOT markdown'}</title>
        <description>
          <h3>{'H3'}</h3>
          <small>
            <p>
              <at user id={'123456'}/>{'welcome!'}
            </p>
          </small>
          <br/>
          <u>${'not a link'}</u>


        </description>
      </embed>
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
