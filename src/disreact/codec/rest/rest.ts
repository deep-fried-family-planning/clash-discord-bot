import {Discord} from 'dfx/index';
import {ButtonStyle, ChannelFlag, ChannelType, ComponentType, EventType, InteractionCallbackType as CallbackType, InteractionType, MessageFlag, TextInputStyle} from 'dfx/types';



export {
  Discord,
  CallbackType as Tx,
  InteractionType as Rx,
  ComponentType as Cx,
  MessageFlag as Mx,
  ButtonStyle as Bx,
  TextInputStyle as Ts,
  ChannelType as Ct,
  ChannelFlag as Cf,
  EventType,
};

export const PING         = InteractionType.PING;
export const COMMAND      = InteractionType.APPLICATION_COMMAND;
export const SUBMIT       = InteractionType.MODAL_SUBMIT;
export const CLICK        = InteractionType.MESSAGE_COMPONENT;
export const AUTOCOMPLETE = InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE;

export const OPEN         = CallbackType.MODAL;
export const UPDATE       = CallbackType.UPDATE_MESSAGE;
export const SOURCE       = CallbackType.CHANNEL_MESSAGE_WITH_SOURCE;
export const DEFER_UPDATE = CallbackType.DEFERRED_UPDATE_MESSAGE;
export const DEFER_SOURCE = CallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE;

export const ACTION_ROW     = ComponentType.ACTION_ROW;
export const BUTTON         = ComponentType.BUTTON;
export const TEXT_INPUT     = ComponentType.TEXT_INPUT;
export const SELECT_MENU    = ComponentType.STRING_SELECT;
export const USER_SELECT    = ComponentType.USER_SELECT;
export const ROLE_SELECT    = ComponentType.ROLE_SELECT;
export const CHANNEL_SELECT = ComponentType.CHANNEL_SELECT;
export const MENTION_SELECT = ComponentType.MENTIONABLE_SELECT;
export const PRIMARY        = ButtonStyle.PRIMARY;
export const SECONDARY      = ButtonStyle.SECONDARY;
export const SUCCESS        = ButtonStyle.SUCCESS;
export const DANGER         = ButtonStyle.DANGER;
export const LINK           = ButtonStyle.LINK;
export const SHORT          = TextInputStyle.SHORT;
export const PARAGRAPH      = TextInputStyle.PARAGRAPH;

export type ActionRow = Discord.ActionRow;
export type Button = Discord.Button;
export type SelectMenu = Discord.SelectMenu;
export type TextInput = Discord.TextInput;
export type Component = Discord.Component;

export const EPHEMERAL = MessageFlag.EPHEMERAL;

export type Snowflake = `${bigint}`;
export type User = Discord.User;
export type Guild = Discord.Guild;
export type GuildMember = Discord.GuildMember;
export type Channel = Discord.Channel;
export type Message = Discord.Message;
export type Dialog = Discord.InteractionCallbackModal;
export type Response = Message | Dialog;
export type Embed = Discord.Embed;
export type Emoji = Discord.Emoji;

export type Interaction =
  | Omit<Discord.Interaction, 'data'> & {type: InteractionType.APPLICATION_COMMAND; data: Discord.ApplicationCommandDatum}
  | Omit<Discord.Interaction, 'data'> & {type: InteractionType.MODAL_SUBMIT; data: Discord.ModalSubmitDatum}
  | Omit<Discord.Interaction, 'data'> & {type: InteractionType.MESSAGE_COMPONENT; data: Discord.MessageComponentDatum}
  | Omit<Discord.Interaction, 'data'> & {type: InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE}
  | Omit<Discord.Interaction, 'data'> & {type: InteractionType.PING};

export type Ix = Interaction;

type NotRow = Exclude<Component, ActionRow>;

export const findTarget = (custom_id: string, components: Component[]): Button | SelectMenu | undefined => {
  for (const row of components) {
    if (!('components' in row)) {
      throw new Error('impossible');
    }
    for (const component of row.components as NotRow[]) {
      if (component.custom_id === custom_id) {
        return component;
      }
    }
  }
};
