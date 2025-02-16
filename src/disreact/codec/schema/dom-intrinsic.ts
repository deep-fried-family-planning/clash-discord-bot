import {$a, $at, $b, $blockquote, $br, $code, $details, $h1, $h2, $h3, $i, $li, $mask, $ol, $p, $pre, $s, $small, $timestamp, $u, $ul} from '#src/disreact/codec/abstract/dfmd.ts';
import {$actions, $author, $channels, $danger, $default, $dialog, $embed, $emoji, $field, $footer, $image, $link, $mentions, $message, $modal, $option, $premium, $primary, $roles, $secondary, $select, $success, $text, $textarea, $thumbnail, $users, $video} from '#src/disreact/codec/abstract/dtml.ts';
import {Arr, Bool, CustomId, OptBoolean, SnowFlake, Str} from '#src/disreact/codec/schema/shared.ts';
import {between, Int, Literal, maxItems, maxLength, minItems, optional, type Schema, Struct, Union} from 'effect/Schema';



export const AtMentionTag = Literal($a);
export const AnchorTag = Literal($at);
export const AnchorMaskTag = Literal($mask);
export const TimestampTag = Literal($timestamp);
export const ParagraphTag = Literal($p);
export const BreakTag = Literal($br);
export const BoldTag = Literal($b);
export const ItalicTag = Literal($i);
export const UnderlineTag = Literal($u);
export const StrikethroughTag = Literal($s);
export const DetailsTag = Literal($details);
export const CodeTag = Literal($code);
export const CodeBlockTag = Literal($pre);
export const BlockquoteTag = Literal($blockquote);
export const Heading1Tag = Literal($h1);
export const Heading2Tag = Literal($h2);
export const Heading3Tag = Literal($h3);
export const SubHeaderTag = Literal($small);
export const OrderedListTag = Literal($ol);
export const UnorderedListTag = Literal($ul);
export const ListItemTag = Literal($li);
export const EmojiTag = Literal($emoji);
export const MessageTag = Literal($message);
export const ActionsTag = Literal($actions);
export const PrimaryButtonTag = Literal($primary);
export const SecondaryButtonTag = Literal($secondary);
export const SuccessButtonTag = Literal($success);
export const DangerButtonTag = Literal($danger);
export const LinkButtonTag = Literal($link);
export const PremiumButtonTag = Literal($premium);
export const StringSelectTag = Literal($select);
export const OptionTag = Literal($option);
export const UserSelectTag = Literal($users);
export const RoleSelectTag = Literal($roles);
export const ChannelSelectTag = Literal($channels);
export const MentionSelectTag = Literal($mentions);
export const DefaultValueTag = Literal($default);
export const EmbedTag = Literal($embed);
export const EmbedImageTag = Literal($image);
export const EmbedFooterTag = Literal($footer);
export const EmbedFieldTag = Literal($field);
export const EmbedAuthorTag = Literal($author);
export const EmbedVideoTag = Literal($video);
export const EmbedThumbnailTag = Literal($thumbnail);
export const DialogTag = Literal($modal, $dialog);
export const TextInputTag = Literal($text, $textarea);

export const MarkdownTag = Union(
  ParagraphTag,
  BreakTag,
  BoldTag,
  ItalicTag,
  UnderlineTag,
  StrikethroughTag,
  DetailsTag,
  CodeTag,
  CodeBlockTag,
  BlockquoteTag,
  Heading1Tag,
  Heading2Tag,
  Heading3Tag,
  SubHeaderTag,
  OrderedListTag,
  UnorderedListTag,
  ListItemTag,
);



export const AtMentionAttributes = Union(
  Struct({everyone: Bool}),
  Struct({here: Bool}),
  Struct({user: SnowFlake}),
  Struct({role: SnowFlake}),
  Struct({channel: SnowFlake}),
  Struct({command: SnowFlake, name: Str, group: optional(Str), subname: optional(Str)}),
  Struct({customize: SnowFlake}),
  Struct({browse: SnowFlake}),
  Struct({guide: SnowFlake}),
  Struct({linked: SnowFlake, role: SnowFlake}),
);

export const AnchorAttributes = Struct({
  href : Str,
  embed: OptBoolean,
});

export const AnchorMaskAttributes = Struct({
  href : Str,
  embed: OptBoolean,
});

export const MarkdownAttributes = Struct({
  indent: optional(Int.pipe(between(0, 10))),
});

