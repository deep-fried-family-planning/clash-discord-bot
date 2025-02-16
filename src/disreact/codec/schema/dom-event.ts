import {StringSelectOptionOut} from '#src/disreact/codec/schema/api-output.ts';
import {Arr, Str} from '#src/disreact/codec/schema/shared.ts';
import {S} from '#src/internal/pure/effect.ts';
import {tag, Union} from 'effect/Schema';
import * as Out from 'src/disreact/codec/schema/api-output.ts';
import * as Attr from '../abstract/attributes.ts';
import * as DTML from '../abstract/dtml.ts';
import * as Cons from './constants.ts';



export const CommandSubmit = S.Struct({
  type  : tag(Cons.CommandSubmitEvent),
  id    : Str,
  dtml  : tag(DTML.$dialog),
  attr  : tag(Attr.$onsubmit),
  values: Arr(Str),
});



export const MessageSubmit = S.Struct({
  type  : tag(Cons.MessageSubmitEvent),
  id    : Str,
  dtml  : tag(DTML.$dialog),
  attr  : tag(Attr.$onsubmit),
  values: Arr(Str),
});



export const Button = S.Struct({
  type: tag(Cons.ButtonEvent),
  id  : Str,
  dtml: tag(DTML.$primary),
  attr: tag(Attr.$onclick),
});



export const StringSelect = S.Struct({
  type    : tag(Cons.SelectEvent),
  id      : Str,
  dtml    : tag(DTML.$select),
  attr    : tag(Attr.$onselect),
  values  : S.Array(S.String),
  selected: S.Array(StringSelectOptionOut),
});



export const UserSelect = S.Struct({
  type : S.tag(Cons.UserSelectEvent),
  id   : Str,
  dtml : tag(DTML.$select),
  attr : tag(Attr.$onselect),
  users: Arr(Out.UserDefaultValue),
});



export const RoleSelect = S.Struct({
  type : tag(Cons.RoleSelectEvent),
  id   : Str,
  dtml : tag(DTML.$roles),
  attr : tag(Attr.$onselect),
  roles: Arr(Out.RoleDefaultValue),
});



export const ChannelSelect = S.Struct({
  type    : tag(Cons.ChannelSelectEvent),
  id      : Str,
  dtml    : tag(DTML.$roles),
  attr    : tag(Attr.$onselect),
  channels: Arr(Out.ChannelDefaultValue),
});



export const MentionSelect = S.Struct({
  type    : tag(Cons.MentionSelectEvent),
  id      : Str,
  dtml    : tag(DTML.$mentions),
  attr    : tag(Attr.$onselect),
  mentions: Arr(Out.MentionDefaultValue),
  users   : Arr(Out.UserDefaultValue),
  roles   : Arr(Out.RoleDefaultValue),
  channels: Arr(Out.ChannelDefaultValue),
});



export const SlashCommand = S.Struct({
  type: tag(Cons.SlashCommandEvent),
  id  : Str,
  dtml: tag(Cons.Unknown),
  attr: tag(Attr.$oninvoke),
});



export const UserCommand = S.Struct({
  type: tag(Cons.UserCommandEvent),
  id  : Str,
  dtml: tag(Cons.Unknown),
  attr: tag(Attr.$oninvoke),
});



export const MessageCommand = S.Struct({
  type: tag(Cons.MessageCommandEvent),
  id  : Str,
  dtml: tag(Cons.Unknown),
  attr: tag(Attr.$oninvoke),
});



export const AutoComplete = S.Struct({
  type: tag(Cons.AutoCompleteEvent),
  id  : Str,
  dtml: tag(Cons.Unknown),
  attr: tag(Attr.$onautocomplete),
});



export const Any = Union(
  CommandSubmit,
  MessageSubmit,
  Button,
  StringSelect,
  UserSelect,
  RoleSelect,
  ChannelSelect,
  MentionSelect,
  SlashCommand,
  UserCommand,
  MessageCommand,
  AutoComplete,
);



export type CommandSubmit = S.Schema.Type<typeof CommandSubmit>;
export type MessageSubmit = S.Schema.Type<typeof MessageSubmit>;
export type Button = S.Schema.Type<typeof Button>;
export type StringSelect = S.Schema.Type<typeof StringSelect>;
export type UserSelect = S.Schema.Type<typeof UserSelect>;
export type RoleSelect = S.Schema.Type<typeof RoleSelect>;
export type ChannelSelect = S.Schema.Type<typeof ChannelSelect>;
export type MentionSelect = S.Schema.Type<typeof MentionSelect>;
export type SlashCommand = S.Schema.Type<typeof SlashCommand>;
export type UserCommand = S.Schema.Type<typeof UserCommand>;
export type MessageCommand = S.Schema.Type<typeof MessageCommand>;
export type AutoComplete = S.Schema.Type<typeof AutoComplete>;
export type Any = S.Schema.Type<typeof Any>;
