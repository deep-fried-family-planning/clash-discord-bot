import {DEvent, Rest} from '#src/disreact/codec/abstract/index.ts';
import {DATT} from '#src/disreact/dsx/index.ts';

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
    // const target = Rest.findTarget(rest.data.custom_id, rest.message!.components);

    // if (!target) {
    //   throw new Error('Unsupported modal submit');
    // }
    return DEvent.SubmitClick({
      id    : rest.data.custom_id,
      rest,
      type  : DATT.onsubmit,
      target: {} as never,
    });
  }


  if (rest.type === Rest.Rx.MESSAGE_COMPONENT) {
    const target = Rest.findTarget(rest.data.custom_id, rest.message!.components);

    if (!target) {
      throw new Error('Unsupported message click');
    }
    if (rest.data.component_type === Rest.Cx.BUTTON) {
      return DEvent.ButtonClick({
        id    : rest.data.custom_id,
        rest,
        type  : DATT.onclick,
        target: target as never,
      });
    }
    if (rest.data.component_type === Rest.Cx.STRING_SELECT) {
      return DEvent.SelectClick({
        id    : rest.data.custom_id,
        rest,
        type  : DATT.onclick,
        target: target as never,
      });
    }
    if (rest.data.component_type === Rest.Cx.USER_SELECT) {
      return DEvent.UserClick({
        id    : rest.data.custom_id,
        rest,
        type  : DATT.onclick,
        target: target as never,
      });
    }
    if (rest.data.component_type === Rest.Cx.ROLE_SELECT) {
      return DEvent.RoleClick({
        id    : rest.data.custom_id,
        rest,
        type  : DATT.onclick,
        target: target as never,
      });
    }
    if (rest.data.component_type === Rest.Cx.CHANNEL_SELECT) {
      return DEvent.ChannelClick({
        id    : rest.data.custom_id,
        rest,
        type  : DATT.onclick,
        target: target as never,
      });
    }
    if (rest.data.component_type === Rest.Cx.MENTIONABLE_SELECT) {
      return DEvent.MentionClick({
        id    : rest.data.custom_id,
        rest,
        type  : DATT.onclick,
        target: target as never,
      });
    }
  }

  throw new Error('Unsupported event');
};
