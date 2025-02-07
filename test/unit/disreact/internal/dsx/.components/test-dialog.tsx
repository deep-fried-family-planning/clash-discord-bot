import {Header} from '#src/discord/omni-board/components/header.tsx';
import {useState} from '#src/disreact/interface/hook.ts';



export const TestDialog = () => {
  const [num, setNum] = useState(0);

  return (
    <modal
      title={'test title'}
      onsubmit={() => setNum(num + 1)}
    >
      <text label={'test text'}/>
    </modal>
  );
};
