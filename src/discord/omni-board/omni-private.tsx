import {CloseButton} from '#src/discord/omni-board/components/close-button.tsx';
import {Header} from '#src/discord/omni-board/components/header.tsx';
import {Link} from '#src/discord/omni-board/link/link.tsx';
import {usePage} from '#src/disreact/model/hooks/fiber-dispatch.ts';



export const OmniPrivate = () => {
  const setPage = usePage([Link]);

  return (
    <message ephemeral>
      <Header
        title={'Welcome!'}
        description={''}
      />
      <buttons>
        <button
          primary
          label={'Link'}
          onClick={() => setPage(Link)}
        />
        <CloseButton/>
      </buttons>
    </message>
  );
};
