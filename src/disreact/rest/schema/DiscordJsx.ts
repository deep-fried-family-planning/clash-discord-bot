import * as Rest from '#disreact/adaptor/codec/rest-element.ts';
import * as Norm from '#disreact/adaptor/intrinsic/norm.ts';
import {ButtonIn, ButtonOut, ButtonRowIn, ButtonRowOut, Int32IdIn, Int32IdOut, ModalRowOut, SelectRowIn, SelectRowOut, UnfurledMediaItemIn, UnfurledMediaItemOut} from '#disreact/rest/schema/DiscordIO.ts';
import {Discord} from 'dfx';
import * as BigInt from 'effect/BigInt';
import * as S from 'effect/Schema';
import type * as Types from 'effect/Types';
import * as DiscordIO from '#disreact/rest/schema/DiscordIO.ts';

/**
 * Common
 */
export const Emoji = 'emoji';
export const EmojiAttributes = S.Struct({
  name    : S.optional(S.String),
  id      : S.optional(S.String),
  animated: S.optional(S.Boolean),
});
export const EmojiChildren = S.Struct({});
export const EmojiJSON = S.TaggedStruct(Emoji, DiscordIO.EmojiOut.fields);
export const EmojiEncode: Encoder<typeof Emoji> = (self) => {
  return {
    _tag    : Emoji,
    name    : self.props.name,
    id      : self.props.id,
    animated: self.props.animated,
  };
};

/**
 * Discord Flavored Markdown
 */
export const DFMDString = S.String;

export const DFMDAnchor = 'a';
export const DFMDAnchorAttributes = S.Struct({
  href : S.String,
  embed: S.optional(S.Boolean),
});
export const DFMDAnchorChildren = S.Never;
export const DFMDAnchorJSON = DFMDString;
export const AnchorEncode: Encoder<typeof DFMDAnchor> = (self) => {
  if (self.props.embed) {
    return `${self.props.href}`;
  }
  return `<${self.props.href}>`;
};

export const DFMDAtMention = 'at';
export const DFMDAtMentionAttributes = S.Union(
  S.Struct({here: S.Boolean}),
  S.Struct({everyone: S.Boolean}),
  S.Struct({user: S.Union(S.String, S.Int)}),
  S.Struct({role: S.Union(S.String, S.Int)}),
  S.Struct({channel: S.Union(S.String, S.Int)}),
);
export const DFMDAtMentionChildren = S.Never;
export const DFMDAtMentionJSON = DFMDString;
export const AtMentionEncode: Encoder<typeof DFMDAtMention> = (self) => {
  if ('here' in self.props) return '@here';
  if ('everyone' in self.props) return '@everyone';
  if ('user' in self.props) return `<@${self.props.user}>`;
  if ('role' in self.props) return `<@&${self.props.role}>`;
  if ('channel' in self.props) return `<#${self.props.channel}>`;
  return '';
};

export const DFMDBold = 'b';
export const DFMDBoldAttributes = S.Struct({});
export const DFMDBoldChildren = S.Struct({});
export const DFMDBoldJSON = DFMDString;
export const BoldEncode: Encoder<typeof DFMDBold> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  return `**${self.acc[Norm.PRIMITIVE][0]}**`;
};

export const DFMDBlockquote = 'blockquote';
export const DFMDBlockquoteAttributes = S.Struct({});
export const DFMDBlockquoteChildren = S.Struct({});
export const DFMDBlockquoteJSON = DFMDString;
export const BlockquoteEncode: Encoder<typeof DFMDBlockquote> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  return `> ${self.acc[Norm.PRIMITIVE][0]}`;
};

export const DFMDBreak = 'br';
export const DFMDBreakAttributes = S.Struct({});
export const DFMDBreakChildren = S.Struct({});
export const DFMDBreakJSON = DFMDString;
export const BreakEncode: Encoder<typeof DFMDBreak> = (self) => {
  return '\n';
};

export const DFMDCode = 'code';
export const DFMDCodeAttributes = S.Struct({});
export const DFMDCodeChildren = S.Struct({});
export const DFMDCodeJSON = DFMDString;
export const CodeEncode: Encoder<typeof DFMDCode> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  return `\`${self.acc[Norm.PRIMITIVE][0]}\``;
};

export const DFMDDetails = 'details';
export const DFMDDetailsAttributes = S.Struct({});
export const DFMDDetailsChildren = S.Struct({});
export const DFMDDetailsJSON = DFMDString;
export const DetailsEncode: Encoder<typeof DFMDDetails> = (self) => {
  throw new Error('Not implemented');
};

export const DFMDH1 = 'h1';
export const DFMDH1Attributes = S.Struct({});
export const DFMDH1Children = S.Struct({});
export const DFMDH1JSON = DFMDString;
export const H1Encode: Encoder<typeof DFMDH1> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  return `# ${self.acc[Norm.PRIMITIVE][0]}`;
};

export const DFMDH2 = 'h2';
export const DFMDH2Attributes = S.Struct({});
export const DFMDH2Children = S.Struct({});
export const DFMDH2JSON = DFMDString;
export const H2Encode: Encoder<typeof DFMDH2> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  return `## ${self.acc[Norm.PRIMITIVE][0]}`;
};

export const DFMDH3 = 'h3';
export const DFMDH3Attributes = S.Struct({});
export const DFMDH3Children = S.Struct({});
export const DFMDH3JSON = DFMDString;
export const H3Encode: Encoder<typeof DFMDH3> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  return `### ${self.acc[Norm.PRIMITIVE][0]}`;
};

export const DFMDItalic = 'i';
export const DFMDItalicAttributes = S.Struct({});
export const DFMDItalicChildren = S.Struct({});
export const DFMDItalicJSON = DFMDString;
export const ItalicEncode: Encoder<typeof DFMDItalic> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  return `*${self.acc[Norm.PRIMITIVE][0]}*`;
};

