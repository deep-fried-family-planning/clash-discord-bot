import type {Button, Embed, Message, MessageComponentDatum, ModalSubmitDatum, SelectMenu, TextInput} from 'dfx/types';
import type {Discord} from 'dfx';
import type {ChannelSelect, MentionableSelect, RoleSelect, UserSelect} from 'discord-interactions';
import type {IxD} from '#src/internal/discord.ts';


export type IxIn = IxD & {
    data: MessageComponentDatum
        | ModalSubmitDatum;
    message: Message;
};


export type RestEmbed = Embed;
export type RestMessage = Message;
export type RestButton = Button;
export type RestSelect = SelectMenu;
export type RestText = TextInput;


export type RestType =
    | Discord.ComponentType.BUTTON
    | Discord.ComponentType.TEXT_INPUT
    | Discord.ComponentType.STRING_SELECT
    | Discord.ComponentType.CHANNEL_SELECT
    | Discord.ComponentType.ROLE_SELECT
    | Discord.ComponentType.MENTIONABLE_SELECT
    | Discord.ComponentType.USER_SELECT;

export type RestResolved<T> = Partial<Extract<
    | [Discord.ComponentType.BUTTON, RestButton]
    | [Discord.ComponentType.TEXT_INPUT, RestText]
    | [Discord.ComponentType.STRING_SELECT, RestSelect]
    | [Discord.ComponentType.CHANNEL_SELECT, SelectMenu]
    | [Discord.ComponentType.ROLE_SELECT, SelectMenu]
    | [Discord.ComponentType.MENTIONABLE_SELECT, SelectMenu]
    | [Discord.ComponentType.USER_SELECT, SelectMenu],
    [T, unknown]
>[1]>;


type RestTypeType<T, R> = {
    type: T;
    rest: R;
};
export type CxButton = RestTypeType<Discord.ComponentType.BUTTON, Button>;
export type CxText = RestTypeType<Discord.ComponentType.TEXT_INPUT, TextInput>;
export type CxString = RestTypeType<Discord.ComponentType.STRING_SELECT, SelectMenu>;
export type CxChannel = RestTypeType<Discord.ComponentType.CHANNEL_SELECT, SelectMenu>;
export type CxRole = RestTypeType<Discord.ComponentType.ROLE_SELECT, SelectMenu>;
export type CxMention = RestTypeType<Discord.ComponentType.MENTIONABLE_SELECT, SelectMenu>;
export type CxUser = RestTypeType<Discord.ComponentType.USER_SELECT, SelectMenu>;
