import type {DisReact} from '#disreact/dsx/jsx-runtime.ts';
import type {DA} from '#disreact/virtual/entities/index.ts';
import type {ne, str, unk} from '#src/internal/pure/types-pure.ts';



export const dsx    = 'select';
export const tagged = (tag: str) => tag === dsx;
export const typed  = (x: unk): x is Model => !!x && typeof x === 'object' && '_tag' in x && x._tag === dsx;

export type Attributes = DA.Select;

export type Rest = DA.Select;

export type Model = DisReact.Intrinsic & {
  _tag : typeof dsx;
  props: Attributes;
};


export const modelJsx = (
  tag: ne,
  props: ne,
): Model => {
  return {
    _tag: dsx,
    props,
  };
};