export const DFMDListItem = 'li';
export const DFMDListItemAttributes = S.Struct({});
export const DFMDListItemChildren = S.Struct({});
export const DFMDListItemJSON = DFMDString;
export const ListItemEncode: Encoder<typeof DFMDListItem> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  return `- ${self.acc[Norm.PRIMITIVE][0]}`;
};

export const DFMDMaskAnchor = 'mask';
export const DFMDMaskAnchorAttributes = S.Struct({
  href : S.String,
  embed: S.optional(S.Boolean),
});
export const DFMDMaskAnchorChildren = S.Never;
export const DFMDMaskAnchorJSON = DFMDString;
export const MaskAnchorEncode: Encoder<typeof DFMDMaskAnchor> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  if (self.props.embed) {
    return `[${self.acc[Norm.PRIMITIVE][0]}](${self.props.href})`;
  }
  return `[${self.acc[Norm.PRIMITIVE][0]}](<${self.props.href}>)`;
};

export const DFMDOrderedList = 'ol';
export const DFMDOrderedListAttributes = S.Struct({});
export const DFMDOrderedListChildren = S.Struct({});
export const DFMDOrderedListJSON = DFMDString;
export const OrderedListEncode: Encoder<typeof DFMDOrderedList> = (self) => {
  throw new Error('Not implemented');
};

export const DFMDParagraph = 'p';
export const DFMDParagraphAttributes = S.Struct({});
export const DFMDParagraphChildren = S.Struct({});
export const DFMDParagraphJSON = DFMDString;
export const ParagraphEncode: Encoder<typeof DFMDParagraph> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  return `\n${self.acc[Norm.PRIMITIVE][0]}`;
};

export const DFMDPre = 'pre';
export const DFMDPreAttributes = S.Struct({
  lang: S.optional(S.String),
});
export const DFMDPreChildren = S.Struct({});
export const DFMDPreJSON = DFMDString;
export const PreEncode: Encoder<typeof DFMDPre> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  if (!self.props.lang) {
    return `\`\`\`\n${self.acc[Norm.PRIMITIVE][0]}\n\`\`\``;
  }
  return `\`\`\`${self.props.lang}\n${self.acc[Norm.PRIMITIVE][0]}\n\`\`\``;
};

export const DFMDStrikethrough = 's';
export const DFMDStrikethroughAttributes = S.Struct({});
export const DFMDStrikethroughChildren = S.Struct({});
export const DFMDStrikethroughJSON = DFMDString;
export const StrikethroughEncode: Encoder<typeof DFMDStrikethrough> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  return `~~${self.acc[Norm.PRIMITIVE][0]}~~`;
};

export const DFMDSmall = 'small';
export const DFMDSmallAttributes = S.Struct({});
export const DFMDSmallChildren = S.Struct({});
export const DFMDSmallJSON = DFMDString;
export const SmallEncode: Encoder<typeof DFMDSmall> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  return `-# ${self.acc[Norm.PRIMITIVE][0]}`;
};

export const DFMDTime = 'time';
export const DFMDTimeAttributes = S.Union(
  S.Struct({d: S.Union(S.String, S.Int, S.BigInt)}),
  S.Struct({D: S.Union(S.String, S.Int, S.BigInt)}),
  S.Struct({t: S.Union(S.String, S.Int, S.BigInt)}),
  S.Struct({T: S.Union(S.String, S.Int, S.BigInt)}),
  S.Struct({f: S.Union(S.String, S.Int, S.BigInt)}),
  S.Struct({F: S.Union(S.String, S.Int, S.BigInt)}),
  S.Struct({R: S.Union(S.String, S.Int, S.BigInt)}),
);
export const DFMDTimeChildren = S.Struct({});
export const DFMDTimeJSON = DFMDString;
export const TimeEncode: Encoder<typeof DFMDTime> = (self) => {
  const {d, D, t, T, f, F, R} = self.props as Types.UnionToIntersection<Attributes[typeof DFMDTime]>;
  const input = d ?? D ?? t ?? T ?? f ?? F ?? R;
  const maybeNow = input === 'now' ? Date.now() : input;
  const time = typeof maybeNow === 'bigint' ? Number(BigInt.unsafeDivide(maybeNow, 1000n)) : input;
  if (d) return `<t:${time}:d>`;
  if (D) return `<t:${time}:D>`;
  if (t) return `<t:${time}:t>`;
  if (T) return `<t:${time}:T>`;
  if (f) return `<t:${time}:f>`;
  if (F) return `<t:${time}:F>`;
  return `<t:${time}:R>`;
};

export const DFMDUnderline = 'u';
export const DFMDUnderlineAttributes = S.Struct({});
export const DFMDUnderlineChildren = S.Struct({});
export const DFMDUnderlineJSON = DFMDString;
export const UnderlineEncode: Encoder<typeof DFMDUnderline> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  return `__${self.acc[Norm.PRIMITIVE][0]}__`;
};

export const DFMDUnorderedList = 'ul';
export const DFMDUnorderedListAttributes = S.Struct({});
export const DFMDUnorderedListChildren = S.Struct({});
export const DFMDUnorderedListJSON = DFMDString;
export const UnorderedListEncode: Encoder<typeof DFMDUnorderedList> = (self) => {
  throw new Error('Not implemented');
};

/**
 * Buttons
 */
export const Primary = 'primary';
export const PrimaryAttributes = S.Struct({
  custom_id: S.optional(S.String),
  label    : S.optional(S.String),
  emoji    : S.optional(EmojiAttributes),
  disabled : S.optional(S.Boolean),
  onclick  : Rest.Handler(S.Any),
});
export const PrimaryChildren = S.Struct({});
export const PrimaryJSON = S.TaggedStruct(Primary, DiscordIO.PrimaryButtonOut.fields);
export const PrimaryEncode: Encoder<typeof Primary> = (self) => {
  return {
    _tag     : Primary,
    type     : Discord.MessageComponentTypes.BUTTON,
    style    : Discord.ButtonStyleTypes.PRIMARY,
    custom_id: self.props.custom_id ?? self.step,
    label    : self.props.label ?? self.acc[Norm.PRIMITIVE]?.[0],
    emoji    : self.props.emoji ?? self.acc[Emoji]?.[0],
    disabled : self.props.disabled,
  };
};

