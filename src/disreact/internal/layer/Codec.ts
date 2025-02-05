import {DEvent, Rest} from '#src/disreact/abstract/index.ts';
import {DATT} from '#src/disreact/internal/dsx/index.ts';
import {Critical} from '#src/disreact/internal/index.ts';
import {E} from '#src/internal/pure/effect.ts';



const unsupported = [
  Rest.Rx.PING,
  Rest.Rx.APPLICATION_COMMAND_AUTOCOMPLETE,
  Rest.Rx.APPLICATION_COMMAND,
];



export const makeDEvent = (rest: Rest.Interaction) => E.gen(function* () {
  if (unsupported.includes(rest.type)) {
    return yield * new Critical({why: '[Codec]: Unsupported interaction'});
  }

  if (rest.type === Rest.Rx.MODAL_SUBMIT) {
    const target = Rest.findTarget(rest.data.custom_id, rest.message!.components);

    if (!target) {
      return yield * new Critical({why: '[Codec]: Unsupported modal submit'});
    }

    return DEvent.SubmitClick({
      id    : rest.data.custom_id,
      rest,
      type  : DATT.onsubmit,
      target: target as never,
    });
  }

  if (rest.type === Rest.Rx.MESSAGE_COMPONENT) {
    const target = Rest.findTarget(rest.data.custom_id, rest.message!.components);

    if (!target) {
      return yield * new Critical({why: '[Codec]: Unsupported message click'});
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

  return yield * new Critical({why: '[Codec]: Unsupported interaction'});
});



export const decodeDoken = () => E.gen(function * () {

});



export const decodeRoute = () => E.gen(function * () {

});



export const encodeMessage = () => E.gen(function * () {

});



export const encodeDialog = () => E.gen(function * () {

});
