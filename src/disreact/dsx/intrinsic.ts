import type {JSX} from '#disreact/dsx/jsx-runtime.ts';
import type {RestEmbed} from '#pure/dfx';
import type {snow} from '#src/discord/types.ts';
import {BUTTON_STYLE, COMPONENT_TYPE, type Emoji} from '#src/internal/disreact/virtual/entities/dapi.ts';
import type {DA} from '#src/internal/disreact/virtual/entities/index.ts';
import type {str, und} from '#src/internal/pure/types-pure.ts';
import {Discord} from 'dfx/index';


export const ActionRowTag = 'components';
export type ActionRowAttributes = JSX.IntrinsicAttributes & {};
export type ActionRowProps = ActionRowAttributes & {
  children: ButtonProps[];
};
export type ActionRowOut = {
  type      : typeof DA.En.CT.ACTION_ROW;
  components: ButtonOut[];
};
export type ActionRowIn = ActionRowOut;

export const createActionRowElement = (type: typeof ActionRowTag, props: ActionRowProps) => {
  return {
    type,
    props,
  };
};

export const encodeActionRowElement = (props: ActionRowAttributes): ActionRowOut => {
  return {
    type      : Discord.ComponentType.ACTION_ROW,
    components: props.children.map((c) => encodeButtonElement(c)),
  };
};

export const decodeActionRowElement = (rest: ActionRowIn): ActionRowProps => {
  return {
    children: rest.components.map((c) => decodeButtonElement(c)),
  };
};


export const ButtonTag = 'button';
export type ButtonAttributes = JSX.IntrinsicAttributes & {
  custom_id?: string;
  style?    : Discord.ButtonStyle;
  label?    : | und | string;
  emoji?    : | und | Emoji;
  sku_id?   : | und | snow;
  url?      : | und | string;
  disabled? : | und | boolean;
  onClick?  : () => void;
};
export type ButtonProps = ButtonAttributes;
export type ButtonOut = {
  type      : Discord.ComponentType.BUTTON;
  style     : Discord.ButtonStyle;
  label?    : und | string;
  emoji?    : und | Emoji;
  custom_id?: und | string;
  sku_id?   : und | snow;
  url?      : und | string;
  disabled? : und | boolean;
};
export type ButtonIn = ButtonOut;

export const createButtonElement = (type: typeof ButtonTag, props: ButtonProps) => {
  return {
    type,
    props,
  };
};

export const encodeButtonElement = (props: ButtonAttributes): ButtonOut => {
  return {
    custom_id: props.custom_id,
    type     : COMPONENT_TYPE.BUTTON,
    style    : props.style ?? BUTTON_STYLE.PRIMARY,
    label    : props.label,
    emoji    : props.emoji,
    sku_id   : props.sku_id,
    url      : props.url,
    disabled : props.disabled,
  };
};

export const decodeButtonElement = (rest: ButtonIn): ButtonProps => {
  return {
    style   : rest.style,
    label   : rest.label,
    emoji   : rest.emoji,
    sku_id  : rest.sku_id,
    url     : rest.url,
    disabled: rest.disabled ?? false,
    onClick : () => {},
  };
};


