import {usePage} from '#src/disreact/index.ts';

export const CloseButton = () => {
  const page = usePage([]);
  return (<secondary
    custom_id={'CloseButton'}
    onclick={() => page.close()}
  />);
};
