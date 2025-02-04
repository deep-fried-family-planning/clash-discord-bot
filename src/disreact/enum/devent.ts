
import type {dattributes} from '#src/disreact/dsx/index.ts';
import type {DTMLButtonElement, DTMLChannelMenuElement, DTMLMentionMenuElement, DTMLModalElement, DTMLRoleMenuElement, DTMLStringMenuElement, DTMLUserMenuElement} from '#src/disreact/dsx/types.ts';
import type {Rest} from '#src/disreact/runtime/enum/index.ts';
import {Data} from 'effect';

export type CommandAutoComplete = {
  id  : string;
  rest: Rest.Interaction;
  type: typeof dattributes.onclick;
};

export type GlobalSlashCommand = {
  id  : string;
  rest: Rest.Interaction;
  type: typeof dattributes.onclick;
};

export type GuildSlashCommand = {
  id  : string;
  rest: Rest.Interaction;
  type: typeof dattributes.onclick;
};

export type UserSlashCommand = {
  id  : string;
  rest: Rest.Interaction;
  type: typeof dattributes.onclick;
};

export type UserContextCommand = {
  id  : string;
  rest: Rest.Interaction;
  type: typeof dattributes.onclick;
};

export type MessageContextCommand = {
  id  : string;
  rest: Rest.Interaction;
  type: typeof dattributes.onclick;
};

export type ButtonClick = {
  id    : string;
  rest  : Rest.Interaction;
  type  : typeof dattributes.onclick;
  target: DTMLButtonElement;
};

export type SelectClick = {
  id    : string;
  rest  : Rest.Interaction;
  type  : typeof dattributes.onclick;
  target: DTMLStringMenuElement;
};

export type UserClick = {
  id    : string;
  rest  : Rest.Interaction;
  type  : typeof dattributes.onclick;
  target: DTMLUserMenuElement;
};

export type RoleClick = {
  id    : string;
  rest  : Rest.Interaction;
  type  : typeof dattributes.onclick;
  target: DTMLRoleMenuElement;
};

export type ChannelClick = {
  id    : string;
  rest  : Rest.Interaction;
  type  : typeof dattributes.onclick;
  target: DTMLChannelMenuElement;
};

export type MentionClick = {
  id    : string;
  rest  : Rest.Interaction;
  type  : typeof dattributes.onclick;
  target: DTMLMentionMenuElement;
};

export type SubmitClick = {
  id    : string;
  rest  : Rest.Interaction;
  type  : typeof dattributes.onsubmit;
  target: DTMLModalElement;
};

export type DEvent = Data.TaggedEnum<{
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

const interactable                 = Data.taggedEnum<DEvent>();
export const CommandAutoComplete   = interactable.CommandAutoComplete;
export const GlobalSlashCommand    = interactable.GlobalSlashCommand;
export const GuildSlashCommand     = interactable.GuildSlashCommand;
export const UserSlashCommand      = interactable.UserSlashCommand;
export const UserContextCommand    = interactable.UserContextCommand;
export const MessageContextCommand = interactable.MessageContextCommand;
export const ButtonClick           = interactable.ButtonClick;
export const SelectClick           = interactable.SelectClick;
export const UserClick             = interactable.UserClick;
export const RoleClick             = interactable.RoleClick;
export const ChannelClick          = interactable.ChannelClick;
export const MentionClick          = interactable.MentionClick;
export const SubmitClick           = interactable.SubmitClick;
