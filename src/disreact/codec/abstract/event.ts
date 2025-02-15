import type {Rest} from '#src/disreact/codec/abstract/index.ts';
import type {DATT} from '#src/disreact/dsx/index.ts';
import type {DTMLButtonElement, DTMLChannelMenuElement, DTMLMentionMenuElement, DTMLModalElement, DTMLRoleMenuElement, DTMLStringMenuElement, DTMLUserMenuElement} from '#src/disreact/dsx/types.ts';
import {Data} from 'effect';



export type CommandAutoComplete = {
  id  : string;
  rest: Rest.Interaction;
  type: typeof DATT.onautocomplete;
};



export type GlobalSlashCommand = {
  id  : string;
  rest: Rest.Interaction;
  type: typeof DATT.oninvoke;
};

export type GuildSlashCommand = {
  id  : string;
  rest: Rest.Interaction;
  type: typeof DATT.oninvoke;
};

export type UserSlashCommand = {
  id  : string;
  rest: Rest.Interaction;
  type: typeof DATT.oninvoke;
};

export type SlashCommand =
  | Data.TaggedEnum.Value<T, 'GlobalSlashCommand'>
  | Data.TaggedEnum.Value<T, 'GuildSlashCommand'>
  | Data.TaggedEnum.Value<T, 'UserSlashCommand'>;



export type UserContextCommand = {
  id  : string;
  rest: Rest.Interaction;
  type: typeof DATT.oninvoke;
};

export type MessageContextCommand = {
  id  : string;
  rest: Rest.Interaction;
  type: typeof DATT.oninvoke;
};

export type ContextCommand =
  | Data.TaggedEnum.Value<T, 'UserContextCommand'>
  | Data.TaggedEnum.Value<T, 'MessageContextCommand'>;



export type ButtonClick = {
  id    : string;
  rest  : Rest.Interaction;
  type  : typeof DATT.onclick;
  target: DTMLButtonElement;
};

export type SelectClick = {
  id    : string;
  rest  : Rest.Interaction;
  type  : typeof DATT.onclick;
  target: DTMLStringMenuElement;
};

export type UserClick = {
  id    : string;
  rest  : Rest.Interaction;
  type  : typeof DATT.onclick;
  target: DTMLUserMenuElement;
};

export type RoleClick = {
  id    : string;
  rest  : Rest.Interaction;
  type  : typeof DATT.onclick;
  target: DTMLRoleMenuElement;
};

export type ChannelClick = {
  id    : string;
  rest  : Rest.Interaction;
  type  : typeof DATT.onclick;
  target: DTMLChannelMenuElement;
};

export type MentionClick = {
  id    : string;
  rest  : Rest.Interaction;
  type  : typeof DATT.onclick;
  target: DTMLMentionMenuElement;
};

export type ClickEvent =
  | Data.TaggedEnum.Value<T, 'ButtonClick'>
  | Data.TaggedEnum.Value<T, 'SelectClick'>
  | Data.TaggedEnum.Value<T, 'UserClick'>
  | Data.TaggedEnum.Value<T, 'RoleClick'>
  | Data.TaggedEnum.Value<T, 'ChannelClick'>
  | Data.TaggedEnum.Value<T, 'MentionClick'>;



export type SubmitClick = {
  id    : string;
  rest  : Rest.Interaction;
  type  : typeof DATT.onsubmit;
  target: DTMLModalElement;
};



export type T = Data.TaggedEnum<{
  CommandAutoComplete  : CommandAutoComplete;
  GlobalSlashCommand   : GlobalSlashCommand;
  GuildSlashCommand    : GuildSlashCommand;
  UserSlashCommand     : UserSlashCommand;
  UserContextCommand   : UserContextCommand;
  MessageContextCommand: MessageContextCommand;
  ButtonClick          : ButtonClick;
  SelectClick          : SelectClick;
  UserClick            : UserClick;
  RoleClick            : RoleClick;
  ChannelClick         : ChannelClick;
  MentionClick         : MentionClick;
  SubmitClick          : SubmitClick;
}>;



export const T                     = Data.taggedEnum<T>();
export const CommandAutoComplete   = T.CommandAutoComplete;
export const GlobalSlashCommand    = T.GlobalSlashCommand;
export const GuildSlashCommand     = T.GuildSlashCommand;
export const UserSlashCommand      = T.UserSlashCommand;
export const UserContextCommand    = T.UserContextCommand;
export const MessageContextCommand = T.MessageContextCommand;
export const ButtonClick           = T.ButtonClick;
export const SelectClick           = T.SelectClick;
export const UserClick             = T.UserClick;
export const RoleClick             = T.RoleClick;
export const ChannelClick          = T.ChannelClick;
export const MentionClick          = T.MentionClick;
export const SubmitClick           = T.SubmitClick;
