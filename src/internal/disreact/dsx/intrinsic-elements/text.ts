import type {DisReact} from '#disreact/dsx/jsx-runtime.ts';
import type {ne, str, und, unk} from '#src/internal/pure/types-pure.ts';



export const dsx    = 'text';
export const tagged = (tag: str) => tag === dsx;
export const typed  = (x: unk): x is Model => !!x && typeof x === 'object' && '_tag' in x && x._tag === dsx;

export type Attributes = {
  custom_id: str;
};

export type Rest = {
  custom_id?: und | str;
};

export type Model = DisReact.Intrinsic & {
  _tag : typeof dsx;
  props: Attributes;
};



export const jsxText = (
  tag: ne,
  props: ne,
): Model => {
  return {
    _tag: dsx,
    props,
  };
};
