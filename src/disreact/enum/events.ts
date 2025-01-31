/* eslint-disable @typescript-eslint/no-empty-object-type */
import {Rest} from '#src/disreact/enum/index.ts';
import type {ButtonAttributes, SelectMenuAttributes, TextInputAttributes} from '#src/disreact/model/types.ts';
import {D} from '#src/internal/pure/effect.ts';



export type Events = D.TaggedEnum<{
  ButtonClick     : {id: string; type: 'onClick'; target: ButtonAttributes; values: []};
  SelectMenuClick : {id: string; type: 'onClick'; target: SelectMenuAttributes; values: []};
  UserMenuClick   : {id: string; type: 'onClick'; target: SelectMenuAttributes; values: {id: string; type: 'user'}[]};
  RoleMenuClick   : {id: string; type: 'onClick'; target: SelectMenuAttributes; values: {id: string; type: 'role'}[]};
  ChannelMenuClick: {id: string; type: 'onClick'; target: SelectMenuAttributes; values: {id: string; type: 'channel'}[]};
  MentionMenuClick: {id: string; type: 'onClick'; target: SelectMenuAttributes; values: {id: string; type: 'user' | 'role' | 'channel'}[]};
  DialogSubmit    : {id: string; type: 'onSubmit'; target: {}; values: TextInputAttributes[]};
}>;

export const ModelEvent       = D.taggedEnum<Events>();
export const ButtonClick      = ModelEvent.ButtonClick;
export const SelectMenuClick  = ModelEvent.SelectMenuClick;
export const UserMenuClick    = ModelEvent.UserMenuClick;
export const RoleMenuClick    = ModelEvent.RoleMenuClick;
export const ChannelMenuClick = ModelEvent.ChannelMenuClick;
export const MentionMenuClick = ModelEvent.MentionMenuClick;
export const DialogSubmit     = ModelEvent.DialogSubmit;

export const decodeEvent = (target: Rest.Button | Rest.SelectMenu) => {
  switch (target.type) {
    case Rest.BUTTON:
      return ButtonClick({
        id    : target.custom_id!,
        type  : 'onClick',
        target,
        values: [],
      });
    case Rest.SELECT_MENU:
      return SelectMenuClick({
        id    : target.custom_id!,
        type  : 'onClick',
        target: target as never,
        values: [],
      });
    case Rest.USER_SELECT:
      return UserMenuClick({
        id    : target.custom_id!,
        type  : 'onClick',
        target: target as never,
        values: [],
      });
    case Rest.ROLE_SELECT:
      return RoleMenuClick({
        id    : target.custom_id!,
        type  : 'onClick',
        target: target as never,
        values: [],
      });
    case Rest.CHANNEL_SELECT:
      return ChannelMenuClick({
        id    : target.custom_id!,
        type  : 'onClick',
        target: target as never,
        values: [],
      });
    case Rest.MENTION_SELECT:
      return MentionMenuClick({
        id    : target.custom_id!,
        type  : 'onClick',
        target: target as never,
        values: [],
      });
    default:
      throw new Error('unknown event type');
  }
};
