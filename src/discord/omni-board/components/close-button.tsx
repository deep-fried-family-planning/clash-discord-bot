import {PAGE} from '#src/disreact/runtime/enum/index.ts';
import {usePage} from '#src/disreact/model/danger.ts';



export const CloseButton = () => {
  const setPage = usePage([]);

  return (
    <button
      primary
      label={'Close'}
      onClick={() => setPage(PAGE.CLOSE)}
    >
      <buttons></buttons>
    </button>
  )
}