export const DialogTag = 'dialog';
export type DialogAttributes = JSX.IntrinsicAttributes & {
  custom_id?: string;
  title?    : str;
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

export const createDialogElement = (type: typeof DialogTag, props: DialogProps) => {
  return {
    type,
    props,
  };
};

export const encodeDialogElement = (props: DialogAttributes): DialogOut => {
  return {
    custom_id : props.custom_id ?? '',
    title     : props.title ?? '',
    components: [],
  };
};

export const decodeDialogElement = (rest: DialogIn): DialogProps => {
  return {
    custom_id: rest.custom_id,
    title    : '',
    children : rest.components.map((c) => c.map((d) => decodeTextInputElement(d))),
  };
};


export const EmbedTag = 'embed';
export type EmbedAttributes = {} & JSX.IntrinsicAttributes;
export type EmbedProps = EmbedAttributes;
export type EmbedOut = RestEmbed;
export type EmbedIn = EmbedIn;

export const createEmbedElement = (type: typeof EmbedTag, props: EmbedProps) => {
  return {
    type,
    props,
  };
};



export const MessageTag = 'message';
export type MessageAttributes = JSX.IntrinsicAttributes & {
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

export const createMessageElement = (type: typeof MessageTag, props: MessageProps) => {
  return {
    type,
    props,
  };
};

export const encodeMessageElement = (props: MessageProps): MessageOut => {
  return {
    content   : props.content ?? '',
    embeds    : props.embeds ?? [],
    components: props.children?.map((c) => encodeActionRowElement(c)) ?? [],
  };
};

export const decodeMessageElement = (rest: MessageIn): MessageProps => {
  return {
    content : rest.content,
    embeds  : rest.embeds,
    children: rest.components.map((c) => decodeActionRowElement(c)),
  };
};


export const UserSelectTag = 'user';
export const UserOptionTag = 'user';

export const RoleSelectTag = 'role';
export const RoleOptionTag = 'role';

export const ChannelSelectTag = 'channel';
export const ChannelOptionTag = 'option';

export const MentionSelectTag = 'mention';


export const SelectMenuTag = 'select';
export const SelectOptionTag = 'option';
export type SelectMenuAttributes = JSX.IntrinsicAttributes &  {
  string? : boolean;
  channel?: boolean;
  user?   : boolean;
  role?   : boolean;
  mention?: boolean;

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
  type           : typeof Discord.ComponentType.STRING_SELECT;
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

export const createSelectMenuElement = (type: typeof SelectMenuTag, props: SelectMenuProps) => {
  return {
    type,
    props,
  };
};

export const encodeSelectMenuElement = (props: SelectMenuAttributes): SelectMenuOut => {
  return {
    type          : Discord.ComponentType.STRING_SELECT,
    custom_id     : props.custom_id ?? '',
    options       : props.options ?? [],
    channel_types : props.channel_types ?? [],
    placeholder   : props.placeholder ?? '',
    default_values: props.default_values ?? [],
    min_values    : props.min_values ?? 0,
    max_values    : props.max_values ?? 1,
    disabled      : props.disabled ?? false,
  };
};

export const decodeSelectMenuElement = (rest: SelectMenuIn): SelectMenuProps => {
  return {
    custom_id     : rest.custom_id,
    options       : rest.options!,
    channel_types : rest.channel_types!,
    placeholder   : rest.placeholder!,
    default_values: rest.default_values!,
    min_values    : rest.min_values!,
    max_values    : rest.max_values!,
    disabled      : rest.disabled!,
  };
};



export const TextTag = 'text';
export const TextInputTag = 'textinput';
export type TextInputAttributes = JSX.IntrinsicAttributes & {
  custom_id?  : string;
  style?      : Discord.TextInputStyle;
  label       : string;
  min_length? : number;
  max_length? : number;
  required?   : boolean;
  value?      : string;
  placeholder?: string;
};
export type TextInputProps = TextInputAttributes;
export type TextInputOut = {
  type        : Discord.ComponentType.TEXT_INPUT;
  custom_id   : string;
  style       : Discord.TextInputStyle;
  label       : string;
  min_length? : number;
  max_length? : number;
  required?   : boolean;
  value?      : string;
  placeholder?: string;
};
export type TextInputIn = TextInputOut;

export const createTextInputElement = (type: typeof TextTag, props: TextInputProps) => {
  return {
    type,
    props,
  };
};

export const encodeTextInputElement = (props: TextInputAttributes): TextInputOut => {
  return {
    type       : Discord.ComponentType.TEXT_INPUT,
    custom_id  : props.custom_id ?? '',
    style      : props.style ?? Discord.TextInputStyle.SHORT,
    label      : props.label,
    min_length : props.min_length ?? 0,
    max_length : props.max_length ?? 4000,
    required   : props.required ?? false,
    value      : props.value ?? '',
    placeholder: props.placeholder ?? '',
  };
};

export const decodeTextInputElement = (rest: TextInputIn): TextInputProps => {
  return {
    custom_id  : rest.custom_id,
    style      : rest.style,
    label      : rest.label,
    min_length : rest.min_length!,
    max_length : rest.max_length!,
    required   : rest.required!,
    value      : rest.value!,
    placeholder: rest.placeholder!,
  };
};
