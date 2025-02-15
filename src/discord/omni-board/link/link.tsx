import {CloseButton} from '#src/discord/components/close-button.tsx';
import {Header} from '#src/discord/components/header.tsx';
import {LinkDialog} from '#src/discord/omni-board/link/link-dialog.tsx';
import {OmniPrivate} from '#src/discord/omni-board/omni-private.tsx';
import {usePage} from '#src/disreact/interface/hook.ts';



export const Link = () => {
  const page = usePage([OmniPrivate, LinkDialog]);

  return (
    <message ephemeral>
      <Header
        title={'Link Management'}
        description={'Use the buttons below to link new accounts and manage your settings with DeepFryer.'}
      />
      <buttons>
        <button
          secondary
          label={'Back'}
          onclick={() => page.next(OmniPrivate)}
        />
        <CloseButton/>
        <button
          secondary
          label={'Modal'}
          onclick={() => page.next(LinkDialog)}
        />
      </buttons>
    </message>
  );
};
