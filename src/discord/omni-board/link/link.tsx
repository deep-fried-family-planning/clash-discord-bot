import {CloseButton} from '#src/discord/omni-board/components/close-button.tsx';
import {Header} from '#src/discord/omni-board/components/header.tsx';
import {OmniPrivate} from '#src/discord/omni-board/omni-private.tsx';
import {usePage} from '#src/disreact/model/danger.ts';



export const Link = () => {
  const setPage = usePage([OmniPrivate]);

  return (
    <message>
      <embeds>
        <Header
          title={'Link Management'}
          description={'Use the buttons below to link new accounts and manage your settings with DeepFryer.'}
        />
      </embeds>
      <components>
        <button
          label={'Back'}
          onClick={() => setPage(OmniPrivate)}
        />
        <CloseButton/>
      </components>
    </message>
  )
}
