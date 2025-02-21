import {CustomId, DisReactPointer} from '#src/disreact/codec/schema/common/common.ts';
import type { Schema} from 'effect/Schema';
import {Any, Array, mutable, String, Struct, tag, Union, Boolean} from 'effect/Schema';
import {All, Reserved} from 'src/disreact/codec/schema/common/index.ts';



export const ButtonEvent = Struct({
  kind: tag(All.ButtonEventTag),
  type: tag(Reserved.onclick),
  id  : CustomId,
  rest: Any,
});

export const SelectEvent = Struct({
  kind   : tag(All.SelectEventTag),
  type   : tag(Reserved.onselect),
  id     : CustomId,
  rest   : Any,
  values : Array(String),
  options: Array(Struct({
    value      : String,
    label      : String,
    emoji      : Any,
    default    : Boolean,
    description: String,
  })),
});

export const UserSelectEvent = Struct({
  kind    : tag(All.UserSelectEventTag),
  type    : tag(Reserved.onselect),
  id      : CustomId,
  rest    : Any,
  user_ids: Array(String),
});

export const RoleSelectEvent = Struct({
  kind    : tag(All.RoleSelectEventTag),
  type    : tag(Reserved.onselect),
  id      : CustomId,
  rest    : Any,
  role_ids: Array(String),
});

export const ChannelSelectEvent = Struct({
  kind       : tag(All.ChannelSelectEventTag),
  type       : tag(Reserved.onselect),
  id         : CustomId,
  rest       : Any,
  channel_ids: Array(String),
});

export const MentionSelectEvent = Struct({
  kind    : tag(All.MentionSelectEventTag),
  type    : tag(Reserved.onselect),
  id      : CustomId,
  rest    : Any,
  mentions: Array(Struct({
    id  : String,
    type: String,
  })),
});

export const SubmitEvent = Struct({
  kind: tag(All.SubmitEventTag),
  type: tag(Reserved.onsubmit),
  id  : CustomId,
  rest: Any,
});



export const Frame = Struct({
  pointer: Struct({
    id     : String,
    current: DisReactPointer,
  }),

  doken: mutable(Struct({
    current: Any,
    standby: Any,
  })),

  root: String,
  hash: String,

  event: Union(
    ButtonEvent,
    SelectEvent,
    UserSelectEvent,
    RoleSelectEvent,
    ChannelSelectEvent,
  ),

  rest: Any,
});



export type ButtonEvent = Schema.Type<typeof ButtonEvent>;
export type SelectEvent = Schema.Type<typeof SelectEvent>;
export type UserSelectEvent = Schema.Type<typeof UserSelectEvent>;
export type RoleSelectEvent = Schema.Type<typeof RoleSelectEvent>;
export type ChannelSelectEvent = Schema.Type<typeof ChannelSelectEvent>;
export type MentionSelectEvent = Schema.Type<typeof MentionSelectEvent>;
