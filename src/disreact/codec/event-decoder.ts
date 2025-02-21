import {Rest} from '#src/disreact/codec/abstract/index.ts';
import {ButtonEvent, ChannelSelectEvent, MentionSelectEvent, RoleSelectEvent, SelectEvent, SubmitEvent, UserSelectEvent} from '#src/disreact/codec/schema/frame.ts';

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
