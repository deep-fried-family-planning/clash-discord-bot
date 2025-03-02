import {_Tag, Reserved} from '#src/disreact/codec/common/index.ts';
import * as Button from '#src/disreact/codec/dsx/event/button.ts';
import * as Channel from '#src/disreact/codec/dsx/event/channel.ts';
import * as Default from '#src/disreact/codec/dsx/event/default.ts';
import * as Mention from '#src/disreact/codec/dsx/event/mention.ts';
import * as Role from '#src/disreact/codec/dsx/event/role.ts';
import * as Select from '#src/disreact/codec/dsx/event/select.ts';
import * as Submit from '#src/disreact/codec/dsx/event/submit.ts';
import * as User from '#src/disreact/codec/dsx/event/user.ts';
import * as Rest from '#src/disreact/codec/rest/rest.ts';
import {S} from '#src/internal/pure/effect.ts';



export * as Submit from '#src/disreact/codec/dsx/event/submit.ts';
export * as Button from '#src/disreact/codec/dsx/event/button.ts';
export * as Select from '#src/disreact/codec/dsx/event/select.ts';
export * as Channel from '#src/disreact/codec/dsx/event/channel.ts';
export * as Role from '#src/disreact/codec/dsx/event/role.ts';
export * as User from '#src/disreact/codec/dsx/event/user.ts';
export * as Mention from '#src/disreact/codec/dsx/event/mention.ts';



export const T = S.Union(
  Submit.T,
  Button.T,
  Select.T,
  Channel.T,
  Role.T,
  User.T,
  Mention.T,
);

export type T = S.Schema.Type<typeof T>;

export const isSubmit  = Submit.is;
export const isButton  = Button.is;
export const isSelect  = Select.is;
export const isChannel = Channel.is;
export const isRole    = Role.is;
export const isUser    = User.is;
export const isMention = Mention.is;



export const Dialog = S.Union(
  Submit.T,
);

export type Dialog = S.Schema.Type<typeof Dialog>;

export const isDialog = (event: T) => event._kind === Default.TAG_DIALOG;



export const Message = S.Union(
  Button.T,
  Select.T,
  Channel.T,
  Role.T,
  User.T,
  Mention.T,
);

export type Message = S.Schema.Type<typeof Message>;

export const isMessage = (event: T) => event._kind === Default.TAG_MESSAGE;



export const make = (request: any): T => {
  if (request.type === 5) {
    return {
      _kind    : _Tag.DIALOG,
      _tag     : _Tag.SUBMIT,
      type     : Reserved.onsubmit,
      request,
      custom_id: request.data.custom_id,
      values   : request.data.components.map((component: any) => component.components[0].value ?? ''),
    };
  }

  if (request.type === 3) {
    const target = Rest.findTarget(request.data.custom_id, request.message!.components);

    if (request.data.component_type === 2) {
      return {
        _kind    : _Tag.MESSAGE,
        _tag     : _Tag.BUTTON,
        type     : Reserved.onclick,
        request,
        custom_id: request.data.custom_id,
      };
    }

    if (request.data.component_type === 3) {
      return {
        _kind    : _Tag.MESSAGE,
        _tag     : _Tag.SELECT,
        type     : Reserved.onselect,
        request,
        custom_id: request.data.custom_id,
        options  : (target as any).options.filter((option: any) => request.data.values!.includes(option.value)),
        values   : request.data.values,
      };
    }

    if (request.data.component_type === 5) {
      return {
        _kind    : _Tag.MESSAGE,
        _tag     : _Tag.SELECT_USER,
        type     : Reserved.onselect,
        request,
        custom_id: request.data.custom_id,
        user_ids : request.data.values,
      };
    }

    if (request.data.component_type === 6) {
      return {
        _kind    : _Tag.MESSAGE,
        _tag     : _Tag.SELECT_ROLE,
        type     : Reserved.onselect,
        request,
        custom_id: request.data.custom_id,
        role_ids : request.data.values,
      };
    }

    if (request.data.component_type === 7) {
      return {
        _kind    : _Tag.MESSAGE,
        _tag     : _Tag.SELECT_MENTION,
        type     : Reserved.onselect,
        request,
        custom_id: request.data.custom_id,
        mentions : request.data.values,
      };
    }

    if (request.data.component_type === 8) {
      return {
        _kind      : _Tag.MESSAGE,
        _tag       : _Tag.SELECT_CHANNEL,
        type       : Reserved.onselect,
        request,
        custom_id  : request.data.custom_id,
        channel_ids: request.data.values,
      };
    }
  }

  throw new Error(`Unsupported event of type ${request.type}`);
};
