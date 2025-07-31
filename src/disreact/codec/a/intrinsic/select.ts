import * as Markdown from '#disreact/a/intrinsic/markdown.ts';
import * as Norm from '#disreact/a/intrinsic/norm.ts';
import * as Rest from '#disreact/a/codec/rest-element.ts';
import {Discord} from 'dfx';
import * as S from 'effect/Schema';

export const OPTION = 'option';
export const OptionAttributes = S.Struct({
  label      : S.String,
  value      : S.String,
  description: S.optional(S.String),
  emoji      : S.optional(Markdown.EmojiAttributes),
  default    : S.optional(S.Boolean),
});
export const encodeOption = (self: any, arg: any) => {
  return {
    value      : self.props.value,
    label      : self.props.label,
    description: self.props.description ?? arg[Norm.PRIMITIVE]?.[0],
    emoji      : self.props.emoji ?? arg[Markdown.EMOJI]?.[0],
    default    : self.props.default,
  };
};

export const SELECT = 'select';
export const SelectAttributes = Rest.Attributes({
  custom_id  : S.optional(S.String),
  placeholder: S.optional(S.String),
  max_values : S.optional(S.Number),
  min_values : S.optional(S.Number),
  options    : S.optional(S.Array(OptionAttributes)),
  disabled   : S.optional(S.Boolean),
  onselect   : Rest.Handler(S.Any),
});
export const encodeSelect = (self: any, arg: any) => {
  return {
    type      : Discord.MessageComponentTypes.ACTION_ROW,
    components: [{
      type       : Discord.MessageComponentTypes.STRING_SELECT,
      custom_id  : self.props.custom_id ?? self._s,
      placeholder: self.props.label ?? arg[Norm.PRIMITIVE]?.[0],
      options    : self.props.options ?? arg[OPTION],
      min_values : self.props.min_values,
      max_values : self.props.max_values,
      disabled   : self.props.disabled,
    }],
  };
};

export const DEFAULT = 'default';
export const DefaultAttributes = S.Union(
  Rest.Attributes({role: S.String}),
  Rest.Attributes({user: S.String}),
  Rest.Attributes({channel: S.String}),
);
export const encodeDefault = (self: any, arg: any) => {
  if (self.props.role) {
    return {
      type: 'role',
      id  : self.props.role,
    };
  }

  if (self.props.user) {
    return {
      type: 'user',
      id  : self.props.user,
    };
  }

  return {
    type: 'channel',
    id  : self.props.channel,
  };
};

export const CHANNELS = 'channels';
export const ChannelsAttributes = Rest.Attributes({
  custom_id    : S.optional(S.String),
  placeholder  : S.optional(S.String),
  min_values   : S.optional(S.Number),
  max_values   : S.optional(S.Number),
  channel_types: S.optional(S.Array(S.Int)),
  disabled     : S.optional(S.Boolean),
  onselect     : Rest.Handler(S.Any),
});
export const encodeChannels = (self: any, arg: any) => {
  return {
    type      : Discord.MessageComponentTypes.ACTION_ROW,
    components: [{
      type          : Discord.MessageComponentTypes.CHANNEL_SELECT,
      custom_id     : self.props.custom_id ?? self._s,
      placeholder   : self.props.placeholder ?? arg[Norm.PRIMITIVE]?.[0],
      min_values    : self.props.min_values,
      max_values    : self.props.max_values,
      channel_types : self.props.channel_types,
      default_values: self.props.default_values ?? arg[DEFAULT],
      disabled      : self.props.disabled,
    }],
  };
};

export const MENTIONS = 'mentions';
export const MentionsAttributes = Rest.Attributes({
  custom_id  : S.optional(S.String),
  placeholder: S.optional(S.String),
  min_values : S.optional(S.Number),
  max_values : S.optional(S.Number),
  disabled   : S.optional(S.Boolean),
  onselect   : Rest.Handler(S.Any),
});
export const encodeMentions = (self: any, arg: any) => {
  return {
    type      : Discord.MessageComponentTypes.ACTION_ROW,
    components: [{
      type          : Discord.MessageComponentTypes.MENTIONABLE_SELECT,
      custom_id     : self.props.custom_id ?? self._s,
      placeholder   : self.props.label ?? arg[Norm.PRIMITIVE]?.[0],
      min_values    : self.props.min_values,
      max_values    : self.props.max_values,
      default_values: self.props.default_values ?? arg[DEFAULT],
    }],
  };
};

export const ROLES = 'roles';
export const RolesAttributes = Rest.Attributes({
  custom_id  : S.optional(S.String),
  placeholder: S.optional(S.String),
  min_values : S.optional(S.Number),
  max_values : S.optional(S.Number),
  disabled   : S.optional(S.Boolean),
  onselect   : Rest.Handler(S.Any),
});
export const encodeRoles = (self: any, arg: any) => {
  return {
    type      : Discord.MessageComponentTypes.ACTION_ROW,
    components: [{
      type          : Discord.MessageComponentTypes.ROLE_SELECT,
      custom_id     : self.props.custom_id ?? self._s,
      placeholder   : self.props.label ?? arg[Norm.PRIMITIVE]?.[0],
      min_values    : self.props.min_values,
      max_values    : self.props.max_values,
      default_values: self.props.default_values ?? arg[DEFAULT],
    }],
  };
};

export const USERS = 'users';
export const UsersAttributes = Rest.Attributes({
  custom_id  : S.optional(S.String),
  placeholder: S.optional(S.String),
  min_values : S.optional(S.Number),
  max_values : S.optional(S.Number),
  disabled   : S.optional(S.Boolean),
  onselect   : Rest.Handler(S.Any),
});
export const encodeUsers = (self: any, arg: any) => {
  return {
    type      : Discord.MessageComponentTypes.ACTION_ROW,
    components: [{
      type          : Discord.MessageComponentTypes.USER_SELECT,
      custom_id     : self.props.custom_id ?? self._s,
      placeholder   : self.props.label ?? arg[Norm.PRIMITIVE]?.[0],
      min_values    : self.props.min_values,
      max_values    : self.props.max_values,
      default_values: self.props.default_values ?? arg[DEFAULT],
    }],
  };
};

export type OptionAttributes = typeof OptionAttributes.Type;
export type SelectAttributes = typeof SelectAttributes.Type;
export type DefaultAttributes = typeof DefaultAttributes.Type;
export type ChannelsAttributes = typeof ChannelsAttributes.Type;
export type MentionsAttributes = typeof MentionsAttributes.Type;
export type RolesAttributes = typeof RolesAttributes.Type;
export type UsersAttributes = typeof UsersAttributes.Type;
