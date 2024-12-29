import type {SelectOp} from '#pure/dfx';


export const getFirstOption      = (values: SelectOp[]) => values[0];
export const getFirstOptionValue = (values: SelectOp[]) => values[0].value;
export const getOptionValues     = (values: SelectOp[]) => values.map((v) => v.value);