export const Secondary = 'secondary';
export const SecondaryAttributes = S.Struct({
  custom_id: S.optional(S.String),
  label    : S.optional(S.String),
  emoji    : S.optional(EmojiAttributes),
  disabled : S.optional(S.Boolean),
  onclick  : Rest.Handler(S.Any),
});
export const SecondaryChildren = S.Struct({});
export const SecondaryJSON = S.TaggedStruct(Secondary, DiscordIO.SecondaryButtonOut.fields);
export const SecondaryEncode: Encoder<typeof Secondary> = (self) => {
  return {
    _tag     : Secondary,
    type     : Discord.MessageComponentTypes.BUTTON,
    style    : Discord.ButtonStyleTypes.SECONDARY,
    custom_id: self.props.custom_id ?? self.step,
    label    : self.props.label ?? self.acc[Norm.PRIMITIVE]?.[0],
    emoji    : self.props.emoji ?? self.acc[Emoji]?.[0],
    disabled : self.props.disabled,
  };
};

export const Success = 'success';
export const SuccessAttributes = S.Struct({
  custom_id: S.optional(S.String),
  label    : S.optional(S.String),
  emoji    : S.optional(EmojiAttributes),
  disabled : S.optional(S.Boolean),
  onclick  : Rest.Handler(S.Any),
});
export const SuccessChildren = S.Struct({});
export const SuccessJSON = S.TaggedStruct(Success, DiscordIO.SuccessButtonOut.fields);
export const SuccessEncode: Encoder<typeof Success> = (self) => {
  return {
    _tag     : Success,
    type     : Discord.MessageComponentTypes.BUTTON,
    style    : Discord.ButtonStyleTypes.SUCCESS,
    custom_id: self.props.custom_id ?? self.step,
    label    : self.props.label ?? self.acc[Norm.PRIMITIVE]?.[0],
    emoji    : self.props.emoji ?? self.acc[Emoji]?.[0],
    disabled : self.props.disabled,
  };
};

export const Danger = 'danger';
export const DangerAttributes = S.Struct({
  custom_id: S.optional(S.String),
  label    : S.optional(S.String),
  emoji    : S.optional(EmojiAttributes),
  disabled : S.optional(S.Boolean),
  onclick  : Rest.Handler(S.Any),
});
export const DangerChildren = S.Struct({});
export const DangerJSON = S.TaggedStruct(Danger, DiscordIO.DangerButtonOut.fields);
export const DangerEncode: Encoder<typeof Danger> = (self) => {
  return {
    _tag     : Danger,
    type     : Discord.MessageComponentTypes.BUTTON,
    style    : Discord.ButtonStyleTypes.DANGER,
    custom_id: self.props.custom_id ?? self.step,
    label    : self.props.label ?? self.acc[Norm.PRIMITIVE]?.[0],
    emoji    : self.props.emoji ?? self.acc[Emoji]?.[0],
    disabled : self.props.disabled,
  };
};

export const Link = 'link';
export const LinkAttributes = S.Struct({
  url     : S.String,
  label   : S.optional(S.String),
  emoji   : S.optional(EmojiAttributes),
  disabled: S.optional(S.Boolean),
});
export const LinkChildren = S.Struct({});
export const LinkJSON = S.TaggedStruct(Link, DiscordIO.LinkButtonOut.fields);
export const LinkEncode: Encoder<typeof Link> = (self) => {
  return {
    _tag    : Link,
    type    : Discord.MessageComponentTypes.BUTTON,
    style   : Discord.ButtonStyleTypes.LINK,
    url     : self.props.url,
    label   : self.props.label ?? self.acc[Norm.PRIMITIVE]?.[0],
    emoji   : self.props.emoji ?? self.acc[Emoji]?.[0],
    disabled: self.props.disabled,
  };
};

export const Premium = 'premium';
export const PremiumAttributes = S.Struct({
  sku_id  : S.String,
  disabled: S.optional(S.Boolean),
});
export const PremiumChildren = S.Struct({});
export const PremiumJSON = S.TaggedStruct(Premium, DiscordIO.PremiumButtonOut.fields);
export const PremiumEncode: Encoder<typeof Premium> = (self) => {
  return {
    _tag    : Premium,
    type    : Discord.MessageComponentTypes.BUTTON,
    style   : Discord.ButtonStyleTypes.PREMIUM,
    sku_id  : self.props.sku_id,
    disabled: self.props.disabled,
  };
};

export const Button = 'button';
export const ButtonAttributes = S.Struct({
  custom_id: S.optional(S.String),
  style    : S.optional(S.Literal(1, 2, 3, 4, 5, 6)),
  label    : S.optional(S.String),
  emoji    : S.optional(EmojiAttributes),
  disabled : S.optional(S.Boolean),
  url      : S.optional(S.String),
  onclick  : S.optional(Rest.Handler(S.Any)),
});
export const ButtonChildren = S.Struct({});
export const ButtonJSON = S.Any; // todo fixme
export const ButtonEncode: Encoder<typeof Button> = (self) => {
  return {
    type     : Discord.MessageComponentTypes.BUTTON,
    style    : self.props.style ?? Discord.ButtonStyleTypes.PRIMARY,
    custom_id: self.props.custom_id ?? self.step,
    label    : self.props.label ?? self.acc[Norm.PRIMITIVE]?.[0],
    emoji    : self.props.emoji ?? self.acc[Emoji]?.[0],
    disabled : self.props.disabled,
  };
};

