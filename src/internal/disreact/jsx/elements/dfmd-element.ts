/* eslint-disable @typescript-eslint/no-empty-object-type,@typescript-eslint/no-redundant-type-constituents */


import type {DA} from '#disreact/virtual/entities/index.ts';
import type {E} from '#pure/effect';
import type {bool, epochms, str, und, url} from '#src/internal/pure/types-pure.ts';
import type {AtLeast1, Attr, Both, Elem, One} from '@disreact-jsx/elements/helpers.ts';
import type {JSX} from '@disreact-jsx/jsx-runtime.ts';


export interface IntrinsicElements extends SpecialFormat, ListElement, DFMarkdown, Input {
  li      : ListItemAttributes;
  markdown: {children: Elem<DFMarkdown>};
  row     : InputRowAttributes;
  dialog  : DialogAttributes;
  message : MessageAttributes;
}


export type PlainTextAttributes =
  | {value: str}
  | {children: str};


/**
 * @ref https://discord.com/developers/docs/reference#message-formatting
 * @ex  https://hammertime.cyou
 */
export type TimestampAttributes = {
  epoch   : epochms;
  variant?: 'd' | 'date' | 'D' | 'Date' | 't' | 'time' | 'T' | 'Time' | 'f' | 'full' | 'F' | 'Full' | 'R' | 'Relative';
};


/**
 * @ref https://discord.com/developers/docs/reference#message-formatting
 */
export type EmojiMarkdownAttributes =
  | {name: str}
  | {name: str; id: str}
  | {name: str; id: str; animated?: bool | und};


/**
 * @ref https://discord.com/developers/docs/reference#message-formatting
 */
export type SlashCommandReferenceAttributes =
  | {id: str; name: str}
  | {id: str; name: str; subname: str}
  | {id: str; name: str; subname: str; group: str};


/**
 * @ref https://discord.com/developers/docs/reference#message-formatting
 */
export type AtMentionJSX =
  | {here: bool}
  | {everyone: bool}
  | {variant: 'user' | 'role' | 'channel'; id: str};


/**
 * @ref https://discord.com/developers/docs/reference#message-formatting
 */
export type DiscordUrlAttributes =
  | {variant: 'message'; channel_id: str; message_id: str}
  | {variant: 'link'; href: str};


/**
 * @ref https://discord.com/developers/docs/reference#message-formatting-guild-navigation-types
 */
export type GuildNavAttributes =
  | {id: str; variant: 'onboarding' | 'browse' | 'guide' | 'linked-roles'}
  | {id: str; variant: 'linked-role'; role_id: str};


/**
 * @ref https://discord.com/developers/docs/reference#message-formatting
 */
export type SpecialFormat = {
  emoji: EmojiMarkdownAttributes;
  time : TimestampAttributes;
  at   : AtMentionJSX;
  url  : DiscordUrlAttributes;
  bot  : SlashCommandReferenceAttributes;
  nav  : GuildNavAttributes;
};


/**
 * @ref https://gist.github.com/matthewzring/9f7bbfd102003963f9be7dbcf7d40e51
 */
export type ListAttributes = Attr<{}, ListItemAttributes>;
export type ListElement = {
  ul: ListAttributes;
  ol: ListAttributes;
};
export type ListItemAttributes = Both<Elem<DFMarkdown> | Elem<SpecialFormat>>;


/**
 * @ref https://gist.github.com/matthewzring/9f7bbfd102003963f9be7dbcf7d40e51
 */
export type DFMarkdown = {
  a         : Attr<{embedded?: bool; href: url}, DFMarkdown>;
  p         : {value: str} | {children: AtLeast1<str | Elem<DFMarkdown | ListElement>>};
  b         : {value: str} | {children: str | Elem<DFMarkdown | ListElement>};
  i         : {value: str} | {children: str | Elem<DFMarkdown | ListElement>};
  s         : {value: str} | {children: str | Elem<DFMarkdown | ListElement>};
  u         : {value: str} | {children: str | Elem<DFMarkdown | ListElement>};
  sub       : {value: str} | {children: str};
  sup       : {value: str} | {children: str};
  details   : {value: str} | {children: str | Elem<DFMarkdown | ListElement>};
  h1        : {value: str} | {children: str | Elem<DFMarkdown | ListElement>};
  h2        : {value: str} | {children: str | Elem<DFMarkdown | ListElement>};
  h3        : {value: str} | {children: str | Elem<DFMarkdown | ListElement>};
  small     : {value: str} | {children: str | Elem<DFMarkdown | ListElement>};
  br        : {};
  blockquote: {value: str} | {children: str | Elem<DFMarkdown | ListElement>};
  pre       : {value: str} | {children: str};
  code      : {value: str} | {children: str};
};


/**
 * @ref https://discord.com/developers/docs/interactions/message-components#buttons
 */
export type ButtonAttributes = Omit<DA.Button, 'type'> & {onClick: () => void};


/**
 * @ref https://discord.com/developers/docs/interactions/message-components#select-menus
 */
export type SelectAttributes = DA.Select & Both<SelectOptionAttributes | MentionDefaultAttributes>;

export type SelectOptionAttributes = {value: str; label: str; description?: str; emoji?: str; default?: boolean};
export type UserDefaultAttributes = {id: str; type: 'user'};
export type RoleDefaultAttributes = {id: str; type: 'role'};
export type ChannelDefaultAttributes = {id: str; type: 'channel'};
export type MentionDefaultAttributes = UserDefaultAttributes | RoleDefaultAttributes | ChannelDefaultAttributes;
export type OptionAttributes = SelectOptionAttributes | MentionDefaultAttributes;


/**
 * @ref https://discord.com/developers/docs/interactions/message-components#text-inputs
 */
export type TextAttributes = Omit<DA.Text, 'type'> & One<str>;


/**
 * @ref https://discord.com/developers/docs/interactions/message-components#what-is-a-component
 */
export type Input = {
  button: ButtonAttributes;
  select: SelectAttributes;
  option: OptionAttributes;
  text  : TextAttributes;
};


/**
 * @ref https://discord.com/developers/docs/interactions/message-components#action-rows
 */
export type InputRowAttributes = {children: AtLeast1<Elem<Input>>};


export type DialogAttributes = {
  onSubmit?: () => void | E.Effect<void>;
  title    : str;
  children : AtLeast1<TextAttributes>;
};


export type MessageAttributes = {
  content? : str | JSX.IntrinsicElements['markdown'];
  embeds?  : [];
  children?: AtLeast1<InputRowAttributes>;
};


// todo https://discord.com/developers/docs/reference#locales
