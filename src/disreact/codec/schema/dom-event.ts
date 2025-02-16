import {StringSelectOptionOut} from '#src/disreact/codec/schema/api-output.ts';
import {AnyRest, Arr, Str} from '#src/disreact/codec/schema/shared.ts';
import {S} from '#src/internal/pure/effect.ts';
import {Any, optional, Struct, tag, Union} from 'effect/Schema';
import * as Out from 'src/disreact/codec/schema/api-output.ts';
import * as Attr from '../abstract/attributes.ts';
import * as DTML from '../abstract/dtml.ts';
import * as Cons from './constants.ts';



export const Button = S.Struct({
  type  : tag(Cons.ButtonEvent),
  rest  : AnyRest,
  target: Struct({
    id    : Str,
    tag   : tag(DTML.$primary),
    handle: tag(Attr.$onclick),
    value : optional(Any),
  }),
});

export const StringSelect = S.Struct({
  _tag  : tag(Cons.SelectEvent),
  rest  : AnyRest,
  target: Struct({
    id    : Str,
    tag   : tag(DTML.$select),
    handle: tag(Attr.$onselect),
    value : optional(Any),
  }),
  values  : S.Array(S.String),
  selected: S.Array(StringSelectOptionOut),
});

export const UserSelect = S.Struct({
  _tag  : S.tag(Cons.UserSelectEvent),
  rest  : AnyRest,
  target: Struct({
    id    : Str,
    tag   : tag(DTML.$select),
    handle: tag(Attr.$onselect),
    value : optional(Any),
  }),
  users: Arr(Out.UserDefaultValue),
});

export const RoleSelect = S.Struct({
  _tag  : tag(Cons.RoleSelectEvent),
  rest  : AnyRest,
  target: Struct({
    id    : Str,
    tag   : tag(DTML.$roles),
    handle: tag(Attr.$onselect),
    value : optional(Any),
  }),
  roles: Arr(Out.RoleDefaultValue),
});

export const ChannelSelect = S.Struct({
  _tag  : tag(Cons.ChannelSelectEvent),
  rest  : AnyRest,
  target: Struct({
    id    : Str,
    tag   : tag(DTML.$roles),
    handle: tag(Attr.$onselect),
    value : optional(Any),
  }),
  channels: Arr(Out.ChannelDefaultValue),
});

export const MentionSelect = S.Struct({
  _tag  : tag(Cons.MentionSelectEvent),
  rest  : AnyRest,
  target: Struct({
    id    : Str,
    tag   : tag(DTML.$mentions),
    handle: tag(Attr.$onselect),
    value : optional(Any),
  }),
  mentions: Arr(Out.MentionDefaultValue),
  users   : Arr(Out.UserDefaultValue),
  roles   : Arr(Out.RoleDefaultValue),
  channels: Arr(Out.ChannelDefaultValue),
});



export const SlashCommand = S.Struct({
  _tag  : tag(Cons.SlashCommandEvent),
  rest  : AnyRest,
  target: Struct({
    id    : Str,
    tag   : tag(Cons.Unknown),
    handle: tag(Attr.$oninvoke),
    value : optional(Any),
  }),
});

export const UserCommand = S.Struct({
  _tag  : tag(Cons.UserCommandEvent),
  rest  : AnyRest,
  target: Struct({
    id    : Str,
    tag   : tag(Cons.Unknown),
    handle: tag(Attr.$oninvoke),
    value : optional(Any),
  }),
});

export const MessageCommand = S.Struct({
  _tag  : tag(Cons.MessageCommandEvent),
  rest  : AnyRest,
  target: Struct({
    id    : Str,
    tag   : tag(Cons.Unknown),
    handle: tag(Attr.$oninvoke),
    value : optional(Any),
  }),
});

export const AutoComplete = S.Struct({
  _tag  : tag(Cons.AutoCompleteEvent),
  rest  : AnyRest,
  target: Struct({
    id    : Str,
    tag   : tag(Cons.Unknown),
    handle: tag(Attr.$oninvoke),
    value : optional(Any),
  }),
});



// export const CommandSubmit = S.Struct({
//   _tag: tag(Cons.CommandSubmitEvent),
//   id    : Str,
//   dtml  : tag(DTML.$dialog),
//   attr  : tag(Attr.$onsubmit),
//   values: Arr(Str),
// });

export const MessageSubmit = S.Struct({
  _tag  : tag(Cons.MessageSubmitEvent),
  rest  : AnyRest,
  target: Struct({
    id    : Str,
    tag   : tag(DTML.$dialog),
    handle: tag(Attr.$onsubmit),
    value : optional(Any),
  }),
  values: Arr(Str),
});



export const All = Union(
  // CommandSubmit,
  MessageSubmit,
  Button,
  StringSelect,
  UserSelect,
  RoleSelect,
  ChannelSelect,
  MentionSelect,
  // SlashCommand,
  // UserCommand,
  // MessageCommand,
  // AutoComplete,
);



// export type CommandSubmit = S.Schema.Type<typeof CommandSubmit>;
export type MessageSubmit = S.Schema.Type<typeof MessageSubmit>;
export type Button = S.Schema.Type<typeof Button>;
export type StringSelect = S.Schema.Type<typeof StringSelect>;
export type UserSelect = S.Schema.Type<typeof UserSelect>;
export type RoleSelect = S.Schema.Type<typeof RoleSelect>;
export type ChannelSelect = S.Schema.Type<typeof ChannelSelect>;
export type MentionSelect = S.Schema.Type<typeof MentionSelect>;
// export type SlashCommand = S.Schema.Type<typeof SlashCommand>;
// export type UserCommand = S.Schema.Type<typeof UserCommand>;
// export type MessageCommand = S.Schema.Type<typeof MessageCommand>;
// export type AutoComplete = S.Schema.Type<typeof AutoComplete>;
export type All = S.Schema.Type<typeof All>;
