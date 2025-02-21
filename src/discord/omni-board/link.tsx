import {CloseButton} from '#src/discord/components/close-button.tsx';
import {Header} from '#src/discord/components/header.tsx';
import {InfoPanel} from '#src/discord/omni-board/info-panel.tsx';
import {LinkDialog} from '#src/discord/omni-board/link-dialog.tsx';
import {OmniPrivate} from '#src/discord/omni-board/omni-private.tsx';
import {usePage} from '#src/disreact/index.ts';



export const Link = () => {
  const page = usePage([OmniPrivate, LinkDialog, InfoPanel]);

  return (
    <message ephemeral>
      <Header
        title={'Link Management'}
        description={'Use the buttons below to link new accounts and manage your settings with DeepFryer.'}
      />
      <actions>
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
        <button
          secondary
          label={'Yield*'}
          onclick={() => page.next(InfoPanel)}
        />
      </actions>
    </message>
  );
};
