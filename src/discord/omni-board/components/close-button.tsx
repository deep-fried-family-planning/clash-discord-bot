import {usePage} from '#src/disreact/interface/hook.ts';



export const CloseButton = () => {
  const page = usePage([]);

  return (
    <button
      primary
      label={'Close'}
      onclick={() => page.close()}
    />
  )
}
