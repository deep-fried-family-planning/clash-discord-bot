import {$onclick} from '#src/disreact/codec/abstract/attributes.ts';
import {$channels, $danger, $mentions, $primary, $roles, $secondary, $select, $success, $users} from '#src/disreact/codec/abstract/dtml.ts';
import {Rest} from '#src/disreact/codec/abstract/index.ts';
import {DateTime} from 'effect';
import {DOMEvent} from './schema';



export const decodeInteractionInput = (rest: Rest.Interaction, givenStart = Date.now()) => {
  const rightNow = DateTime.unsafeMake(givenStart);

  if (rest.type === Rest.PING) {
    throw new Error('Unsupported: Ping');
  }

  if (rest.type === Rest.AUTOCOMPLETE) {
    throw new Error('Unsupported: ApplicationCommandAutocomplete');
  }

  if (rest.type === Rest.COMMAND) {
    throw new Error('Unsupported: ApplicationCommand');
  }

  if (rest.type === Rest.SUBMIT) {
    throw new Error('Unsupported: ModalSubmit');
  }

  return decodeMessageComponent(rightNow, rest);
};


const styleToButtonTag = {
  [Rest.PRIMARY]  : $primary,
  [Rest.SECONDARY]: $secondary,
  [Rest.SUCCESS]  : $success,
  [Rest.DANGER]   : $danger,
};


const createEvent = (rest: any) => {
  const components = {} as any;
  for (let i = 0; i < rest.message.components.length; i++) {
    for (let j = 0; j < rest.message.components[i].components.length; j++) {
      components[rest.message.components[i].components[j].custom_id] = rest.message.components[i].components[j];
    }
  }
  const component = components[rest.data.custom_id];

  const event = {
    rest,
    cmap  : components,
    target: {
      id   : rest.data.custom_id,
      value: component,
    },
  } as any;

  if (rest.data.component_type === Rest.BUTTON) {
    event.target.handle = $onclick;
    event.target.tag = styleToButtonTag[component.style as never];
    return DOMEvent.Button.make(event);
  }
  if (rest.data.component_type === Rest.SELECT_MENU) {
    event.target.handle = $onclick;
    event.target.tag = $select;
    return DOMEvent.StringSelect.make(event);
  }
  if (rest.data.component_type === Rest.USER_SELECT) {
    event.target.handle = $onclick;
    event.target.tag = $users;
    return DOMEvent.UserSelect.make(event);
  }
  if (rest.data.component_type === Rest.ROLE_SELECT) {
    event.target.handle = $onclick;
    event.target.tag = $roles;
    return DOMEvent.RoleSelect.make(event);
  }
  if (rest.data.component_type === Rest.CHANNEL_SELECT) {
    event.target.handle = $onclick;
    event.target.tag = $channels;
    return DOMEvent.ChannelSelect.make(event);
  }
  if (rest.data.component_type === Rest.MENTION_SELECT) {
    event.target.handle = $onclick;
    event.target.tag = $mentions;
    return DOMEvent.MentionSelect.make(event);
  }
  throw new Error('Unsupported message component');
};
