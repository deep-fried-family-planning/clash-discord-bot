import {Link} from '#src/discord/omni-board/link.tsx';
import type {FC} from '#src/disreact/model/elem/fc.ts';
import {usePage} from '#src/disreact/index.ts';



type Props = {
  submitText?: string;
};

export const LinkDialog: FC<Props> = (props) => {
  const page = usePage([Link]);

  return (
    <modal
      title="Testing"
      onsubmit={() => {
        page.next(Link, {});
      }}
    >
      <text label="Testing1" value="" />
      <text label="Testing2" value="" />
      <text label="Testing3" value="" />
      <text label="Testing4" value="" />
      <text label="Testing5" value="" />
    </modal>
  );
};

LinkDialog.isModal = true;
