import {Rest} from '#src/disreact/enum/index.ts';
import {usePage} from '#src/disreact/model/hooks/danger.ts';
import {Linker} from '#src/disreact/omni-board/linker.tsx';
import {OmniEditorModal} from '#src/disreact/omni-board/omni-editor-dialog.tsx';
import {OmniTitleEmbed} from '#src/disreact/omni-board/omni-title-embed.tsx';



export const OmniStart = () => {
  const setPage = usePage([Linker, OmniEditorModal]);

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
          style={Rest.SUCCESS}
          label={'Link'}
          onClick={() => {
            setPage(Linker);
          }}
        />
        <button
          style={Rest.DANGER}
          label={'Modal'}
          onClick={() => {
            setPage(OmniEditorModal);
          }}
        />
      </components>
    </message>
  );
};
