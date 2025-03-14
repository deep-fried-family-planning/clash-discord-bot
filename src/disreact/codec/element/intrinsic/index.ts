export * as Button from '#src/disreact/codec/element/definitions/button.ts';
export * as Command from '#src/disreact/codec/element/definitions/command.ts';
export * as Dialog from '#src/disreact/codec/element/definitions/dialog.ts';
export * as Embed from '#src/disreact/codec/element/definitions/embed.ts';
export * as Select from '#src/disreact/codec/element/definitions/select.ts';
export * as Message from '#src/disreact/codec/element/definitions/message.ts';
export * as Markdown from '#src/disreact/codec/element/definitions/markdown.ts';
import * as Button from '#src/disreact/codec/element/definitions/button.ts';
import * as Command from '#src/disreact/codec/element/definitions/command.ts';
import * as Dialog from '#src/disreact/codec/element/definitions/dialog.ts';
import * as Embed from '#src/disreact/codec/element/definitions/embed.ts';
import * as Markdown from '#src/disreact/codec/element/definitions/markdown.ts';
import * as Message from '#src/disreact/codec/element/definitions/message.ts';
import * as Select from '#src/disreact/codec/element/definitions/select.ts';



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

export const validateAttributesDEV = {
  ...Button.validateAttributesDEV,
  ...Command.validateAttributesDEV,
  ...Dialog.validateAttributesDEV,
  ...Embed.validateAttributesDEV,
  ...Markdown.validateAttributesDEV,
  ...Message.validateAttributesDEV,
  ...Select.validateAttributesDEV,
};
