import {Rest} from '#src/disreact/enum/index.ts';
import {usePage} from '#src/disreact/model/danger.ts';
import {Linker} from '#src/omni-board/linker.tsx';
import {OmniEditorModal} from '#src/omni-board/omni-editor-dialog.tsx';
import {OmniTitleEmbed} from '#src/omni-board/omni-title-embed.tsx';



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
