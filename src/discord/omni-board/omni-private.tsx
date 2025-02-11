import {CloseButton} from '#src/discord/omni-board/components/close-button.tsx';
import {Header} from '#src/discord/omni-board/components/header.tsx';
import {Link} from '#src/discord/omni-board/link/link.tsx';
import {NONE_STR, Rest} from '#src/disreact/abstract/index.ts';
import {useEffect, useIxData, usePage, useState} from '#src/disreact/interface/hook.ts';
import {MenuCache} from '#src/dynamo/cache/menu-cache.ts';
import {E} from '#src/internal/pure/effect.ts';
import console from 'node:console';



export const OmniPrivate = () => {
  const page = usePage([Link]);
  const [num, setNum] = useState(0);

  const [description, setDescription] = useState(NONE_STR);

  const rest = useIxData();


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