export const Actions = 'actions';
export const ActionsAttributes = S.Struct({});
export const ActionsChildren = S.Struct({});
export const ActionsJSON = S.TaggedStruct(Actions, DiscordIO.ButtonRowOut.fields);
export const ActionsEncode: Encoder<typeof Actions> = (self) => {
  return {
    _tag      : Actions,
    type      : Discord.MessageComponentTypes.ACTION_ROW,
    components: self.acc[Norm.COMPONENTS]!,
  };
};

/**
 * Select Components
 */

export const Option = 'option';
export const OptionAttributes = S.Struct({
  label      : S.String,
  value      : S.String,
  description: S.optional(S.String),
  emoji      : S.optional(EmojiAttributes),
  default    : S.optional(S.Boolean),
});
export const OptionChildren = S.Struct({});
export const OptionJSON = S.Any;
export const OptionEncode: Encoder<typeof Option> = (self) => {
  return {
    value      : self.props.value,
    label      : self.props.label,
    description: self.props.description ?? self.acc.primitive?.[0],
    emoji      : self.props.emoji ?? self.acc[Emoji]?.[0],
    default    : self.props.default,
  };
};

export const Select = 'select';
export const SelectAttributes = S.Struct({
  custom_id  : S.optional(S.String),
  placeholder: S.optional(S.String),
  max_values : S.optional(S.Number),
  min_values : S.optional(S.Number),
  options    : S.optional(S.Array(OptionAttributes)),
  disabled   : S.optional(S.Boolean),
  onselect   : Rest.Handler(S.Any),
});
export const SelectChildren = S.Struct({});
export const SelectJSON = S.Any; // todo fixme
export const SelectEncode: Encoder<typeof Select> = (self) => {
  return {
    type      : Discord.MessageComponentTypes.ACTION_ROW,
    components: [{
      type       : Discord.MessageComponentTypes.STRING_SELECT,
      custom_id  : self.props.custom_id ?? self.step,
      placeholder: self.props.placeholder ?? self.acc.primitive?.[0],
      options    : self.props.options ?? self.acc[Option],
      min_values : self.props.min_values,
      max_values : self.props.max_values,
      disabled   : self.props.disabled,
    }],
  };
};

export const Default = 'default';
export const DefaultAttributes = S.Union(
  S.Struct({role: S.String}),
  S.Struct({user: S.String}),
  S.Struct({channel: S.String}),
);
export const DefaultChildren = S.Struct({});
export const DefaultJSON = S.Any; // todo fixme
export const DefaultEncode: Encoder<typeof Default> = (self) => {
  if ('role' in self.props) {
    return {
      type: 'role',
      id  : self.props.role,
    };
  }
  if ('user' in self.props) {
    return {
      type: 'user',
      id  : self.props.user,
    };
  }
  return {
    type: 'channel',
    id  : self.props.channel,
  };
};

export const Channels = 'channels';
export const ChannelsAttributes = S.Struct({
  custom_id    : S.optional(S.String),
  placeholder  : S.optional(S.String),
  min_values   : S.optional(S.Number),
  max_values   : S.optional(S.Number),
  channel_types: S.optional(S.Array(S.Int)),
  disabled     : S.optional(S.Boolean),
  onselect     : Rest.Handler(S.Any),
});
export const ChannelsChildren = S.Struct({});
export const ChannelsJSON = S.Any; // todo fixme
export const ChannelsEncode: Encoder<typeof Channels> = (self) => {
  return {
    type      : Discord.MessageComponentTypes.ACTION_ROW,
    components: [{
      type          : Discord.MessageComponentTypes.CHANNEL_SELECT,
      custom_id     : self.props.custom_id ?? self.step,
      placeholder   : self.props.placeholder ?? self.acc.primitive?.[0],
      min_values    : self.props.min_values,
      max_values    : self.props.max_values,
      channel_types : self.props.channel_types,
      default_values: self.acc[Default],
      disabled      : self.props.disabled,
    }],
  };
};

export const Mentions = 'mentions';
export const MentionsAttributes = S.Struct({
  custom_id  : S.optional(S.String),
  placeholder: S.optional(S.String),
  min_values : S.optional(S.Number),
  max_values : S.optional(S.Number),
  disabled   : S.optional(S.Boolean),
  onselect   : Rest.Handler(S.Any),
});
export const MentionsChildren = S.Struct({});
export const MentionsJSON = S.Any; // todo fixme
export const MentionsEncode: Encoder<typeof Mentions> = (self) => {
  return {
    type      : Discord.MessageComponentTypes.ACTION_ROW,
    components: [{
      type          : Discord.MessageComponentTypes.MENTIONABLE_SELECT,
      custom_id     : self.props.custom_id ?? self.step,
      placeholder   : self.props.placeholder ?? self.acc.primitive?.[0],
      min_values    : self.props.min_values,
      max_values    : self.props.max_values,
      default_values: self.acc[Default],
    }],
  };
};

export const Roles = 'roles';
export const RolesAttributes = S.Struct({
  custom_id  : S.optional(S.String),
  placeholder: S.optional(S.String),
  min_values : S.optional(S.Number),
  max_values : S.optional(S.Number),
  disabled   : S.optional(S.Boolean),
  onselect   : Rest.Handler(S.Any),
});
export const RolesChildren = S.Struct({});
export const RolesJSON = S.Any; // todo fixme
export const RolesEncode: Encoder<typeof Roles> = (self) => {
  return {
    type      : Discord.MessageComponentTypes.ACTION_ROW,
    components: [{
      type          : Discord.MessageComponentTypes.ROLE_SELECT,
      custom_id     : self.props.custom_id ?? self.step,
      placeholder   : self.props.placeholder ?? self.acc.primitive?.[0],
      min_values    : self.props.min_values,
      max_values    : self.props.max_values,
      default_values: self.acc[Default],
    }],
  };
};

