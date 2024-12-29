import {Row, Select} from '#discord/entities/vc.ts';
import type {SelectOp} from '#pure/dfx';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {AnyE} from '#src/internal/types.ts';


type Props = {
  id         : str;
  placeholder: str;
  onClick?   : (values: SelectOp) => void | AnyE<void>;
};


export const SingleSelect = (props: Props) => {
  return Row(
    Select({
      accessor   : props.id,
      placeholder: props.placeholder,
    }),
  );
};
