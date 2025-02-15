import {CloseButton} from '#src/discord/components/close-button.tsx';
import {Header} from '#src/discord/components/header.tsx';
import {Link} from '#src/discord/omni-board/link/link.tsx';
import {useEffect, usePage, useState} from '#src/disreact/interface/hook.ts';
import console from 'node:console';



export const OmniPrivate = () => {
  const page          = usePage([Link]);
  const [num, setNum] = useState(0);

  useEffect(() => console.log('USE_EFFECT'));

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
          onclick={(event) => page.next(Link)}
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
