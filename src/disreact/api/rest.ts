import {Discord} from 'dfx/index';


export type Snowflake = `${bigint}`;
export type User = Discord.User;
export type Guild = Discord.Guild;
export type GuildMember = Discord.GuildMember;

export type Message = Discord.Message;
export type Dialog = Discord.InteractionCallbackModal;

export type Interaction = Discord.Interaction;


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
