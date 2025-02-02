import type {DTMLButtonElement, DTMLChannelMenuElement, DTMLMentionMenuElement, DTMLModalElement, DTMLRoleMenuElement, DTMLStringMenuElement, DTMLUserMenuElement} from '#src/disreact/model/dsx/types.ts';
import type {Rest} from '#src/disreact/runtime/enum/index.ts';
import {Data} from 'effect';

export type CommandAutoComplete = {
  rest: Rest.Interaction;
};

export type GlobalSlashCommand = {
  rest: Rest.Interaction;
};

export type GuildSlashCommand = {
  rest: Rest.Interaction;
};

export type UserSlashCommand = {
  rest: Rest.Interaction;
};

export type UserContextCommand = {
  rest: Rest.Interaction;
};

export type MessageContextCommand = {
  rest: Rest.Interaction;
};

export type ButtonClick = {
  rest  : Rest.Interaction;
  target: DTMLButtonElement;
};

export type SelectClick = {
  rest  : Rest.Interaction;
  target: DTMLStringMenuElement;
};

export type UserClick = {
  rest  : Rest.Interaction;
  target: DTMLUserMenuElement;
};

export type RoleClick = {
  rest  : Rest.Interaction;
  target: DTMLRoleMenuElement;
};

export type ChannelClick = {
  rest  : Rest.Interaction;
  target: DTMLChannelMenuElement;
};

export type MentionClick = {
  rest  : Rest.Interaction;
  target: DTMLMentionMenuElement;
};

export type CommandSubmit = {
  rest  : Rest.Interaction;
  target: DTMLModalElement;
};

export type MessageSubmit = {
  rest  : Rest.Interaction;
  target: DTMLModalElement;
};

export type Interactable = Data.TaggedEnum<{
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
  CommandSubmit        : CommandSubmit;
  MessageSubmit        : MessageSubmit;
}>;

const interactable = Data.taggedEnum<Interactable>();

export const {
  CommandAutoComplete,
  GlobalSlashCommand,
  GuildSlashCommand,
  UserSlashCommand,
  UserContextCommand,
  MessageContextCommand,
  ButtonClick,
  SelectClick,
  UserClick,
  RoleClick,
  ChannelClick,
  MentionClick,
  CommandSubmit,
  MessageSubmit,
} = interactable;

export const isCommandAutoComplete = interactable.$is('CommandAutoComplete');
export const isGlobalSlashCommand = interactable.$is('GlobalSlashCommand');
export const isGuildSlashCommand = interactable.$is('GuildSlashCommand');
export const isUserSlashCommand = interactable.$is('UserSlashCommand');
export const isUserContextCommand = interactable.$is('UserContextCommand');
export const isMessageContextCommand = interactable.$is('MessageContextCommand');
export const isButtonClick = interactable.$is('ButtonClick');
export const isSelectClick = interactable.$is('SelectClick');
export const isUserClick = interactable.$is('UserClick');
export const isRoleClick = interactable.$is('RoleClick');
export const isChannelClick = interactable.$is('ChannelClick');
export const isMentionClick = interactable.$is('MentionClick');
export const isCommandSubmit = interactable.$is('CommandSubmit');
export const isMessageSubmit = interactable.$is('MessageSubmit');
