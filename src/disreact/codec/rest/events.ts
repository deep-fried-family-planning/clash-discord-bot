import {CustomId} from '#src/disreact/codec/constants/common.ts';
import {Any, Array, Boolean, optional, type Schema, String, Struct, tag, Union} from 'effect/Schema';
import {All, Reserved} from 'src/disreact/codec/constants/index.ts';
import * as Rest from 'src/disreact/codec/rest/rest.ts';



export const SynthesizeEvent =
               Struct({
                 kind: tag(All.SynthesizeEventTag),
                 type: tag(All.Empty),
               });



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
                   emoji      : optional(Any),
                   default    : optional(Boolean),
                   description: optional(Boolean),
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



export const Type =
               Union(
                 SynthesizeEvent,
                 ButtonEvent,
                 SelectEvent,
                 UserSelectEvent,
                 RoleSelectEvent,
                 ChannelSelectEvent,
                 MentionSelectEvent,
                 SubmitEvent,
               );



export type SynthesizeEvent = Schema.Type<typeof SynthesizeEvent>;
export type NonSyntheticEvent = Exclude<Type, SynthesizeEvent>;
export type ButtonEvent = Schema.Type<typeof ButtonEvent>;
export type SelectEvent = Schema.Type<typeof SelectEvent>;
export type UserSelectEvent = Schema.Type<typeof UserSelectEvent>;
export type RoleSelectEvent = Schema.Type<typeof RoleSelectEvent>;
export type ChannelSelectEvent = Schema.Type<typeof ChannelSelectEvent>;
export type MentionSelectEvent = Schema.Type<typeof MentionSelectEvent>;
export type AnySelectEvent = SelectEvent | UserSelectEvent | RoleSelectEvent | ChannelSelectEvent | MentionSelectEvent;
export type AnyMessageEvent = AnySelectEvent | ButtonEvent;
export type SubmitEvent = Schema.Type<typeof SubmitEvent>;
export type Type = Schema.Type<typeof Type>;



export const isSynthesizeEvent = (event: Type): event is SynthesizeEvent => event.kind === All.SynthesizeEventTag;
export const isButtonEvent = (event: Type): event is ButtonEvent => event.kind === All.ButtonEventTag;
export const isSelectEvent = (event: Type): event is SelectEvent => event.kind === All.SelectEventTag;
export const isUserSelectEvent = (event: Type): event is UserSelectEvent => event.kind === All.UserSelectEventTag;
export const isRoleSelectEvent = (event: Type): event is RoleSelectEvent => event.kind === All.RoleSelectEventTag;
export const isChannelSelectEvent = (event: Type): event is ChannelSelectEvent => event.kind === All.ChannelSelectEventTag;
export const isMentionSelectEvent = (event: Type): event is MentionSelectEvent => event.kind === All.MentionSelectEventTag;
export const isSubmitEvent = (event: Type): event is SubmitEvent => event.kind === All.SubmitEventTag;



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