export const TimestampAttributes = Union(
  Struct({time: Bool, short: Bool, value: Int}),
  Struct({time: Bool, long: Bool, value: Int}),
  Struct({date: Bool, short: Bool, value: Int}),
  Struct({date: Bool, long: Bool, value: Int}),
  Struct({full: Bool, short: Bool, value: Int}),
  Struct({full: Bool, long: Bool, value: Int}),
  Struct({relative: Bool, value: Int}),
);

export const EmojiAttributes = Struct({
  name    : Str,
  id      : optional(Str),
  animated: optional(Bool),
});

export const ActionsAttributes = Struct({});

export const PrimaryButtonAttributes = Struct({
  custom_id: optional(CustomId),
  label    : optional(Str.pipe(maxLength(80))),
  emoji    : optional(EmojiAttributes),
  disabled : optional(Bool),
});

export const SecondaryButtonAttributes = Struct({
  custom_id: optional(CustomId),
  label    : optional(Str.pipe(maxLength(80))),
  emoji    : optional(EmojiAttributes),
  disabled : optional(Bool),
});

export const SuccessButtonAttributes = Struct({
  custom_id: optional(CustomId),
  label    : optional(Str.pipe(maxLength(80))),
  emoji    : optional(EmojiAttributes),
  disabled : optional(Bool),
});

export const DangerButtonAttributes = Struct({
  custom_id: optional(CustomId),
  label    : optional(Str.pipe(maxLength(80))),
  emoji    : optional(EmojiAttributes),
  disabled : optional(Bool),
});

export const LinkButtonAttributes = Struct({
  url     : Str,
  label   : optional(Str.pipe(maxLength(80))),
  emoji   : optional(EmojiAttributes),
  disabled: optional(Bool),
});

export const PremiumButtonAttributes = Struct({
  sku_id  : Str.pipe(maxLength(34)),
  disabled: optional(Bool),
});

export const OptionAttributes = Struct({
  value      : Str.pipe(maxLength(100)),
  label      : Str.pipe(maxLength(100)),
  description: optional(Str.pipe(maxLength(100))),
  emoji      : optional(EmojiAttributes),
  default    : optional(Bool),
});

export const StringSelectAttributes = Struct({
  custom_id  : optional(CustomId),
  placeholder: optional(Str.pipe(maxLength(150))),
  min_values : optional(Int.pipe(between(1, 25))),
  max_values : optional(Int.pipe(between(1, 25))),
  disabled   : optional(Bool),
  options    : optional(Arr(OptionAttributes).pipe(minItems(1), maxItems(25))),
});

export const DefaultValueAttributes = Union(
  Struct({user: SnowFlake}),
  Struct({role: SnowFlake}),
  Struct({channel: SnowFlake}),
);

export const UserSelectAttributes = Struct({
  custom_id     : optional(CustomId),
  placeholder   : optional(Str.pipe(maxLength(150))),
  min_values    : optional(Int.pipe(between(1, 25))),
  max_values    : optional(Int.pipe(between(1, 25))),
  disabled      : optional(Bool),
  default_values: optional(Arr(Str).pipe(minItems(0), maxItems(25))),
});

export const RoleSelectAttributes = Struct({
  custom_id     : optional(CustomId),
  placeholder   : optional(Str.pipe(maxLength(150))),
  min_values    : optional(Int.pipe(between(1, 25))),
  max_values    : optional(Int.pipe(between(1, 25))),
  disabled      : optional(Bool),
  default_values: optional(Arr(Str).pipe(minItems(0), maxItems(25))),
});

export const ChannelSelectAttributes = Struct({
  custom_id     : optional(CustomId),
  placeholder   : optional(Str.pipe(maxLength(150))),
  min_values    : optional(Int.pipe(between(1, 25))),
  max_values    : optional(Int.pipe(between(1, 25))),
  disabled      : optional(Bool),
  default_values: optional(Arr(Str).pipe(minItems(0), maxItems(25))),
  channel_types : optional(Arr(Int)),
});

export const MentionSelectAttributes = Struct({
  custom_id     : optional(CustomId),
  placeholder   : optional(Str.pipe(maxLength(150))),
  min_values    : optional(Int.pipe(between(1, 25))),
  max_values    : optional(Int.pipe(between(1, 25))),
  disabled      : optional(Bool),
  default_values: optional(Arr(DefaultValueAttributes).pipe(minItems(0), maxItems(25))),
});

export const EmbedVideoAttributes = Struct({
  url      : Str,
  proxy_url: optional(Str),
  height   : optional(Int),
  width    : optional(Int),
});

export const EmbedThumbnailAttributes = Struct({
  url      : Str,
  proxy_url: optional(Str),
  height   : optional(Int),
  width    : optional(Int),
});

