import {usePage} from '#src/disreact/model/hooks/danger.ts';
import {OmniStart} from '#src/disreact/omni-board/omni-start.tsx';



export const OmniEditorModal = () => {
  const setPage = usePage([OmniStart]);

  return (
    <dialog
      title={'OmniEditorDialog'}
      onSubmit={() => {
        setPage(OmniStart)
      }}
    >
      <text label={'OmniEditor'}/>
      <text label={'OmniEditor2'}/>
    </dialog>
  )
}
