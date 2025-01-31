import {OmniStart} from '#src/omni-board/omni-start.tsx';
import {OmniTitleEmbed} from '#src/omni-board/omni-title-embed.tsx';
import {usePage} from '#src/disreact/model/danger.ts';



export const Linker = () => {
  const setSwitch = usePage([OmniStart])

  return (
    <message>
      <embeds>
        <OmniTitleEmbed
          title={'Linker'}
          description={'Linker'}
        />
      </embeds>
      <components>
        <button
          label={'Back'}
          onClick={() => {
            setSwitch(OmniStart)
          }}
        />
      </components>
    </message>
  )
};
