import {CloseButton} from '#src/discord/components/close-button.tsx';
import {Header} from '#src/discord/components/header.tsx';
import {Link} from '#src/discord/omni-board/link.tsx';
import type {FC} from '#src/disreact/model/entity/fc.ts';
import {useEffect, usePage, useState} from '#src/disreact/index.ts';
import console from 'node:console';



export const OmniPrivate: FC = () => {
  const page          = usePage([Link]);
  const [num, setNum] = useState(0);

  useEffect(() => console.log('USE_EFFECT'));

  return (
    <>
      <message ephemeral>
        <Header
          title={'Welcome!'}
          description={'Empty'}
        />
        <actions>
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
        </actions>
      </message>
    </>
  );
};
