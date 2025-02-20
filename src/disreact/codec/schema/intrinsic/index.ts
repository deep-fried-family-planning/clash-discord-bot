import type * as Button from './button.ts';
import type * as Dialog from './dialog.ts';
import type * as Embed from './embed.ts';
import type * as Select from './select.ts';
import type * as Message from './message.ts';
import type * as Markdown from './markdown.ts';
import type * as Command from './command.ts';

export * as Button from './button.ts';
export * as Command from './command.ts';
export * as Dialog from './dialog.ts';
export * as Embed from './embed.ts';
export * as Select from './select.ts';
export * as Message from './message.ts';
export * as Markdown from './markdown.ts';

export type IntrinsicTuple =
  | [Button.Tag, Button.Attributes]
  | [Button.PrimaryTag, Button.PrimaryAttributes]
  | [Button.SecondaryTag, Button.SecondaryAttributes]
  | [Button.SuccessTag, Button.SuccessAttributes]
  | [Button.DangerTag, Button.DangerAttributes]
  | [Button.LinkTag, Button.LinkAttributes]
  | [Button.PremiumTag, Button.PremiumAttributes]
  | [Command.Tag, Command.Attributes]
  | [Dialog.Tag, Dialog.Attributes]
  | [Dialog.TextInputTag, Dialog.TextInputAttributes]
  | [Embed.Tag, Embed.Attributes]
  | [Embed.FieldTag, Embed.FieldAttributes]
  | [Embed.FooterTag, Embed.FooterAttributes]
  | [Markdown.AtMentionTag, Markdown.AtMentionAttributes]
  | [Markdown.AnchorTag, Markdown.AnchorAttributes]
  | [Markdown.AnchorMaskTag, Markdown.AnchorMaskAttributes]
  | [Markdown.BreakTag, Markdown.BreakAttributes]
  | [Markdown.PrePostFixTag, Markdown.PrePostFixAttributes]
  | [Markdown.PrefixTag, Markdown.PrefixAttributes]
  | [Markdown.BlockQuoteTag, Markdown.BlockQuoteAttributes]
  | [Markdown.BlockCodeTag, Markdown.BlockCodeAttributes]
  | [Markdown.IndentTag, Markdown.IndentAttributes]
  | [Message.Tag, Message.Attributes]
  | [Message.ActionRowTag, Message.ActionRowAttributes]
  | [Select.OptionTag, Select.OptionAttributes]
  | [Select.Tag, Select.Attributes]
  | [Select.DefaultValueTag, Select.DefaultValueAttributes]
  | [Select.UsersTag, Select.UsersAttributes]
  | [Select.RolesTag, Select.RolesAttributes]
  | [Select.ChannelsTag, Select.ChannelsAttributes]
  | [Select.MentionsTag, Select.MentionsAttributes];

export type IntrinsicMap = {
  [K in IntrinsicTuple as K[0]]: K[1];
};
