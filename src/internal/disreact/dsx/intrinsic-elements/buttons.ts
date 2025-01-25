import type {Props} from '#disreact/dsx/intrinsic-elements/index.ts';
import {Button, Children} from '#disreact/dsx/intrinsic-elements/index.ts';
import type {obj, unk} from '#src/internal/pure/types-pure.ts';
import {Discord} from 'dfx/index';



export const dsx   = 'buttons';
export const typed = (x: unk): x is Model => !!x && typeof x === 'object' && '_tag' in x && x._tag === dsx;

export type Attributes = {
  children: obj;
};

export type Rest = {
  type      : Discord.ComponentType.ACTION_ROW;
  components: Button.Rest[];
};

export type Model = Children.Many<Button.Model>;



export const modelJsx = (
  _tag: typeof dsx,
  props: Props.Call<Attributes, Button.Model>,
): Model => {
  return Children.asNodes(props.children);
};


export const modelRest = (ingress: Rest): Model => {
  return ingress.components.map(Button.modelRest);
};


export const encode = (model: Model): Rest => {
  return {
    type      : Discord.ComponentType.ACTION_ROW,
    components: model.map(Button.encode),
  };
};
