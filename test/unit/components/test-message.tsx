import {Header} from '#src/discord/components/header.tsx';
import {useState} from '#src/disreact/index.ts';
import type {FC} from '#src/disreact/model/elem/fc.ts';
import {E} from '#src/disreact/utils/re-exports';

export const TestMessage: FC = () => E.gen(function* () {
  const [num, setNum] = useState(0);
  return (
    <message display={'ephemeral'}>
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
        <u>$ not a link</u>
      </embed>
      <actions>
        <button
          onclick={() => {
            setNum(num + 1);
          }}
        >
          {`Start ${num}`}
        </button>
        <secondary
          label={'Help'}
          onclick={() => {}}
        />
      </actions>
      <select onselect={(e) => {}}>
        <option value='1' label='1'/>
        <option value='2' label='2'/>
        <option value='3' label='3' default/>
      </select>
    </message>
  );
});
