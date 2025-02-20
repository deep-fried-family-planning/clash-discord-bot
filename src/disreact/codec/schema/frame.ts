import {CustomId, DisReactPointer} from '#src/disreact/codec/schema/common-schema.ts';
import {Any, Array, mutable, String, Struct, tag, Union, Boolean} from 'effect/Schema';
import {All, Reserved} from './constants';



export const ButtonEvent = Struct({
  kind     : tag(All.ButtonEventTag),
  key      : tag(Reserved.onclick),
  custom_id: CustomId,
  rest     : Any,
});

export const SelectEvent = Struct({
  kind     : tag(All.SelectEventTag),
  key      : tag(Reserved.onselect),
  custom_id: CustomId,
  rest     : Any,
  values   : Array(String),
  options  : Array(Struct({
    value      : String,
    label      : String,
    emoji      : Any,
    default    : Boolean,
    description: String,
  })),
});

export const UserSelectEvent = Struct({
  kind     : tag(All.UserSelectEventTag),
  key      : tag(Reserved.onselect),
  custom_id: CustomId,
  rest     : Any,
  user_ids : Array(String),
});

export const RoleSelectEvent = Struct({
  kind     : tag(All.RoleSelectEventTag),
  key      : tag(Reserved.onselect),
  custom_id: CustomId,
  rest     : Any,
  role_ids : Array(String),
});

export const ChannelSelectEvent = Struct({
  kind       : tag(All.ChannelSelectEventTag),
  key        : tag(Reserved.onselect),
  custom_id  : CustomId,
  rest       : Any,
  channel_ids: Array(String),
});



export const Frame = Struct({
  pointer: Struct({
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
