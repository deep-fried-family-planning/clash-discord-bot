import {OmniStart} from '#src/disreact/omni-board/omni-start.tsx';
import {OmniTitleEmbed} from '#src/disreact/omni-board/omni-title-embed.tsx';
import {usePage} from '#src/disreact/model/hooks/danger.ts';



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
