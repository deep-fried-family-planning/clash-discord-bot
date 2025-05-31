import {pipe} from 'effect/Function';
import * as S from 'effect/Schema';

export * as DAPIComponent from '#src/disreact/codec/dapi/dapi-component.ts';
export type DAPIComponent = never;

export const ACTION_ROW     = 1,
             BUTTON         = 2,
             SELECT_MENU    = 3,
             TEXT_INPUT     = 4,
             CHANNEL_SELECT = 6,
             USER_SELECT    = 7,
             ROLE_SELECT    = 8,
             MENTION_SELECT = 9,
             PRIMARY        = 1,
             SECONDARY      = 2,
             SUCCESS        = 3,
             DANGER         = 4,
             LINK           = 5,
             PREMIUM        = 6,
             SHORT          = 1,
             PARAGRAPH      = 2;

export const ActionRow = <A, I, R>(schema: S.Schema<A, I, R>) => S.Struct({
  type      : S.tag(ACTION_ROW),
  components: S.Array(schema),
});

export const ComponentButton = S.Struct({
  type     : S.tag(BUTTON),
  style    : S.Literal(PRIMARY, SECONDARY, SUCCESS, DANGER),
  custom_id: S.String,
  label    : S.optional(S.String),
  emoji    : S.optional(S.Any),
  disabled : S.optional(S.Boolean),
});

export const LinkButton = S.Struct({
  type    : S.tag(BUTTON),
  style   : S.Literal(LINK),
  url     : S.String,
  label   : S.optional(S.String),
  emoji   : S.optional(S.Any),
  disabled: S.optional(S.Boolean),
});

export const PremiumButton = S.Struct({
  type    : S.tag(BUTTON),
  style   : S.Literal(PREMIUM),
  sku_id  : S.String,
  disabled: S.optional(S.Boolean),
});

export const Button = S.Union(
  ComponentButton,
  LinkButton,
  PremiumButton,
);

export const ButtonData = S.Struct({
  custom_id     : S.String,
  component_type: S.tag(BUTTON),
});

export const StringSelect = S.Struct({
  type       : S.Literal(SELECT_MENU),
  custom_id  : S.String,
  placeholder: S.optional(S.String),
  min_values : S.optional(S.Number),
  max_values : S.optional(S.Number),
  disabled   : S.optional(S.Boolean),
  options    : S.Array(S.Any),
});

export const StringSelectData = S.Struct({
  custom_id     : S.String,
  component_type: S.tag(SELECT_MENU),
  values        : S.Array(S.String),
});

export const UserSelect = S.Struct({
  type          : S.Literal(USER_SELECT),
  custom_id     : S.String,
  placeholder   : S.optional(S.String),
  min_values    : S.optional(S.Number),
  max_values    : S.optional(S.Number),
  disabled      : S.optional(S.Boolean),
  default_values: pipe(
    S.Struct({
      type: S.Literal('user'),
      id  : S.String,
    }),
    S.Array,
  ),
});

export const UserSelectData = S.Struct({
  custom_id     : S.String,
  component_type: S.tag(USER_SELECT),
  values        : S.Array(S.String),
});

export const RoleSelect = S.Struct({
  type          : S.tag(ROLE_SELECT),
  custom_id     : S.String,
  placeholder   : S.optional(S.String),
  min_values    : S.optional(S.Number),
  max_values    : S.optional(S.Number),
  disabled      : S.optional(S.Boolean),
  default_values: pipe(
    S.Struct({
      type: S.Literal('role'),
      id  : S.String,
    }),
    S.Array,
  ),
});

export const RoleSelectData = S.Struct({
  custom_id     : S.String,
  component_type: S.tag(ROLE_SELECT),
  values        : S.Array(S.String),
});

export const MentionableSelect = S.Struct({
  type          : S.Literal(MENTION_SELECT),
  custom_id     : S.String,
  placeholder   : S.optional(S.String),
  disabled      : S.optional(S.Boolean),
  default_values: pipe(
    S.Struct({
      type: S.Literal('role', 'user', 'channel'),
      id  : S.String,
    }),
    S.Array,
  ),
});

export const MentionableSelectData = S.Struct({
  custom_id     : S.String,
  component_type: S.tag(MENTION_SELECT),
  values        : S.Array(S.String),
});

export const ChannelSelect = S.Struct({
  type          : S.Literal(CHANNEL_SELECT),
  custom_id     : S.String,
  placeholder   : S.optional(S.String),
  min_values    : S.optional(S.Int),
  max_values    : S.optional(S.Int),
  channel_types : S.optional(S.Array(S.Int)),
  disabled      : S.optional(S.Boolean),
  default_values: pipe(
    S.Struct({
      type: S.Literal('channel'),
      id  : S.String,
    }),
    S.Array,
  ),
});

export const ChannelSelectData = S.Struct({
  custom_id     : S.String,
  component_type: S.tag(CHANNEL_SELECT),
  values        : S.Array(S.String),
});

export const SelectMenu = S.Union(
  StringSelect,
  UserSelect,
  RoleSelect,
  MentionableSelect,
  ChannelSelect,
);

export const TextInput = S.Struct({
  type       : S.Literal(TEXT_INPUT),
  custom_id  : S.String,
  style      : S.Literal(SHORT, PARAGRAPH),
  label      : S.optional(S.String),
  placeholder: S.optional(S.String),
  min_length : S.optional(S.Number),
  max_length : S.optional(S.Number),
  required   : S.optional(S.Boolean),
  value      : S.optional(S.String),
});
