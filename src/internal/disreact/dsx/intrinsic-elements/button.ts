import {createDefinition} from '#disreact/dsx/definitions/testing/definition.ts';
import type {Button, Props} from '#disreact/dsx/intrinsic-elements/index.ts';
import type {DisReact} from '#disreact/dsx/jsx-runtime.ts';
import type {Emoji} from '#disreact/virtual/entities/dapi.ts';
import {NONE} from '#disreact/virtual/kinds/constants.ts';
import type {snow} from '#src/discord/types.ts';
import type {str, und, unk} from '#src/internal/pure/types-pure.ts';
import {Discord} from 'dfx';



const noop = () => {
};

export const dsx = 'button';
export const typed = (x: unk): x is Model => !!x && typeof x === 'object' && '_tag' in x && x._tag === dsx;


export type Attributes = {
  style?   : Discord.ButtonStyle;
  label?   : | und | string;
  emoji?   : | und | Emoji;
  sku_id?  : | und | snow;
  url?     : | und | string;
  disabled?: | und | boolean;
  onClick? : () => void;
};

export type Rest = {
  type      : Discord.ComponentType.BUTTON;
  style     : Discord.ButtonStyle;
  label?    : | und | string;
  emoji?    : | und | Emoji;
  custom_id?: | und | string;
  sku_id?   : | und | snow;
  url?      : | und | string;
  disabled? : | und | boolean;
};

export type Model = DisReact.Intrinsic & {
  _tag : typeof dsx;
  id   : str;
  props: Props.Leaf<Attributes>;
};



export const modelJsx = (
  _tag: typeof dsx,
  props: Props.Call<Attributes, Button.Attributes>,
): Model => {
  return {
    _tag : dsx,
    id   : props.id ?? '',
    props: {
      style   : props.style ?? Discord.ButtonStyle.PRIMARY,
      label   : props.label,
      emoji   : props.emoji,
      sku_id  : props.sku_id,
      url     : props.url,
      disabled: props.disabled ?? false,
      onClick : props.onClick ?? noop,
    },
  };
};

export const modelRest = (ingress: Rest): Model => {
  return {
    _tag : dsx,
    id   : ingress.custom_id ?? NONE,
    props: {
      style   : ingress.style,
      label   : ingress.label,
      emoji   : ingress.emoji,
      sku_id  : ingress.sku_id,
      url     : ingress.url,
      disabled: ingress.disabled ?? false,
      onClick : noop,
    },
  };
};


export const encode = (model: Model): Rest => {
  return {

  };
};


const Button = createDefinition(
  'button',
  (props: Attributes) => {
    return {
      style   : props.style,
      label   : props.label,
      emoji   : props.emoji,
      sku_id  : props.sku_id,
      url     : props.url,
      disabled: props.disabled ?? false,
      onClick : noop,
    };
  },
  (element) => {
    return {
      custom_id: element.id,
      type     : Discord.ComponentType.BUTTON,
      style    : element.style ?? Discord.ButtonStyle.PRIMARY,
      label    : element.label,
      emoji    : element.emoji,
      sku_id   : element.sku_id,
      url      : element.url,
      disabled : element.disabled,
    };
  },
);