export const EmbedImageAttributes = Struct({
  url      : Str,
  proxy_url: optional(Str),
  height   : optional(Int),
  width    : optional(Int),
});

export const EmbedFooterAttributes = Struct({
  text          : optional(Str.pipe(maxLength(2048))),
  icon_url      : optional(Str),
  proxy_icon_url: optional(Str),
});

export const EmbedFieldAttributes = Struct({
  name  : Str.pipe(maxLength(256)),
  value : optional(Str.pipe(maxLength(1024))),
  inline: optional(Bool),
});

export const EmbedAuthorAttributes = Struct({
  name          : Str.pipe(maxLength(256)),
  icon_url      : optional(Str),
  proxy_icon_url: optional(Str),
});

export const EmbedAttributes = Struct({
  title      : optional(Str.pipe(maxLength(256))),
  description: optional(Str.pipe(maxLength(4096))),
  color      : optional(Int.pipe(between(0, 0xFFFFFF))),
  url        : optional(Str),
  timestamp  : optional(Str),
  image      : optional(EmbedImageAttributes),
  footer     : optional(EmbedFooterAttributes),
  thumbnail  : optional(EmbedImageAttributes),
});

export const MessageAttributes = Struct({
  public   : optional(Bool),
  entry    : optional(Bool),
  ephemeral: optional(Bool),
});

export const TextInputAttributes = Struct({
  label     : Str.pipe(maxLength(45)),
  short     : optional(Bool),
  paragraph : optional(Bool),
  custom_id : optional(CustomId),
  value     : optional(Str),
  required  : optional(Bool),
  min_length: optional(Int),
  max_length: optional(Int),
});

export const DialogAttributes = Struct({
  custom_id : optional(CustomId),
  title     : Str.pipe(maxLength(45)),
  components: optional(Arr(TextInputAttributes).pipe(minItems(1), maxItems(5))),
});



export const AtMentionElement = Struct({
  type : AtMentionTag,
  props: AtMentionAttributes,
});

export const AnchorElement = Struct({
  type : AnchorTag,
  props: AnchorAttributes,
});

export const AnchorMaskElement = Struct({
  type : AnchorMaskTag,
  props: AnchorMaskAttributes,
});

export const TimestampElement = Struct({
  type : TimestampTag,
  props: TimestampAttributes,
});
export const EmojiElement = Struct({
  type : EmojiTag,
  props: EmojiAttributes,
});

export const ActionsElement = Struct({
  type : ActionsTag,
  props: ActionsAttributes,
});

export const PrimaryButtonElement = Struct({
  type : PrimaryButtonTag,
  props: PrimaryButtonAttributes,
});

export const SecondaryButtonElement = Struct({
  type : SecondaryButtonTag,
  props: SecondaryButtonAttributes,
});
export const SuccessButtonElement = Struct({
  type : SuccessButtonTag,
  props: SuccessButtonAttributes,
});

export const DangerButtonElement = Struct({
  type : DangerButtonTag,
  props: DangerButtonAttributes,
});

export const LinkButtonElement = Struct({
  type : LinkButtonTag,
  props: LinkButtonAttributes,
});

export const PremiumButtonElement = Struct({
  type : PremiumButtonTag,
  props: PremiumButtonAttributes,
});

export const OptionElement = Struct({
  type : OptionTag,
  props: OptionAttributes,
});

export const StringSelectElement = Struct({
  type : StringSelectTag,
  props: StringSelectAttributes,
});

export const DefaultValueElement = Struct({
  type : DefaultValueTag,
  props: DefaultValueAttributes,
});

export const UserSelectElement = Struct({
  type : UserSelectTag,
  props: UserSelectAttributes,
});

export const RoleSelectElement = Struct({
  type : RoleSelectTag,
  props: RoleSelectAttributes,
});

export const ChannelSelectElement = Struct({
  type : ChannelSelectTag,
  props: ChannelSelectAttributes,
});

export const MentionSelectElement = Struct({
  type : MentionSelectTag,
  props: MentionSelectAttributes,
});

export const EmbedVideoElement = Struct({
  type : EmbedVideoTag,
  props: EmbedVideoAttributes,
});

export const EmbedThumbnailElement = Struct({
  type : EmbedThumbnailTag,
  props: EmbedThumbnailAttributes,
});

export const EmbedImageElement = Struct({
  type : EmbedImageTag,
  props: EmbedImageAttributes,
});

export const EmbedFooterElement = Struct({
  type : EmbedFooterTag,
  props: EmbedFooterAttributes,
});