export const Users = 'users';
export const UsersAttributes = S.Struct({
  custom_id  : S.optional(S.String),
  placeholder: S.optional(S.String),
  min_values : S.optional(S.Number),
  max_values : S.optional(S.Number),
  disabled   : S.optional(S.Boolean),
  onselect   : Rest.Handler(S.Any),
});
export const UsersChildren = S.Struct({});
export const UsersJSON = S.Any; // todo fixme
export const UsersEncode: Encoder<typeof Users> = (self) => {
  return {
    type      : Discord.MessageComponentTypes.ACTION_ROW,
    components: [{
      type          : Discord.MessageComponentTypes.USER_SELECT,
      custom_id     : self.props.custom_id ?? self.step,
      placeholder   : self.props.placeholder ?? self.acc[Norm.PRIMITIVE]?.[0],
      min_values    : self.props.min_values,
      max_values    : self.props.max_values,
      default_values: self.acc[Default],
    }],
  };
};

/**
 * Components V2
 */
export const TextDisplay = 'textdisplay';
export const TextDisplayAttributes = S.Struct({});
export const TextDisplayJSON = DiscordIO.TextDisplayOut;
export const TextDisplayEncode: Encoder<typeof TextDisplay> = (self) => {
  return {
    type   : Discord.MessageComponentTypes.TEXT_DISPLAY,
    content: '',
  };
};

export const Thumbnail = 'thumbnail';
export const ThumbnailAttributes = S.Struct({
  url        : S.String,
  description: S.optional(S.String),
  spoiler    : S.optional(S.Boolean),
  });
export const ThumbnailJSON = DiscordIO.ThumbnailOut;
export const ThumbnailEncode: Encoder<typeof Thumbnail> = (self) => {
  return {
    type       : Discord.MessageComponentTypes.THUMBNAIL,
    media      : {url: self.props.url},
    description: self.props.description ?? self.acc[Norm.PRIMITIVE]?.join(''),
    spoiler    : self.props.spoiler,
  };
};

export const Section = 'section';
export const SectionAttributes = S.Struct({});
export const SectionJSON = DiscordIO.SectionOut;
export const SectionEncode: Encoder<typeof Section> = (self) => {
  return {
    type      : Discord.MessageComponentTypes.SECTION,
    components: [],
    accessory : undefined as any, // todo
  };
};

export const MediaGallery = 'gallery';
export const MediaGalleryAttributes = S.Struct({});
export const MediaGalleryJSON = DiscordIO.MediaGalleryOut;
export const MediaGalleryEncode: Encoder<typeof MediaGallery> = (self) => {
  return {
    type : Discord.MessageComponentTypes.MEDIA_GALLERY,
    media: [],
  };
};

export const File = 'file';
export const FileAttributes = S.Struct({});
export const FileJSON = DiscordIO.FileOut;
export const FileEncode: Encoder<typeof File> = (self) => {
  return {
    type: Discord.MessageComponentTypes.FILE,
    file: {url: ''},
  };
};

export const Separator = 'separator';
export const SeparatorAttributes = S.Struct({});
export const SeparatorJSON = DiscordIO.SeparatorOut;
export const SeparatorEncode: Encoder<typeof Separator> = (self) => {
  return {
    type: Discord.MessageComponentTypes.SEPARATOR,
  };
};

export const Container = 'container';
export const ContainerAttributes = S.Struct({});
export const ContainerJSON = DiscordIO.ContainerOut;
export const ContainerEncode: Encoder<typeof Container> = (self) => {
  return {
    type      : Discord.MessageComponentTypes.CONTAINER,
    components: [],
  };
};

/**
 * Embed
 */
export const Author = 'author';
export const AuthorAttributes = S.Struct({
  name: S.String,
  url : S.optional(S.String),
});
export const AuthorChildren = S.Struct({});
export const AuthorJSON = S.TaggedStruct(Author, DiscordIO.EmbedAuthorOut.fields);
export const AuthorEncode: Encoder<typeof Author> = (self) => {
  return {
    _tag: Author,
    name: self.props.name ?? self.acc[Norm.PRIMITIVE]?.join(''),
    url : self.props.url,
  };
};

export const Image = 'img';
export const ImageAttributes = S.Struct({
  url: S.String,
});
export const ImageChildren = S.Struct({});
export const ImageJSON = S.TaggedStruct(Image, DiscordIO.EmbedImageOut.fields);
export const ImageEncode: Encoder<typeof Image> = (self) => {
  return {
    _tag: Image,
    url : self.props.url,
  };
};

export const Footer = 'footer';
export const FooterAttributes = S.Struct({
  text: S.String,
});
export const FooterChildren = S.Struct({});
export const FooterJSON = S.TaggedStruct(Footer, DiscordIO.EmbedFooterOut.fields);
export const FooterEncode: Encoder<typeof Footer> = (self) => {
  return {
    _tag: Footer,
    text: self.props.text ?? self.acc[Norm.PRIMITIVE]?.join(''),
  };
};

export const Field = 'field';
export const FieldAttributes = S.Struct({
  name  : S.String,
  value : S.String,
  inline: S.optional(S.Boolean),
});
export const FieldChildren = S.Struct({});
export const FieldJSON = S.TaggedStruct(Field, DiscordIO.EmbedFieldOut.fields);
export const FieldEncode: Encoder<typeof Field> = (self) => {
  return {
    _tag  : Field,
    name  : self.props.name,
    value : self.props.value ?? self.acc[Norm.PRIMITIVE]?.join(''),
    inline: self.props.inline,
  };
};

