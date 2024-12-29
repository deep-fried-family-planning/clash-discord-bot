import {useState} from '#discord/hooks/use-state';
import {Select} from '#discord/entities/cxv.ts';
import type {SelectOp} from '#pure/dfx';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {CxV} from '..';


export type FunctionComponent<P> = (props: P) => CxV.T;
export type FC<P> = (props: P) => CxV.T;


type SingleSelectProps = {
  state_id   : str;
  placeholder: str;
  options    : SelectOp[];
};
export const SingleSelect: FC<SingleSelectProps> = (props) => {
  const [options, setOptions]   = useState(`${props.state_id}_ops`, [] as SelectOp[]);
  const [selected, setSelected] = useState(`single_${props.state_id}`, [] as SelectOp[]);

  return Select({
    placeholder: props.placeholder,
    options    : props.options.map((o) => ({
      ...o,
      default: selected.map((s) => s.value).includes(o.value),
    })),
    onClick: (values) => {
      setSelected(values);
    },
  });
};
