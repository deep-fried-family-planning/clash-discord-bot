import {CloseButton} from '#src/discord/omni-board/components/close-button.tsx';
import {Header} from '#src/discord/omni-board/components/header.tsx';
import {OmniPrivate} from '#src/discord/omni-board/omni-private.tsx';
import {usePage} from '#src/disreact/model/danger.ts';
import {useState} from '#src/disreact/model/hooks.ts';



export const Link = () => {
  const setPage = usePage([OmniPrivate]);
  const [counter, setCounter] = useState(0)

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
        <button
          label={`Inc ${counter}`}
          onClick={() => setCounter(counter + 1)}
        />
      </components>
      {/* https://react.dev/reference/react-dom/createPortal /*}
      {/*{createPortal(*/}
      {/*  <Dialog*/}
      {/*    embedColor={''}*/}
      {/*  >*/}
      {/*  </Dialog>*/}
      {/*)}*/}
    </message>
  )
}