export const Embed = 'embed';
export const EmbedAttributes = S.Struct({
  author     : S.optional(AuthorAttributes),
  title      : S.optional(S.String),
  description: S.optional(S.String),
  color      : S.optional(S.Int),
  url        : S.optional(S.String),
  image      : S.optional(ImageAttributes),
  fields     : S.optional(S.Array(FieldAttributes)),
  footer     : S.optional(FooterAttributes),
});
export const EmbedChildren = S.Union();
export const EmbedJSON = S.Struct({
  author     : S.optional(AuthorAttributes),
  title      : S.optional(S.String),
  description: S.optional(S.String),
  color      : S.optional(S.Int),
  url        : S.optional(S.String),
  image      : S.optional(ImageAttributes),
  fields     : S.optional(S.Array(FieldAttributes)),
  footer     : S.optional(FooterAttributes),
});
export const EmbedEncode: Encoder<typeof Embed> = (self) => {
  return {
    author     : self.props.author ?? self.acc.author?.[0],
    title      : self.props.title,
    description: self.props.description ?? self.acc[Norm.PRIMITIVE]?.join(''),
    color      : self.props.color,
    url        : self.props.url,
    image      : self.props.image ?? self.acc[Image]?.[0],
    fields     : self.props.fields ?? self.acc[Field],
    footer     : self.props.footer ?? self.acc.footer?.[0],
  };
};

/**
 * Containers
 */

export const Message = 'message';
export const MessageAttributes = S.Struct({
  display: S.optional(S.Literal('public', 'ephemeral')),
  content: S.optional(S.String),
  flags  : S.optional(S.Number),
});
export const MessageChildren = S.Struct({});
export const MessageJSON = S.TaggedStruct(Message, DiscordIO.MessageV1Out.fields);
export const MessageEncode: Encoder<typeof Message> = (self) => {
  return {
    _tag      : Message,
    content   : self.props.content ?? self.acc[Norm.PRIMITIVE]?.[0] ?? undefined,
    embeds    : self.acc[Embed],
    components: self.acc[Norm.COMPONENTS],
    flags     : self.props.flags ?? self.props.display === 'ephemeral' ? 64 : undefined,
  };
};

export const Ephemeral = 'ephemeral';
export const EphemeralAttributes = S.Struct({
  content: S.optional(S.String),
  flags  : S.optional(S.Number),
});
export const EphemeralChildren = S.Struct({});
export const EphemeralJSON = S.TaggedStruct(Ephemeral, DiscordIO.EphemeralV1Out.fields);
export const EphemeralEncode: Encoder<typeof Ephemeral> = (self) => {
  return {
    _tag      : Ephemeral,
    content   : self.props.content ?? self.acc[Norm.PRIMITIVE]?.[0] ?? undefined,
    embeds    : self.acc[Embed],
    components: self.acc[Norm.COMPONENTS],
    flags     : 64,
  };
};

export const TextInput = 'textarea';
export const TextInputAttributes = S.Struct({
  custom_id  : S.optional(S.String),
  label      : S.optional(S.String),
  style      : S.optional(S.Literal(1, 2)),
  min_length : S.optional(S.Number),
  max_length : S.optional(S.Number),
  required   : S.optional(S.Boolean),
  value      : S.optional(S.String),
  placeholder: S.optional(S.String),
});
export const TextInputChildren = S.Struct({});
export const TextInputJSON = S.TaggedStruct(TextInput, DiscordIO.ModalRowOut.fields);
export const TextInputEncode: Encoder<typeof TextInput> = (self) => {
  return {
    _tag      : TextInput,
    type      : Discord.MessageComponentTypes.ACTION_ROW,
    components: [{
      type       : Discord.MessageComponentTypes.TEXT_INPUT,
      custom_id  : self.props.custom_id ?? self.step,
      style      : self.props.style ?? Discord.TextInputStyleTypes.SHORT,
      label      : self.props.label,
      min_length : self.props.min_length,
      max_length : self.props.max_length,
      required   : self.props.required,
      value      : self.props.value ?? self.acc[Norm.PRIMITIVE]?.[0],
      placeholder: self.props.placeholder,
    }],
  };
};

export const Modal = 'dialog';
export const ModalAttributes = S.Struct({
  custom_id: S.optional(S.String),
  title    : S.String,
  onsubmit : Rest.Handler(S.Any),
});
export const ModalChildren = S.Struct({});
export const ModalJSON = S.TaggedStruct(Modal, DiscordIO.ModalOut.fields);
export const ModalEncode: Encoder<typeof Modal> = (self) => {
  return {
    _tag      : Modal,
    custom_id : self.props.custom_id ?? self.step,
    title     : self.props.title,
    components: self.acc[Norm.COMPONENTS]!,
  };
};

export const Encoders: { [T in keyof Attributes]: Encoder<T>; } = {
  [Emoji]            : EmojiEncode,
  [DFMDAnchor]       : AnchorEncode,
  [DFMDAtMention]    : AtMentionEncode,
  [DFMDBold]         : BoldEncode,
  [DFMDBlockquote]   : BlockquoteEncode,
  [DFMDBreak]        : BreakEncode,
  [DFMDCode]         : CodeEncode,
  [DFMDDetails]      : DetailsEncode,
  [DFMDParagraph]    : ParagraphEncode,
  [DFMDH1]           : H1Encode,
  [DFMDH2]           : H2Encode,
  [DFMDH3]           : H3Encode,
  [DFMDItalic]       : ItalicEncode,
  [DFMDListItem]     : ListItemEncode,
  [DFMDMaskAnchor]   : MaskAnchorEncode,
  [DFMDOrderedList]  : OrderedListEncode,
  [DFMDPre]          : PreEncode,
  [DFMDStrikethrough]: StrikethroughEncode,
  [DFMDSmall]        : SmallEncode,
  [DFMDTime]         : TimeEncode,
  [DFMDUnderline]    : UnderlineEncode,
  [DFMDUnorderedList]: UnorderedListEncode,
  [Primary]          : PrimaryEncode,
  [Secondary]        : SecondaryEncode,
  [Success]          : SuccessEncode,
  [Danger]           : DangerEncode,
  [Link]             : LinkEncode,
  [Premium]          : PremiumEncode,
  [Button]           : ButtonEncode,
  [Actions]          : ActionsEncode,
  [Option]           : OptionEncode,
  [Select]           : SelectEncode,
  [Default]          : DefaultEncode,
  [Channels]         : ChannelsEncode,
  [Mentions]         : MentionsEncode,
  [Roles]            : RolesEncode,
  [Users]            : UsersEncode,
  [TextDisplay]      : TextDisplayEncode,
  [Thumbnail]        : ThumbnailEncode,
  [Section]          : SectionEncode,
  [MediaGallery]     : MediaGalleryEncode,
  [File]             : FileEncode,
  [Separator]        : SeparatorEncode,
  [Container]        : ContainerEncode,
  [Author]           : AuthorEncode,
  [Embed]            : EmbedEncode,
  [Image]            : ImageEncode,
  [Field]            : FieldEncode,
  [Footer]           : FooterEncode,
  [Message]          : MessageEncode,
  [Ephemeral]        : EphemeralEncode,
  [Modal]            : ModalEncode,
  [TextInput]        : TextInputEncode,
};

