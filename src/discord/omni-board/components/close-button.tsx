import {PAGE} from '#src/disreact/runtime/enum/index.ts';
import {usePage} from '#src/disreact/model/hooks/fiber-dispatch.ts';



export const CloseButton = () => {
  const setPage = usePage([]);

  return (
    <button
      primary
      label={'Close'}
      onClick={() => setPage(PAGE.CLOSE)}
    >

    </button>
  )
}
