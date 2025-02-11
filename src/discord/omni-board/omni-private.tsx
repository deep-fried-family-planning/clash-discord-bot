import {CloseButton} from '#src/discord/omni-board/components/close-button.tsx';
import {Header} from '#src/discord/omni-board/components/header.tsx';
import {Link} from '#src/discord/omni-board/link/link.tsx';
import {usePage, useState} from '#src/disreact/interface/hook.ts';



export const OmniPrivate = () => {
  const page = usePage([Link]);
  const [num, setNum] = useState(0);

  return (
    <message ephemeral>
      <Header
        title={'Welcome!'}
        description={'Empty'}
      />
      <buttons>
        <button
          primary
          label={'Link'}
          onclick={() => page.next(Link)}
        />
        <button
          primary
          label={`Increment ${num}`}
          onclick={() => setNum(num + 1)}
        />
        <CloseButton/>
      </buttons>
    </message>
  );
};
