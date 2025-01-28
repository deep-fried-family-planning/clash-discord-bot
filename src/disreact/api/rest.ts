import {Discord} from 'dfx/index';


export type Snowflake = `${bigint}`;
export type User = Discord.User;
export type Guild = Discord.Guild;
export type GuildMember = Discord.GuildMember;
export type Channel = Discord.Channel;

export type Message = Discord.Message;
export type Dialog = Discord.InteractionCallbackModal;
export type Response = Message | Dialog;

export type Interaction =
  | Omit<Discord.Interaction, 'data'> & {type: typeof InteractionType.APPLICATION_COMMAND; data: Discord.ApplicationCommandDatum}
  | Omit<Discord.Interaction, 'data'> & {type: typeof InteractionType.MODAL_SUBMIT; data: Discord.ModalSubmitDatum}
  | Omit<Discord.Interaction, 'data'> & {type: typeof InteractionType.MESSAGE_COMPONENT; data: Discord.MessageComponentDatum}
  | Omit<Discord.Interaction, 'data'> & {type: typeof InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE}
  | Omit<Discord.Interaction, 'data'> & {type: typeof InteractionType.PING};


export type Embed = Discord.Embed;

export type Emoji = Discord.Emoji;

export const InteractionType = Discord.InteractionType;
export const CallbackType    = Discord.InteractionCallbackType;
export const ComponentType   = Discord.ComponentType;
export const MessageFlag     = Discord.MessageFlag;
export const ButtonStyle     = Discord.ButtonStyle;
export const TextInputStyle  = Discord.TextInputStyle;

export type InteractionType = typeof InteractionType;
export type CallbackType = typeof CallbackType;
export type ComponentType = typeof ComponentType;
export type ButtonStyle = typeof ButtonStyle;
export type TextInputStyle = typeof TextInputStyle;
export type MessageFlag = typeof MessageFlag;


export const Public        = {type: CallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE};
export const PublicUpdate  = {type: CallbackType.DEFERRED_UPDATE_MESSAGE};
export const Private       = {type: CallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE, data: {flags: MessageFlag.EPHEMERAL}};
export const PrivateUpdate = {type: CallbackType.DEFERRED_UPDATE_MESSAGE, data: {flags: MessageFlag.EPHEMERAL}};
export const OpenDialog    = {type: CallbackType.MODAL};


type NotRow = Exclude<Discord.Component, Discord.ActionRow>;

export const findRestTarget = (
  custom_id: string,
  components: Discord.Component[],
) => {
  let target: Discord.Button | Discord.SelectMenu | undefined;
  let rdx = 0;
  let cdx = 0;

  for (let i = 0; i < components.length; i++) {
    const row = components[i];

    if (!('components' in row)) throw new Error('cannot');

    for (let j = 0; j < row.components.length; j++) {
      const component = row.components[j] as NotRow;

      if (component.custom_id === custom_id) {
        if ('value' in component) throw new Error('cannot call text input');

        target = component;
        rdx    = i;
        cdx    = j;
        break;
      }
    }
  }

  return target;
};
