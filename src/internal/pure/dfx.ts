import type {opt, str} from '#src/internal/pure/types-pure.ts';
import {Discord} from 'dfx';


export type RestEmbed = Discord.Embed;
export type RestMessage = Discord.Message;


export type RestIx = Discord.Interaction;
export type RestData = Discord.InteractionDatum;
export type RestDataDialog = Discord.ModalSubmitDatum;
export type RestDataComponent = Discord.MessageComponentDatum;
export type RestDataResolved = Discord.ResolvedDatum;
export type SelectOp = Discord.SelectOption;
export type ManagedOp = Discord.SelectDefaultValue;


export type RestEncodeMessage = opt<Discord.Message>;
export type RestEncodeDialog =
  Discord.ModalSubmitDatum
  & {title: str};


export type SelectEvent = {
  values: str[];
};


export type ManagedSelectEvent = {
  values  : str[];
  resolved: Required<RestDataResolved>;
};


export type RestRow = Discord.ActionRow;
export type RestComponent = Discord.Component;
export type RestButton = Discord.Button;
export type RestText = Discord.TextInput;
export type RestStringSelect = Discord.SelectMenu;
export type RestUserSelect = Discord.SelectMenu;
export type RestRoleSelect = Discord.SelectMenu;
export type RestChannelSelect = Discord.SelectMenu;
export type RestMentionableSelect = Discord.SelectMenu;


export type OptRow = opt<RestRow>;
export type OptButton = opt<RestButton>;
export type OptSelect = opt<RestStringSelect>;
export type OptUser = opt<RestUserSelect>;
export type OptRole = opt<RestRoleSelect>;
export type OptChannel = opt<RestChannelSelect>;
export type OptMention = opt<RestMentionableSelect>;
export type OptText = opt<RestText>;


export const RxType = Discord.InteractionType;
export const TxType = Discord.InteractionCallbackType;
export const TxFlag = Discord.MessageFlag;


export const TypeC  = Discord.ComponentType;
export const StyleB = Discord.ButtonStyle;
export const StyleT = Discord.TextInputStyle;
export const TypeCh = Discord.ChannelType;
