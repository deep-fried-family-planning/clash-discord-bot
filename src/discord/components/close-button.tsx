import {usePage} from '#src/disreact/index.ts';

export const CloseButton = () => {
  const page = usePage();

  return (
    <secondary
      label={'Close'}
      onclick={() => page.close()}
    />
  );
};