export interface Attributes {
  [Emoji]            : typeof EmojiAttributes.Type;
  [DFMDAnchor]       : typeof DFMDAnchorAttributes.Type;
  [DFMDAtMention]    : typeof DFMDAtMentionAttributes.Type;
  [DFMDBold]         : typeof DFMDBoldAttributes.Type;
  [DFMDBlockquote]   : typeof DFMDBlockquoteAttributes.Type;
  [DFMDBreak]        : typeof DFMDBreakAttributes.Type;
  [DFMDCode]         : typeof DFMDCodeAttributes.Type;
  [DFMDDetails]      : typeof DFMDDetailsAttributes.Type;
  [DFMDParagraph]    : typeof DFMDParagraphAttributes.Type;
  [DFMDH1]           : typeof DFMDH1Attributes.Type;
  [DFMDH2]           : typeof DFMDH2Attributes.Type;
  [DFMDH3]           : typeof DFMDH3Attributes.Type;
  [DFMDItalic]       : typeof DFMDItalicAttributes.Type;
  [DFMDListItem]     : typeof DFMDListItemAttributes.Type;
  [DFMDMaskAnchor]   : typeof DFMDMaskAnchorAttributes.Type;
  [DFMDOrderedList]  : typeof DFMDOrderedListAttributes.Type;
  [DFMDPre]          : typeof DFMDPreAttributes.Type;
  [DFMDStrikethrough]: typeof DFMDStrikethroughAttributes.Type;
  [DFMDSmall]        : typeof DFMDSmallAttributes.Type;
  [DFMDTime]         : typeof DFMDTimeAttributes.Type;
  [DFMDUnderline]    : typeof DFMDUnderlineAttributes.Type;
  [DFMDUnorderedList]: typeof DFMDUnorderedListAttributes.Type;
  [Primary]          : typeof PrimaryAttributes.Type;
  [Secondary]        : typeof SecondaryAttributes.Type;
  [Success]          : typeof SuccessAttributes.Type;
  [Danger]           : typeof DangerAttributes.Type;
  [Link]             : typeof LinkAttributes.Type;
  [Premium]          : typeof PremiumAttributes.Type;
  [Button]           : typeof ButtonAttributes.Type;
  [Actions]          : typeof ActionsAttributes.Type;
  [Option]           : typeof OptionAttributes.Type;
  [Select]           : typeof SelectAttributes.Type;
  [Default]          : typeof DefaultAttributes.Type;
  [Channels]         : typeof ChannelsAttributes.Type;
  [Mentions]         : typeof MentionsAttributes.Type;
  [Roles]            : typeof RolesAttributes.Type;
  [Users]            : typeof UsersAttributes.Type;
  [TextDisplay]      : typeof TextDisplayAttributes.Type;
  [Thumbnail]        : typeof ThumbnailAttributes.Type;
  [Section]          : typeof SectionAttributes.Type;
  [MediaGallery]     : typeof MediaGalleryAttributes.Type;
  [File]             : typeof FileAttributes.Type;
  [Separator]        : typeof SeparatorAttributes.Type;
  [Container]        : typeof ContainerAttributes.Type;
  [Author]           : typeof AuthorAttributes.Type;
  [Embed]            : typeof EmbedAttributes.Type;
  [Image]            : typeof ImageAttributes.Type;
  [Field]            : typeof FieldAttributes.Type;
  [Footer]           : typeof FooterAttributes.Type;
  [Message]          : typeof MessageAttributes.Type;
  [Ephemeral]        : typeof EphemeralAttributes.Type;
  [Modal]            : typeof ModalAttributes.Type;
  [TextInput]        : typeof TextInputAttributes.Type;
};

