import {Rest} from '#src/disreact/codec/abstract/index.ts';
import {DateTime} from 'effect';
import {DOMEvent, Routing} from './schema';



export const decodeInteractionInput = (rest: Rest.Interaction, givenStart = Date.now()) => {
  const rightNow = DateTime.unsafeMake(givenStart);

  if (rest.type === Rest.Rx.PING) {
    throw new Error('Unsupported: Ping');
  }

  if (rest.type === Rest.Rx.APPLICATION_COMMAND_AUTOCOMPLETE) {
    throw new Error('Unsupported: ApplicationCommandAutocomplete');
  }

  if (rest.type === Rest.Rx.APPLICATION_COMMAND) {
    throw new Error('Unsupported: ApplicationCommand');
  }

  if (rest.type === Rest.Rx.MODAL_SUBMIT) {
    throw new Error('Unsupported: ModalSubmit');
  }

  return decodeMessageComponent(rightNow, rest);
};



const decodeMessageComponent = (rightNow: any, rest: any) => {
  const components = {} as any;

  for (let i = 0; i < rest.message.components.length; i++) {
    for (let j = 0; j < rest.message.components[i].components.length; j++) {
      components[rest.message.components[i].components[j].custom_id] = rest.message.components[i].components[j];
    }
  }

  const target = components[rest.data.custom_id];

  const id = Symbol(`DisReact.Ptr.${rest.id}`);

  // const parsedCustomId = Routing.parseCustomId(rest.data.custom_id);

  switch (rest.data.component_type) {
    case Rest.Cx.BUTTON: {
      return DOMEvent.Button.make({
        id,
        type: 'onclick',
        data: rest.data,
        target,
      });
    }
    case Rest.Cx.STRING_SELECT: {
      return DOMEvent.StringSelect.make({
        id,
        type    : 'onclick',
        data    : rest.data,
        target,
        values  : rest.data.values,
        selected: target.options.filter((option: any) => rest.data.values.includes(option.value)),
      });
    }
    case Rest.Cx.USER_SELECT: {
      return DOMEvent.UserSelect.make({
        id,
        type : 'onclick',
        data : rest.data,
        target,
        users: rest.data.values.map((value: any) => ({type: 'user', id: value})),
      });
    }
    case Rest.Cx.ROLE_SELECT: {
      return DOMEvent.RoleSelect.make({
        id,
        type : 'onclick',
        data : rest.data,
        target,
        roles: rest.data.values.map((value: any) => ({type: 'role', id: value})),
      });
    }
    case Rest.Cx.CHANNEL_SELECT: {
      return DOMEvent.ChannelSelect.make({
        id,
        type    : 'onclick',
        data    : rest.data,
        target,
        channels: rest.data.values.map((value: any) => ({type: 'channel', id: value})),
      });
    }
    case Rest.Cx.MENTIONABLE_SELECT: {
      return DOMEvent.MentionSelect.make({
        id,
        type    : 'onclick',
        data    : rest.data,
        target,
        mentions: [] as any[],
        users   : [] as any[],
        roles   : [] as any[],
        channels: [] as any[],
      });
    }
    default:
      throw new Error(`Unsupported: MessageComponent (type: ${rest.data.component_type})`);
  }
};
