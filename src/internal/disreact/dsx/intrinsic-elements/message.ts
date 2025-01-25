import type {Button, Children, Select} from '#disreact/dsx/intrinsic-elements/index.ts';
import type {DisReact} from '#disreact/dsx/jsx-runtime.ts';
import type {ne, str, und, unk} from '#src/internal/pure/types-pure.ts';



export const dsx    = 'message';
export const tagged = (x: str) => x === dsx;
export const typed  = (x: unk): x is Model => !!x && typeof x === 'object' && '_tag' in x && x._tag === dsx;

export type Attributes = {
  content?: str;
  children: {};
};

export type Rest = {
  content?   : und | str;
  embeds?    : und | [];
  components?: Children.Many<Select.Model | Button.Model>;
};

export type Model = DisReact.Intrinsic & {


};



export const modelJsx = (
  tag: ne,
  props: ne,
) => {
  return {
    _tag: dsx,
    props,
  };
};
