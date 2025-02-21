import {CustomId, EmojiStruct, SnowFlake} from '#src/disreact/codec/schema/common/common.ts';
import * as DTML from '#src/disreact/codec/schema/common/dtml.ts';
import {Any, Array, Boolean, Int, Literal, optional, type Schema, String, Struct, Unknown} from 'effect/Schema';



export const OptionTag = Literal(DTML.option);

export const OptionAttributes = Struct({
  label      : String,
  value      : String,
  description: optional(String),
  emoji      : optional(EmojiStruct),
  default    : optional(Boolean),
});



export const Tag = Literal(DTML.select);

export const Attributes = Struct({
  custom_id  : optional(CustomId),
  placeholder: optional(String),
  min_values : optional(Int),
  max_values : optional(Int),
  disabled   : optional(Boolean),
  options    : optional(Array(OptionAttributes)),
  onselect   : optional(Unknown),
  children   : optional(Any),
});



export const DefaultValueTag = Literal(DTML.$default);

export const DefaultValueAttributes = Struct({
  user   : optional(SnowFlake),
  role   : optional(SnowFlake),
  channel: optional(SnowFlake),
});



export const UsersTag = Literal(DTML.users);

export const UsersAttributes = Struct({
  custom_id     : optional(CustomId),
  placeholder   : optional(String),
  min_values    : optional(Int),
  max_values    : optional(Int),
  disabled      : optional(Boolean),
  default_values: optional(Array(DefaultValueAttributes)),
  onselect      : optional(Unknown),
});



export const RolesTag = Literal(DTML.roles);

export const RolesAttributes = Struct({
  custom_id     : optional(CustomId),
  placeholder   : optional(String),
  min_values    : optional(Int),
  max_values    : optional(Int),
  disabled      : optional(Boolean),
  default_values: optional(Array(DefaultValueAttributes)),
  onselect      : optional(Unknown),
});



export const ChannelsTag = Literal(DTML.channels);

export const ChannelsAttributes = Struct({
  custom_id     : optional(CustomId),
  placeholder   : optional(String),
  min_values    : optional(Int),
  max_values    : optional(Int),
  disabled      : optional(Boolean),
  default_values: optional(Array(DefaultValueAttributes)),
  channel_types : optional(Array(Int)),
  onselect      : optional(Unknown),
});



export const MentionsTag = Literal(DTML.mentions);

export const MentionsAttributes = Struct({
  custom_id     : optional(CustomId),
  placeholder   : optional(String),
  min_values    : optional(Int),
  max_values    : optional(Int),
  disabled      : optional(Boolean),
  default_values: optional(Array(DefaultValueAttributes)),
  onselect      : optional(Unknown),
});



export type OptionTag = Schema.Type<typeof OptionTag>;
export type Tag = Schema.Type<typeof Tag>;
export type DefaultValueTag = Schema.Type<typeof DefaultValueTag>;
export type UsersTag = Schema.Type<typeof UsersTag>;
export type RolesTag = Schema.Type<typeof RolesTag>;
export type ChannelsTag = Schema.Type<typeof ChannelsTag>;
export type MentionsTag = Schema.Type<typeof MentionsTag>;

export type OptionAttributes = Schema.Type<typeof OptionAttributes>;
export type Attributes = Schema.Type<typeof Attributes>;
export type DefaultValueAttributes = Schema.Type<typeof DefaultValueAttributes>;
export type UsersAttributes = Schema.Type<typeof UsersAttributes>;
export type RolesAttributes = Schema.Type<typeof RolesAttributes>;
export type ChannelsAttributes = Schema.Type<typeof ChannelsAttributes>;
export type MentionsAttributes = Schema.Type<typeof MentionsAttributes>;
