import type {SelectOp} from '#pure/dfx';
import type {Mutable, str} from '#src/internal/pure/types-pure.ts';


export const getFirstOption      = (values: SelectOp[]) => values[0];
export const getFirstOptionValue = (values: SelectOp[]) => values[0].value;
export const getOptionValues     = (values: SelectOp[]) => values.map((v) => v.value);


export const setFirstOptionDefault = (values: SelectOp[]) => {
  (values[0] as Mutable<SelectOp>).default = true;
  return values;
};


export const setValueSelected = (values: str[], options: SelectOp[]) => {
  return options.map((o) => ({
    ...o,
    default: values.includes(o.value),
  }));
};