export const EmbedFieldElement = Struct({
  type : EmbedFieldTag,
  props: EmbedFieldAttributes,
});

export const EmbedAuthorElement = Struct({
  type : EmbedAuthorTag,
  props: EmbedAuthorAttributes,
});

export const EmbedElement = Struct({
  type : EmbedTag,
  props: EmbedAttributes,
});
export const MessageElement = Struct({
  type : MessageTag,
  props: MessageAttributes,
});
export const TextInputElement = Struct({
  type : TextInputTag,
  props: TextInputAttributes,
});
export const DialogElement = Struct({
  type : DialogTag,
  props: DialogAttributes,
});
export const MarkdownElement = Struct({
  type : MarkdownTag,
  props: MarkdownAttributes,
});



export type AtMentionTag = Schema.Type<typeof AtMentionTag>;
export type AnchorTag = Schema.Type<typeof AnchorTag>;
export type AnchorMaskTag = Schema.Type<typeof AnchorMaskTag>;
export type MarkdownTag = Schema.Type<typeof MarkdownTag>;
export type TimestampTag = Schema.Type<typeof TimestampTag>;
export type EmojiTag = Schema.Type<typeof EmojiTag>;
export type ActionsTag = Schema.Type<typeof ActionsTag>;
export type PrimaryButtonTag = Schema.Type<typeof PrimaryButtonTag>;
export type SecondaryButtonTag = Schema.Type<typeof SecondaryButtonTag>;
export type SuccessButtonTag = Schema.Type<typeof SuccessButtonTag>;
export type DangerButtonTag = Schema.Type<typeof DangerButtonTag>;
export type LinkButtonTag = Schema.Type<typeof LinkButtonTag>;
export type PremiumButtonTag = Schema.Type<typeof PremiumButtonTag>;
export type OptionTag = Schema.Type<typeof OptionTag>;
export type StringSelectTag = Schema.Type<typeof StringSelectTag>;
export type DefaultValueTag = Schema.Type<typeof DefaultValueTag>;
export type UserSelectTag = Schema.Type<typeof UserSelectTag>;
export type RoleSelectTag = Schema.Type<typeof RoleSelectTag>;
export type ChannelSelectTag = Schema.Type<typeof ChannelSelectTag>;
export type MentionSelectTag = Schema.Type<typeof MentionSelectTag>;
export type EmbedVideoTag = Schema.Type<typeof EmbedVideoTag>;
export type EmbedThumbnailTag = Schema.Type<typeof EmbedThumbnailTag>;
export type EmbedImageTag = Schema.Type<typeof EmbedImageTag>;
export type EmbedFooterTag = Schema.Type<typeof EmbedFooterTag>;
export type EmbedFieldTag = Schema.Type<typeof EmbedFieldTag>;
export type EmbedAuthorTag = Schema.Type<typeof EmbedAuthorTag>;
export type EmbedTag = Schema.Type<typeof EmbedTag>;
export type MessageTag = Schema.Type<typeof MessageTag>;
export type TextInputTag = Schema.Type<typeof TextInputTag>;
export type DialogTag = Schema.Type<typeof DialogTag>;



export type AtMentionAttributes = Schema.Type<typeof AtMentionAttributes>;
export type AnchorAttributes = Schema.Type<typeof AnchorAttributes>;
export type AnchorMaskAttributes = Schema.Type<typeof AnchorMaskAttributes>;
export type MarkdownAttributes = Schema.Type<typeof MarkdownAttributes>;
export type TimestampAttributes = Schema.Type<typeof TimestampAttributes>;
export type EmojiAttributes = Schema.Type<typeof EmojiAttributes>;
export type ActionsAttributes = Schema.Type<typeof ActionsAttributes>;
export type PrimaryButtonAttributes = Schema.Type<typeof PrimaryButtonAttributes>;
export type SecondaryButtonAttributes = Schema.Type<typeof SecondaryButtonAttributes>;
export type SuccessButtonAttributes = Schema.Type<typeof SuccessButtonAttributes>;
export type DangerButtonAttributes = Schema.Type<typeof DangerButtonAttributes>;
export type LinkButtonAttributes = Schema.Type<typeof LinkButtonAttributes>;
export type PremiumButtonAttributes = Schema.Type<typeof PremiumButtonAttributes>;
export type OptionAttributes = Schema.Type<typeof OptionAttributes>;
export type StringSelectAttributes = Schema.Type<typeof StringSelectAttributes>;
export type DefaultValueAttributes = Schema.Type<typeof DefaultValueAttributes>;
export type UserSelectAttributes = Schema.Type<typeof UserSelectAttributes>;
export type RoleSelectAttributes = Schema.Type<typeof RoleSelectAttributes>;
export type ChannelSelectAttributes = Schema.Type<typeof ChannelSelectAttributes>;
export type MentionSelectAttributes = Schema.Type<typeof MentionSelectAttributes>;
export type EmbedVideoAttributes = Schema.Type<typeof EmbedVideoAttributes>;
export type EmbedThumbnailAttributes = Schema.Type<typeof EmbedThumbnailAttributes>;
export type EmbedImageAttributes = Schema.Type<typeof EmbedImageAttributes>;
export type EmbedFooterAttributes = Schema.Type<typeof EmbedFooterAttributes>;
export type EmbedFieldAttributes = Schema.Type<typeof EmbedFieldAttributes>;
export type EmbedAuthorAttributes = Schema.Type<typeof EmbedAuthorAttributes>;
export type EmbedAttributes = Schema.Type<typeof EmbedAttributes>;
export type MessageAttributes = Schema.Type<typeof MessageAttributes>;
export type TextInputAttributes = Schema.Type<typeof TextInputAttributes>;
export type DialogAttributes = Schema.Type<typeof DialogAttributes>;



