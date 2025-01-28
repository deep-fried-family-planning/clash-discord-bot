import {Defer} from '#src/disreact/api/index.ts';
import {ButtonStyle} from '#src/disreact/api/rest.ts';
import {useDefer, usePage} from '#src/disreact/model/hooks/danger.ts';
import {Linker} from '#src/disreact/omni-board/linker.tsx';
import {OmniTitleEmbed} from '#src/disreact/omni-board/omni-title-embed.tsx';



export const OmniStart = () => {
  const setSwitch = usePage([Linker]);
  const setDefer  = useDefer();

  return (
    <message>
      <embeds>
        <OmniTitleEmbed
          title={'OmniStart'}
          description={'OmniStart'}
        />
      </embeds>
      <components>
        <button
          style={ButtonStyle.SUCCESS}
          label={'Link'}
          onClick={() => {
            // setSwitch(Linker);
            setDefer(Defer.Public());
          }}
        />
      </components>
    </message>
  );
};
