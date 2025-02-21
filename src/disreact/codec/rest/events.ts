import {CustomId} from '#src/disreact/codec/constants/common.ts';
import {Any, Array, Boolean, type Schema, String, Struct, tag, Union} from 'effect/Schema';
import {All, Reserved} from 'src/disreact/codec/constants/index.ts';
import * as Rest from 'src/disreact/codec/rest/rest.ts';



export const ButtonEvent =
               Struct({
                 kind: tag(All.ButtonEventTag),
                 type: tag(Reserved.onclick),
                 id  : CustomId,
                 rest: Any,
               });



export const SelectEvent =
               Struct({
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



export const UserSelectEvent =
               Struct({
                 kind    : tag(All.UserSelectEventTag),
                 type    : tag(Reserved.onselect),
                 id      : CustomId,
                 rest    : Any,
                 user_ids: Array(String),
               });

export const RoleSelectEvent =
               Struct({
                 kind    : tag(All.RoleSelectEventTag),
                 type    : tag(Reserved.onselect),
                 id      : CustomId,
                 rest    : Any,
                 role_ids: Array(String),
               });

export const ChannelSelectEvent =
               Struct({
                 kind       : tag(All.ChannelSelectEventTag),
                 type       : tag(Reserved.onselect),
                 id         : CustomId,
                 rest       : Any,
                 channel_ids: Array(String),
               });

export const MentionSelectEvent =
               Struct({
                 kind    : tag(All.MentionSelectEventTag),
                 type    : tag(Reserved.onselect),
                 id      : CustomId,
                 rest    : Any,
                 mentions: Array(Struct({
                   id  : String,
                   type: String,
                 })),
               });



export const SubmitEvent =
               Struct({
                 kind: tag(All.SubmitEventTag),
                 type: tag(Reserved.onsubmit),
                 id  : CustomId,
                 rest: Any,
               });



const unsupported = [
  Rest.Rx.PING,
  Rest.Rx.APPLICATION_COMMAND_AUTOCOMPLETE,
  Rest.Rx.APPLICATION_COMMAND,
];

export const decodeEvent = (rest: Rest.Interaction) => {
  if (unsupported.includes(rest.type)) {
    throw new Error('Unsupported event');
  }

  if (rest.type === Rest.Rx.MODAL_SUBMIT) {
    return SubmitEvent.make({
      id: rest.data.custom_id,
      rest,
    });
  }


  if (rest.type === Rest.Rx.MESSAGE_COMPONENT) {
    const target = Rest.findTarget(rest.data.custom_id, rest.message!.components);

    if (!target) {
      throw new Error('Unsupported message click');
    }
    if (rest.data.component_type === Rest.Cx.BUTTON) {
      return ButtonEvent.make({
        id: rest.data.custom_id,
        rest,
      });
    }
    if (rest.data.component_type === Rest.Cx.STRING_SELECT) {
      return SelectEvent.make({
        id     : rest.data.custom_id,
        rest,
        options: (target as any).options.filter((option: any) => rest.data.values!.includes(option.value)),
        values : rest.data.values as any,
      });
    }
    if (rest.data.component_type === Rest.Cx.USER_SELECT) {
      return UserSelectEvent.make({
        id      : rest.data.custom_id,
        rest,
        user_ids: rest.data.values as any,
      });
    }
    if (rest.data.component_type === Rest.Cx.ROLE_SELECT) {
      return RoleSelectEvent.make({
        id      : rest.data.custom_id,
        rest,
        role_ids: rest.data.values as any,
      });
    }
    if (rest.data.component_type === Rest.Cx.CHANNEL_SELECT) {
      return ChannelSelectEvent.make({
        id         : rest.data.custom_id,
        rest,
        channel_ids: rest.data.values as any,
      });
    }
    if (rest.data.component_type === Rest.Cx.MENTIONABLE_SELECT) {
      return MentionSelectEvent.make({
        id      : rest.data.custom_id,
        rest,
        mentions: rest.data.values as any,
      });
    }
  }

  throw new Error('Unsupported event');
};



export const Type = Union(
  ButtonEvent,
  SelectEvent,
  UserSelectEvent,
  RoleSelectEvent,
  ChannelSelectEvent,
  MentionSelectEvent,
  SubmitEvent,
);

export type Type = Schema.Type<typeof Type>;
