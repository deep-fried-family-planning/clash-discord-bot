import {CustomId, EmojiStruct, SnowFlake} from '#src/disreact/codec/common/value.ts';
import * as DTML from '#src/disreact/codec/common/dtml.ts';
import {S} from '#src/internal/pure/effect.ts';



export const OptionTag = S.Literal(DTML.option);

export const OptionAttributes = S.Struct({
  label      : S.String,
  value      : S.String,
  description: S.optional(S.String),
  emoji      : S.optional(EmojiStruct),
  default    : S.optional(S.Boolean),
});



export const Tag = S.Literal(DTML.select);

export const Attributes = S.Struct({
  custom_id  : S.optional(CustomId),
  placeholder: S.optional(S.String),
  min_values : S.optional(S.Int),
  max_values : S.optional(S.Int),
  disabled   : S.optional(S.Boolean),
  options    : S.optional(S.Array(OptionAttributes)),
  onselect   : S.optional(S.Unknown),
  children   : S.optional(S.Any),
});



export const DefaultValueTag = S.Literal(DTML.$default);

export const DefaultValueAttributes = S.Struct({
  user   : S.optional(SnowFlake),
  role   : S.optional(SnowFlake),
  channel: S.optional(SnowFlake),
});



export const UsersTag = S.Literal(DTML.users);

export const UsersAttributes = S.Struct({
  custom_id     : S.optional(CustomId),
  placeholder   : S.optional(S.String),
  min_values    : S.optional(S.Int),
  max_values    : S.optional(S.Int),
  disabled      : S.optional(S.Boolean),
  default_values: S.optional(S.Array(DefaultValueAttributes)),
  onselect      : S.optional(S.Unknown),
});



export const RolesTag = S.Literal(DTML.roles);

export const RolesAttributes = S.Struct({
  custom_id     : S.optional(CustomId),
  placeholder   : S.optional(S.String),
  min_values    : S.optional(S.Int),
  max_values    : S.optional(S.Int),
  disabled      : S.optional(S.Boolean),
  default_values: S.optional(S.Array(DefaultValueAttributes)),
  onselect      : S.optional(S.Unknown),
});



export const ChannelsTag = S.Literal(DTML.channels);

export const ChannelsAttributes = S.Struct({
  custom_id     : S.optional(CustomId),
  placeholder   : S.optional(S.String),
  min_values    : S.optional(S.Int),
  max_values    : S.optional(S.Int),
  disabled      : S.optional(S.Boolean),
  default_values: S.optional(S.Array(DefaultValueAttributes)),
  channel_types : S.optional(S.Array(S.Int)),
  onselect      : S.optional(S.Unknown),
});



export const MentionsTag = S.Literal(DTML.mentions);

export const MentionsAttributes = S.Struct({
  custom_id     : S.optional(CustomId),
  placeholder   : S.optional(S.String),
  min_values    : S.optional(S.Int),
  max_values    : S.optional(S.Int),
  disabled      : S.optional(S.Boolean),
  default_values: S.optional(S.Array(DefaultValueAttributes)),
  onselect      : S.optional(S.Unknown),
});



export type OptionTag = S.Schema.Type<typeof OptionTag>;
export type Tag = S.Schema.Type<typeof Tag>;
export type DefaultValueTag = S.Schema.Type<typeof DefaultValueTag>;
export type UsersTag = S.Schema.Type<typeof UsersTag>;
export type RolesTag = S.Schema.Type<typeof RolesTag>;
export type ChannelsTag = S.Schema.Type<typeof ChannelsTag>;
export type MentionsTag = S.Schema.Type<typeof MentionsTag>;

export type OptionAttributes = S.Schema.Type<typeof OptionAttributes>;
export type Attributes = S.Schema.Type<typeof Attributes>;
export type DefaultValueAttributes = S.Schema.Type<typeof DefaultValueAttributes>;
export type UsersAttributes = S.Schema.Type<typeof UsersAttributes>;
export type RolesAttributes = S.Schema.Type<typeof RolesAttributes>;
export type ChannelsAttributes = S.Schema.Type<typeof ChannelsAttributes>;
export type MentionsAttributes = S.Schema.Type<typeof MentionsAttributes>;



export const dsxDEV_validators_attributes = {
  [DTML.select]  : S.validateSync(Attributes),
  [DTML.option]  : S.validateSync(OptionAttributes),
  [DTML.$default]: S.validateSync(DefaultValueAttributes),
  [DTML.users]   : S.validateSync(UsersAttributes),
  [DTML.roles]   : S.validateSync(RolesAttributes),
  [DTML.channels]: S.validateSync(ChannelsAttributes),
  [DTML.mentions]: S.validateSync(MentionsAttributes),
};