export interface Children {
  [Emoji]            : typeof EmojiChildren.Type;
  [DFMDAnchor]       : typeof DFMDAnchorChildren.Type;
  [DFMDAtMention]    : typeof DFMDAtMentionChildren.Type;
  [DFMDBold]         : typeof DFMDBoldChildren.Type;
  [DFMDBlockquote]   : typeof DFMDBlockquoteChildren.Type;
  [DFMDBreak]        : typeof DFMDBreakChildren.Type;
  [DFMDCode]         : typeof DFMDCodeChildren.Type;
  [DFMDDetails]      : typeof DFMDDetailsChildren.Type;
  [DFMDParagraph]    : typeof DFMDParagraphChildren.Type;
  [DFMDH1]           : typeof DFMDH1Children.Type;
  [DFMDH2]           : typeof DFMDH2Children.Type;
  [DFMDH3]           : typeof DFMDH3Children.Type;
  [DFMDItalic]       : typeof DFMDItalicChildren.Type;
  [DFMDListItem]     : typeof DFMDListItemChildren.Type;
  [DFMDMaskAnchor]   : typeof DFMDMaskAnchorChildren.Type;
  [DFMDOrderedList]  : typeof DFMDOrderedListChildren.Type;
  [DFMDPre]          : typeof DFMDPreChildren.Type;
  [DFMDStrikethrough]: typeof DFMDStrikethroughChildren.Type;
  [DFMDSmall]        : typeof DFMDSmallChildren.Type;
  [DFMDTime]         : typeof DFMDTimeChildren.Type;
  [DFMDUnderline]    : typeof DFMDUnderlineChildren.Type;
  [DFMDUnorderedList]: typeof DFMDUnorderedListChildren.Type;
  [Primary]          : typeof PrimaryChildren.Type;
  [Secondary]        : typeof SecondaryChildren.Type;
  [Success]          : typeof SuccessChildren.Type;
  [Danger]           : typeof DangerChildren.Type;
  [Link]             : typeof LinkChildren.Type;
  [Premium]          : typeof PremiumChildren.Type;
  [Button]           : typeof ButtonChildren.Type;
  [Actions]          : typeof ActionsChildren.Type;
  [Option]           : typeof OptionChildren.Type;
  [Select]           : typeof SelectChildren.Type;
  [Default]          : typeof DefaultChildren.Type;
  [Channels]         : typeof ChannelsChildren.Type;
  [Mentions]         : typeof MentionsChildren.Type;
  [Roles]            : typeof RolesChildren.Type;
  [Users]            : typeof UsersChildren.Type;
  [Author]           : typeof AuthorChildren.Type;
  [Embed]            : typeof EmbedChildren.Type;
  [Image]            : typeof ImageChildren.Type;
  [Field]            : typeof FieldChildren.Type;
  [Footer]           : typeof FooterChildren.Type;
  [Message]          : typeof MessageChildren.Type;
  [Ephemeral]        : typeof EphemeralChildren.Type;
  [Modal]            : typeof ModalChildren.Type;
  [TextInput]        : typeof TextInputChildren.Type;
}

export interface Encodings {
  [Emoji]            : typeof EmojiJSON.Type;
  [DFMDAnchor]       : typeof DFMDAnchorJSON.Type;
  [DFMDAtMention]    : typeof DFMDAtMentionJSON.Type;
  [DFMDBold]         : typeof DFMDBoldJSON.Type;
  [DFMDBlockquote]   : typeof DFMDBlockquoteJSON.Type;
  [DFMDBreak]        : typeof DFMDBreakJSON.Type;
  [DFMDCode]         : typeof DFMDCodeJSON.Type;
  [DFMDDetails]      : typeof DFMDDetailsJSON.Type;
  [DFMDParagraph]    : typeof DFMDParagraphJSON.Type;
  [DFMDH1]           : typeof DFMDH1JSON.Type;
  [DFMDH2]           : typeof DFMDH2JSON.Type;
  [DFMDH3]           : typeof DFMDH3JSON.Type;
  [DFMDItalic]       : typeof DFMDItalicJSON.Type;
  [DFMDListItem]     : typeof DFMDListItemJSON.Type;
  [DFMDMaskAnchor]   : typeof DFMDMaskAnchorJSON.Type;
  [DFMDOrderedList]  : typeof DFMDOrderedListJSON.Type;
  [DFMDPre]          : typeof DFMDPreJSON.Type;
  [DFMDStrikethrough]: typeof DFMDStrikethroughJSON.Type;
  [DFMDSmall]        : typeof DFMDSmallJSON.Type;
  [DFMDTime]         : typeof DFMDTimeJSON.Type;
  [DFMDUnderline]    : typeof DFMDUnderlineJSON.Type;
  [DFMDUnorderedList]: typeof DFMDUnorderedListJSON.Type;
  [Primary]          : typeof PrimaryJSON.Type;
  [Secondary]        : typeof SecondaryJSON.Type;
  [Success]          : typeof SuccessJSON.Type;
  [Danger]           : typeof DangerJSON.Type;
  [Link]             : typeof LinkJSON.Type;
  [Premium]          : typeof PremiumJSON.Type;
  [Button]           : typeof ButtonJSON.Type;
  [Actions]          : typeof ActionsJSON.Type;
  [Option]           : typeof OptionJSON.Type;
  [Select]           : typeof SelectJSON.Type;
  [Default]          : typeof DefaultJSON.Type;
  [Channels]         : typeof ChannelsJSON.Type;
  [Mentions]         : typeof MentionsJSON.Type;
  [Roles]            : typeof RolesJSON.Type;
  [Users]            : typeof UsersJSON.Type;
  [TextDisplay]      : typeof TextDisplayJSON.Type;
  [Thumbnail]        : typeof ThumbnailJSON.Type;
  [Section]          : typeof SectionJSON.Type;
  [MediaGallery]     : typeof MediaGalleryJSON.Type;
  [File]             : typeof FileJSON.Type;
  [Separator]        : typeof SeparatorJSON.Type;
  [Container]        : typeof ContainerJSON.Type;
  [Author]           : typeof AuthorJSON.Type;
  [Embed]            : typeof EmbedJSON.Type;
  [Image]            : typeof ImageJSON.Type;
  [Field]            : typeof FieldJSON.Type;
  [Footer]           : typeof FooterJSON.Type;
  [Message]          : typeof MessageJSON.Type;
  [Ephemeral]        : typeof EphemeralJSON.Type;
  [Modal]            : typeof ModalJSON.Type;
  [TextInput]        : typeof TextInputJSON.Type;
}

export type Encoder<T extends keyof Attributes> =
  (
    self: {
      type : T;
      props: Attributes[T];
      step : string;
      acc:
        {
          primitive? : string[];
          components?: any[];
        } &
        {
          [K in keyof Attributes]?: Attributes[K][]
        };
    },
  ) => Encodings[T];
