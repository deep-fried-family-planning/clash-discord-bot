/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-empty-object-type */


import type {Rest} from '#src/disreact/enum/index.ts';
import type {JSX} from '#src/disreact/jsx-runtime.ts';
import type {E} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';



export type TagFunc = (props: any) => any;

export type TagTypes =
  | string
  | null
  | undefined
  | TagFunc;

export type SharedAttributes = {

};

export type ActionRowAttributes = JSX.IntrinsicAttributes & {};
export type ActionRowProps = ActionRowAttributes & {
  children: ButtonProps[];
};
export type ActionRowOut = {
  type      : typeof Rest.ACTION_ROW;
  components: ButtonOut[];
};
export type ActionRowIn = ActionRowOut;

export type ButtonAttributes = JSX.IntrinsicAttributes & {
  custom_id?: string;
  style?    : number;
  label?    : string | undefined;
  emoji?    : Rest.Emoji | undefined;
  sku_id?   : string | undefined;
  url?      : string | undefined;
  disabled? : boolean | undefined;
  onClick?  : (event: any) => void | E.Effect<void, any, any>;
};
export type ButtonProps = ButtonAttributes;
export type ButtonOut = {
  type      : typeof Rest.BUTTON;
  style     : Rest.ButtonStyle;
  label?    : string | undefined;
  emoji?    : Rest.Emoji | undefined;
  custom_id?: string | undefined;
  sku_id?   : string | undefined;
  url?      : string | undefined;
  disabled? : boolean | undefined;
};

export type DialogAttributes = JSX.IntrinsicAttributes & {
  custom_id?: string;
  title?    : str;
  onSubmit? : () => void;
};
export type DialogProps = DialogAttributes & {
  children: TextInputProps[];
};
export type DialogOut = {
  custom_id : string;
  title     : str;
  components: TextInputOut[][];
};
export type DialogIn = {
  custom_id : string;
  components: TextInputIn[][];
};

export type EmbedAttributes = Rest.Embed & JSX.IntrinsicAttributes;
export type EmbedProps = EmbedAttributes;
export type EmbedOut = Rest.Embed;
export type EmbedIn = EmbedOut;

export type MessageAttributes = JSX.IntrinsicAttributes & {
  public? : boolean;
  content?: string;
  embeds? : any[];
};
export type MessageProps = MessageAttributes & {
  children?: ActionRowProps[];
};
export type MessageOut = {
  content   : string;
  embeds    : any[];
  components: ActionRowOut[];
};
export type MessageIn = MessageOut;

export type SelectMenuAttributes = JSX.IntrinsicAttributes & {
  string?        : boolean;
  channel?       : boolean;
  user?          : boolean;
  role?          : boolean;
  mention?       : boolean;
  custom_id?     : string;
  options?       : [];
  channel_types? : [];
  placeholder?   : string;
  default_values?: [];
  min_values?    : number;
  max_values?    : number;
  disabled?      : boolean;
};
export type SelectMenuProps = SelectMenuAttributes;
export type SelectMenuOut = {
  type           : typeof Rest.ComponentType.STRING_SELECT;
  custom_id      : string;
  options?       : [];
  channel_types? : [];
  placeholder?   : string;
  default_values?: [];
  min_values?    : number;
  max_values?    : number;
  disabled?      : boolean;
};
export type SelectMenuIn = SelectMenuOut;

export type TextInputAttributes = JSX.IntrinsicAttributes & {
  custom_id?  : string;
  style?      : Rest.TextInputStyle;
  label       : string;
  min_length? : number;
  max_length? : number;
  required?   : boolean;
  value?      : string;
  placeholder?: string;
};
export type TextInputProps = TextInputAttributes;
export type TextInputOut = {
  type        : Rest.ComponentType;
  custom_id   : string;
  style       : Rest.TextInputStyle;
  label       : string;
  min_length? : number;
  max_length? : number;
  required?   : boolean;
  value?      : string;
  placeholder?: string;
};
export type TextInputIn = TextInputOut;
