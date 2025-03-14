import {onclick, onselect, onsubmit} from '#src/disreact/codec/constants/reserved.ts';
import {ComponentType, InteractionType} from 'dfx/types';
import type {Schema} from 'effect/Schema';
import {Any, mutable, String, Struct, tag, Union} from 'effect/Schema';



export const BUTTON_EVENT  = 'ButtonEvent';
export const SELECT_EVENT  = 'SelectEvent';
export const USER_EVENT    = 'UserSelectEvent';
export const ROLE_EVENT    = 'RoleSelectEvent';
export const CHANNEL_EVENT = 'ChannelSelectEvent';
export const SUBMIT_EVENT  = 'SubmitEvent';

const CommonFields = Struct({
  request  : Any,
  custom_id: String,
  prop     : String,
}).fields;

export const ButtonEvent = mutable(Struct({
  _tag: tag(BUTTON_EVENT),
  ...CommonFields,
}));

export const SelectEvent = mutable(Struct({
  _tag   : tag(SELECT_EVENT),
  ...CommonFields,
  values : Any,
  options: Any,
}));

export const UserEvent = mutable(Struct({
  _tag : tag(USER_EVENT),
  ...CommonFields,
  users: Any,
}));

export const RoleEvent = mutable(Struct({
  _tag : tag(ROLE_EVENT),
  ...CommonFields,
  roles: Any,
}));

export const ChannelEvent = mutable(Struct({
  _tag    : tag(CHANNEL_EVENT),
  ...CommonFields,
  channels: Any,
}));

export const SubmitEvent = mutable(Struct({
  _tag  : tag(SUBMIT_EVENT),
  ...CommonFields,
  values: Any,
}));

export const T = Union(
  ButtonEvent,
  SelectEvent,
  UserEvent,
  RoleEvent,
  ChannelEvent,
  SubmitEvent,
);

export type ButtonEvent = Schema.Type<typeof ButtonEvent>;
export type SelectEvent = Schema.Type<typeof SelectEvent>;
export type UserEvent = Schema.Type<typeof UserEvent>;
export type RoleEvent = Schema.Type<typeof RoleEvent>;
export type ChannelEvent = Schema.Type<typeof ChannelEvent>;
export type SubmitEvent = Schema.Type<typeof SubmitEvent>;
export type T = Schema.Type<typeof T>;

export const decodeRequestEvent = (request: any, custom_id?: string): T => {
  if (request.type === InteractionType.MESSAGE_COMPONENT) {
    if (request.data.component_type === ComponentType.BUTTON) {
      return {
        request,
        _tag     : 'ButtonEvent',
        custom_id: custom_id ?? request.data.custom_id,
        prop     : onclick,
      };
    }
    if (request.data.component_type === ComponentType.STRING_SELECT) {
      return {
        request,
        _tag     : 'SelectEvent',
        custom_id: custom_id ?? request.data.custom_id,
        prop     : onselect,
        values   : request.data.values,
        options  : [],
      };
    }
    if (request.data.component_type === ComponentType.USER_SELECT) {
      return {
        request,
        _tag     : 'UserSelectEvent',
        custom_id: custom_id ?? request.data.custom_id,
        prop     : onselect,
        users    : request.data.values,
      };
    }
    if (request.data.component_type === ComponentType.ROLE_SELECT) {
      return {
        request,
        _tag     : 'RoleSelectEvent',
        custom_id: custom_id ?? request.data.custom_id,
        prop     : onselect,
        roles    : request.data.values,
      };
    }
    if (request.data.component_type === ComponentType.CHANNEL_SELECT) {
      return {
        request,
        _tag     : 'ChannelSelectEvent',
        custom_id: custom_id ?? request.data.custom_id,
        prop     : onselect,
        channels : request.data.values,
      };
    }
  }

  return {
    request,
    _tag     : 'SubmitEvent',
    custom_id: custom_id ?? request.data.custom_id,
    prop     : onsubmit,
    values   : [],
  };
};
