import {Children, type Text} from '#disreact/dsx/intrinsic-elements/index.ts';
import type {DisReact} from '#disreact/dsx/jsx-runtime.ts';
import type {ne, str, unk} from '#src/internal/pure/types-pure.ts';



export const dsx = 'dialog';
export const tagged = (x: str) => x === dsx;
export const typed  = (x: unk): x is Model => !!x && typeof x === 'object' && '_tag' in x && x._tag === dsx;

export type Attributes = {
  title   : str;
  onSubmit: () => void;
};

export type RestIn = {
  custom_id : str;
  components: [Text.Rest][];
};

export type RestOut = {
  custom_id : str;
  title     : str;
  components: [Text.Rest][];
};

export type Model = DisReact.Intrinsic & {
  _tag : typeof dsx;
  props: Attributes & {
    children: [Text.Model][];
  };
};



export const createDialogElement = (
  tag: ne,
  props: ne,
): Model => {
  return {
    _tag : dsx,
    props: {
      ...props,
      children: Children.asNodes(props.children).map((child) => [child] as const),
    },
  };
};
