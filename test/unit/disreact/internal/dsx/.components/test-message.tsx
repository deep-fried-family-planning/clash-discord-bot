import {Header} from '#src/discord/components/header.tsx';
import {useState} from '#src/disreact/index.ts';
import {E} from '#src/internal/pure/effect.ts';



export const TestMessage = () => E.gen(function* () {
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
            <at user={'123456'}/>
            {'welcome!'}
          </p>
        </small>
        <br/>
        <u>${'not a link'}</u>
      </embed>
      <actions>
        <button
          primary
          label={'Start'}
          onclick={() => setNum(num + 1)}
        />
        <secondary label={'Help'} onclick={() => console.log('help')}/>
      </actions>
      <select onselect={(e) => console.log(e)}>
        <option value={'1'} label={'1'}/>
        <option value={'2'} label={'2'}/>
        <option value={'3'} label={'3'} default/>
      </select>
    </message>
  );
});

TestMessage.displayName = 'TestMessage';