export type AtMentionElement = Schema.Type<typeof AtMentionElement>;
export type AnchorElement = Schema.Type<typeof AnchorElement>;
export type AnchorMaskElement = Schema.Type<typeof AnchorMaskElement>;
export type TimestampElement = Schema.Type<typeof TimestampElement>;
export type MarkdownElement = Schema.Type<typeof MarkdownElement>;
export type EmojiElement = Schema.Type<typeof EmojiElement>;
export type MessageElement = Schema.Type<typeof MessageElement>;
export type ActionsElement = Schema.Type<typeof ActionsElement>;
export type PrimaryButtonElement = Schema.Type<typeof PrimaryButtonElement>;
export type SecondaryButtonElement = Schema.Type<typeof SecondaryButtonElement>;
export type SuccessButtonElement = Schema.Type<typeof SuccessButtonElement>;
export type DangerButtonElement = Schema.Type<typeof DangerButtonElement>;
export type LinkButtonElement = Schema.Type<typeof LinkButtonElement>;
export type PremiumButtonElement = Schema.Type<typeof PremiumButtonElement>;
export type StringSelectElement = Schema.Type<typeof StringSelectElement>;
export type OptionElement = Schema.Type<typeof OptionElement>;
export type UserSelectElement = Schema.Type<typeof UserSelectElement>;
export type RoleSelectElement = Schema.Type<typeof RoleSelectElement>;
export type ChannelSelectElement = Schema.Type<typeof ChannelSelectElement>;
export type MentionSelectElement = Schema.Type<typeof MentionSelectElement>;
export type DefaultValueElement = Schema.Type<typeof DefaultValueElement>;
export type EmbedElement = Schema.Type<typeof EmbedElement>;
export type EmbedImageElement = Schema.Type<typeof EmbedImageElement>;
export type EmbedFooterElement = Schema.Type<typeof EmbedFooterElement>;
export type EmbedFieldElement = Schema.Type<typeof EmbedFieldElement>;
export type EmbedAuthorElement = Schema.Type<typeof EmbedAuthorElement>;
export type EmbedVideoElement = Schema.Type<typeof EmbedVideoElement>;
export type EmbedThumbnailElement = Schema.Type<typeof EmbedThumbnailElement>;
export type DialogElement = Schema.Type<typeof DialogElement>;
export type TextInputElement = Schema.Type<typeof TextInputElement>;



export type ElementTuples =
  | AtMentionElement
  | AnchorElement
  | AnchorMaskElement
  | TimestampElement
  | MarkdownElement
  | EmojiElement
  | MessageElement
  | ActionsElement
  | PrimaryButtonElement
  | SecondaryButtonElement
  | SuccessButtonElement
  | DangerButtonElement
  | LinkButtonElement
  | PremiumButtonElement
  | StringSelectElement
  | OptionElement
  | UserSelectElement
  | RoleSelectElement
  | ChannelSelectElement
  | MentionSelectElement
  | DefaultValueElement
  | EmbedElement
  | EmbedImageElement
  | EmbedFooterElement
  | EmbedFieldElement
  | EmbedAuthorElement
  | EmbedVideoElement
  | EmbedThumbnailElement
  | DialogElement
  | TextInputElement;

export type Elements = {
  [K in ElementTuples as K['type']]: K['props'];
};
