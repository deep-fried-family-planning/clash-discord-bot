import {PAGE} from '#src/disreact/enum/index.ts';
import {usePage} from '#src/disreact/model/danger.ts';



export const CloseButton = () => {
  const setPage = usePage([]);

  return (
    <button
      label={'Close'}
      onClick={() => setPage(PAGE.CLOSE)}
    />
  )
}
