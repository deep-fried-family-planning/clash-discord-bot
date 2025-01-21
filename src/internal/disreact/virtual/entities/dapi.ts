import type {mopt, opt, str} from '#src/internal/pure/types-pure.ts';
import {Discord} from 'dfx';


export type Ix =
  Omit<Discord.Interaction, 'data' | 'message'>
  & {
  data: {
    custom_id?     : str;
    component_type?: number;
    values?        : str[];
    resolved?      : Discord.ResolvedDatum;
    components?    : ActionRow[];
  };
  message?: Message;
};


export type IxResolved = Discord.ResolvedDatum;

export type Message = Omit<Discord.Message, 'components'> & {
  components?: ActionRow[];
};


export type TxMessage = Omit<opt<Discord.InteractionCallbackMessage>, 'components'> & {
  components?: ActionRow[];
};
export type Components = (Text | Button | Select | UserSelect | RoleSelect | ChannelSelect | MentionSelect)[];
export type TxComponents = {
  type      : Discord.ComponentType.ACTION_ROW;
  components: (Text | Button | Select | UserSelect | RoleSelect | ChannelSelect | MentionSelect)[];
}[];
export type TxDialog = Discord.InteractionCallbackModal;

export type Embed = Discord.Embed;


export type Emoji = Discord.Emoji;


export type ActionRow = {
  type      : Discord.ComponentType.ACTION_ROW;
  components: (Text | Button | Select | UserSelect | RoleSelect | ChannelSelect | MentionSelect)[];
};


export type Button = mopt<Discord.Button>;
export type Text = mopt<Discord.TextInput>;
export type Select = mopt<Discord.SelectMenu>;
export type UserSelect = mopt<Discord.SelectMenu>;
export type RoleSelect = mopt<Discord.SelectMenu>;
export type ChannelSelect = mopt<Discord.SelectMenu>;
export type MentionSelect = mopt<Discord.SelectMenu>;


export type SelectValue = {value: str; label: str; description?: str; emoji?: Emoji; default?: boolean};
export type UserSelectValue = {type: 'user'; id: str};
export type RoleSelectValue = {type: 'role'; id: str};
export type ChannelSelectValue = {type: 'channel'; id: str};
export type MentionSelectValue =
  UserSelectValue
  | RoleSelectValue
  | ChannelSelectValue;


export const En = {
  CT    : Discord.ComponentType,
  Ix    : Discord.InteractionType,
  MF    : Discord.MessageFlag,
  Rx    : Discord.InteractionCallbackType,
  Button: Discord.ButtonStyle,
  Text  : Discord.TextInputStyle,
};


export type User = Discord.User;
export type GuildMember = Discord.GuildMember;
export type Guild = Discord.Guild;
