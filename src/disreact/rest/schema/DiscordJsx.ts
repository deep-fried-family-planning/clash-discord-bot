import * as Rest from '#disreact/adaptor/codec/rest-element.ts';
import * as Norm from '#disreact/adaptor/intrinsic/norm.ts';
import {Discord} from 'dfx';
import * as BigInt from 'effect/BigInt';
import * as S from 'effect/Schema';
import type * as Types from 'effect/Types';

export const Emoji = 'emoji';
export const EmojiAttributes = S.Struct({
  name    : S.optional(S.String),
  id      : S.optional(S.String),
  animated: S.optional(S.Boolean),
});
export const EmojiChildren = S.Struct({});
export const EmojiEncoding = S.Struct({
  name    : S.optional(S.String),
  id      : S.optional(S.String),
  animated: S.optional(S.Boolean),
});
export const encodeEmoji: Encoder<typeof Emoji> = (self) => {
  return {
    name    : self.props.name,
    id      : self.props.id,
    animated: self.props.animated,
  };
};

export const Anchor = 'a';
export const AnchorAttributes = S.Struct({
  href : S.String,
  embed: S.optional(S.Boolean),
});
export const AnchorChildren = S.Never;
export const AnchorEncoding = S.String;
export const encodeAnchor: Encoder<typeof Anchor> = (self) => {
  if (self.props.embed) {
    return `${self.props.href}`;
  }
  return `<${self.props.href}>`;
};

export const AtMention = 'at';
export const AtMentionAttributes = S.Union(
  S.Struct({here: S.Boolean}),
  S.Struct({everyone: S.Boolean}),
  S.Struct({user: S.Union(S.String, S.Int)}),
  S.Struct({role: S.Union(S.String, S.Int)}),
  S.Struct({channel: S.Union(S.String, S.Int)}),
);
export const AtMentionChildren = S.Never;
export const AtMentionEncoding = S.String;
export const encodeAtMention: Encoder<typeof AtMention> = (self) => {
  if ('here' in self.props) return '@here';
  if ('everyone' in self.props) return '@everyone';
  if ('user' in self.props) return `<@${self.props.user}>`;
  if ('role' in self.props) return `<@&${self.props.role}>`;
  if ('channel' in self.props) return `<#${self.props.channel}>`;
  return '';
};

export const Bold = 'b';
export const BoldAttributes = S.Struct({});
export const BoldChildren = S.Struct({});
export const BoldEncoding = S.Struct({});
export const encodeBold: Encoder<typeof Bold> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  return `**${self.acc[Norm.PRIMITIVE][0]}**`;
};

export const Blockquote = 'blockquote';
export const BlockquoteAttributes = S.Struct({});
export const BlockquoteChildren = S.Struct({});
export const BlockquoteEncoding = S.Struct({});
export const encodeBlockquote: Encoder<typeof Blockquote> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  return `> ${self.acc[Norm.PRIMITIVE][0]}`;
};

export const Break = 'br';
export const BreakAttributes = S.Struct({});
export const BreakChildren = S.Struct({});
export const BreakEncoding = S.Struct({});
export const encodeBreak: Encoder<typeof Break> = (self) => {
  return '\n';
};

export const Code = 'code';
export const CodeAttributes = S.Struct({});
export const CodeChildren = S.Struct({});
export const CodeEncoding = S.String;
export const encodeCode: Encoder<typeof Code> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  return `\`${self.acc[Norm.PRIMITIVE][0]}\``;
};

export const Details = 'details';
export const DetailsAttributes = S.Struct({});
export const DetailsChildren = S.Struct({});
export const DetailsEncoding = S.Struct({});
export const encodeDetails: Encoder<typeof Details> = (self) => {
  throw new Error('Not implemented');
};

export const H1 = 'h1';
export const H1Attributes = S.Struct({});
export const H1Children = S.Struct({});
export const H1Encoding = S.Struct({});
export const encodeH1: Encoder<typeof H1> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  return `# ${self.acc[Norm.PRIMITIVE][0]}`;
};

export const H2 = 'h2';
export const H2Attributes = S.Struct({});
export const H2Children = S.Struct({});
export const H2Encoding = S.Struct({});
export const encodeH2: Encoder<typeof H2> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  return `## ${self.acc[Norm.PRIMITIVE][0]}`;
};

export const H3 = 'h3';
export const H3Attributes = S.Struct({});
export const H3Children = S.Struct({});
export const H3Encoding = S.Struct({});
export const encodeH3: Encoder<typeof H3> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  return `### ${self.acc[Norm.PRIMITIVE][0]}`;
};

export const Italic = 'i';
export const ItalicAttributes = S.Struct({});
export const ItalicChildren = S.Struct({});
export const ItalicEncoding = S.Struct({});
export const encodeItalic: Encoder<typeof Italic> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  return `*${self.acc[Norm.PRIMITIVE][0]}*`;
};

export const ListItem = 'li';
export const ListItemAttributes = S.Struct({});
export const ListItemChildren = S.Struct({});
export const ListItemEncoding = S.Struct({});
export const encodeListItem: Encoder<typeof ListItem> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  return `- ${self.acc[Norm.PRIMITIVE][0]}`;
};

export const MaskAnchor = 'mask';
export const MaskAnchorAttributes = S.Struct({
  href : S.String,
  embed: S.optional(S.Boolean),
});
export const MaskAnchorChildren = S.Never;
export const MaskAnchorEncoding = S.String;
export const encodeMaskAnchor: Encoder<typeof MaskAnchor> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  if (self.props.embed) {
    return `[${self.acc[Norm.PRIMITIVE][0]}](${self.props.href})`;
  }
  return `[${self.acc[Norm.PRIMITIVE][0]}](<${self.props.href}>)`;
};

export const OrderedList = 'ol';
export const OrderedListAttributes = S.Struct({});
export const OrderedListChildren = S.Struct({});
export const OrderedListEncoding = S.Struct({});
export const encodeOrderedList: Encoder<typeof OrderedList> = (self) => {
  throw new Error('Not implemented');
};

export const Paragraph = 'p';
export const ParagraphAttributes = S.Struct({});
export const ParagraphChildren = S.Struct({});
export const ParagraphEncoding = S.Struct({});
export const encodeParagraph: Encoder<typeof Paragraph> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  return `\n${self.acc[Norm.PRIMITIVE][0]}`;
};

export const Pre = 'pre';
export const PreAttributes = S.Struct({
  lang: S.optional(S.String),
});
export const PreChildren = S.Struct({});
export const PreEncoding = S.String;
export const encodePre: Encoder<typeof Pre> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  if (!self.props.lang) {
    return `\`\`\`\n${self.acc[Norm.PRIMITIVE][0]}\n\`\`\``;
  }
  return `\`\`\`${self.props.lang}\n${self.acc[Norm.PRIMITIVE][0]}\n\`\`\``;
};

export const Strikethrough = 's';
export const StrikethroughAttributes = S.Struct({});
export const StrikethroughChildren = S.Struct({});
export const StrikethroughEncoding = S.Struct({});
export const encodeStrikethrough: Encoder<typeof Strikethrough> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  return `~~${self.acc[Norm.PRIMITIVE][0]}~~`;
};

export const Small = 'small';
export const SmallAttributes = S.Struct({});
export const SmallChildren = S.Struct({});
export const SmallEncoding = S.Struct({});
export const encodeSmall: Encoder<typeof Small> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  return `-# ${self.acc[Norm.PRIMITIVE][0]}`;
};

export const Time = 'time';
export const TimeAttributes = S.Union(
  S.Struct({d: S.Union(S.String, S.Int, S.BigInt)}),
  S.Struct({D: S.Union(S.String, S.Int, S.BigInt)}),
  S.Struct({t: S.Union(S.String, S.Int, S.BigInt)}),
  S.Struct({T: S.Union(S.String, S.Int, S.BigInt)}),
  S.Struct({f: S.Union(S.String, S.Int, S.BigInt)}),
  S.Struct({F: S.Union(S.String, S.Int, S.BigInt)}),
  S.Struct({R: S.Union(S.String, S.Int, S.BigInt)}),
);
export const TimeChildren = S.Struct({});
export const TimeEncoding = S.String;
export const encodeTime: Encoder<typeof Time> = (self) => {
  const {d, D, t, T, f, F, R} = self.props as Types.UnionToIntersection<typeof TimeAttributes.Type>;
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

export const Underline = 'u';
export const UnderlineAttributes = S.Struct({});
export const UnderlineChildren = S.Struct({});
export const UnderlineEncoding = S.Struct({});
export const encodeUnderline: Encoder<typeof Underline> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  return `__${self.acc[Norm.PRIMITIVE][0]}__`;
};

export const UnorderedList = 'ul';
export const UnorderedListAttributes = S.Struct({});
export const UnorderedListChildren = S.Struct({});
export const UnorderedListEncoding = S.Struct({});
export const encodeUnorderedList: Encoder<typeof UnorderedList> = (self) => {
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
export const PrimaryEncoding = S.Struct({});
export const encodePrimary: Encoder<typeof Primary> = (self) => {
  return {
    type     : Discord.MessageComponentTypes.BUTTON,
    style    : Discord.ButtonStyleTypes.PRIMARY as number,
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
export const SecondaryEncoding = S.Struct({});
export const encodeSecondary: Encoder<typeof Secondary> = (self) => {
  return {
    type     : Discord.MessageComponentTypes.BUTTON,
    style    : Discord.ButtonStyleTypes.SECONDARY as number,
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
export const SuccessEncoding = S.Struct({});
export const encodeSuccess: Encoder<typeof Success> = (self) => {
  return {
    type     : Discord.MessageComponentTypes.BUTTON,
    style    : Discord.ButtonStyleTypes.SUCCESS as number,
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
export const DangerEncoding = S.Struct({});
export const encodeDanger: Encoder<typeof Danger> = (self) => {
  return {
    type     : Discord.MessageComponentTypes.BUTTON,
    style    : Discord.ButtonStyleTypes.DANGER as number,
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
export const LinkEncoding = S.Struct({});
export const encodeLink: Encoder<typeof Link> = (self) => {
  return {
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
export const PremiumEncoding = S.Struct({});
export const encodePremium: Encoder<typeof Premium> = (self) => {
  return {
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
export const ButtonEncoding = S.Struct({});
export const encodeButton: Encoder<typeof Button> = (self) => {
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
export const ActionsEncoding = S.Struct({});
export const encodeActions: Encoder<typeof Actions> = (self) => {
  return {
    type      : 1,
    components: self.acc[Norm.COMPONENTS],
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
export const OptionEncoding = S.Struct({});
export const encodeOption: Encoder<typeof Option> = (self) => {
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
export const SelectEncoding = S.Struct({});
export const encodeSelect: Encoder<typeof Select> = (self) => {
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
export const DefaultEncoding = S.Struct({});
export const encodeDefault: Encoder<typeof Default> = (self) => {
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
export const ChannelsEncoding = S.Struct({});
export const encodeChannels: Encoder<typeof Channels> = (self) => {
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
export const MentionsEncoding = S.Struct({});
export const encodeMentions: Encoder<typeof Mentions> = (self) => {
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
export const RolesEncoding = S.Struct({});
export const encodeRoles: Encoder<typeof Roles> = (self) => {
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
export const UsersEncoding = S.Struct({});
export const encodeUsers: Encoder<typeof Users> = (self) => {
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
 * Embed
 */

export const Author = 'author';
export const AuthorAttributes = S.Struct({
  name: S.String,
  url : S.optional(S.String),
});
export const AuthorChildren = S.Struct({});
export const AuthorEncoding = S.Struct({});
export const encodeAuthor: Encoder<typeof Author> = (self) => {
  return {
    name: self.props.name ?? self.acc[Norm.PRIMITIVE]?.join(''),
    url : self.props.url,
  };
};

export const Image = 'img';
export const ImageAttributes = S.Struct({
  url: S.String,
});
export const ImageChildren = S.Struct({});
export const ImageEncoding = S.Struct({});
export const encodeImage: Encoder<typeof Image> = (self) => {
  return {
    url: self.props.url,
  };
};

export const Footer = 'footer';
export const FooterAttributes = S.Struct({
  text: S.String,
});
export const FooterChildren = S.Struct({});
export const FooterEncoding = S.Struct({});
export const encodeFooter: Encoder<typeof Footer> = (self) => {
  return {
    text: self.props.text ?? self.acc[Norm.PRIMITIVE]?.join(''),
  };
};

export const Field = 'field';
export const FieldAttributes = S.Struct({
  name  : S.String,
  value : S.optional(S.String),
  inline: S.optional(S.Boolean),
});
export const FieldChildren = S.Struct({});
export const FieldEncoding = S.Struct({});
export const encodeField: Encoder<typeof Field> = (self) => {
  return {
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
export const EmbedEncoding = S.Struct({
  author     : S.optional(AuthorAttributes),
  title      : S.optional(S.String),
  description: S.optional(S.String),
  color      : S.optional(S.Int),
  url        : S.optional(S.String),
  image      : S.optional(ImageAttributes),
  fields     : S.optional(S.Array(FieldAttributes)),
  footer     : S.optional(FooterAttributes),
});
export const encodeEmbed: Encoder<typeof Embed> = (self) => {
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
export const MessageEncoding = S.Struct({});
export const encodeMessage: Encoder<typeof Message> = (self) => {
  return {
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
export const EphemeralEncoding = S.Struct({});
export const encodeEphemeral: Encoder<typeof Ephemeral> = (self) => {
  return {
    content   : self.props.content ?? self.acc[Norm.PRIMITIVE]?.[0] ?? undefined,
    embeds    : self.acc[Embed],
    components: self.acc[Norm.COMPONENTS],
    flags     : 64,
  };
};

export const TextInput = 'textinput';
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
export const TextInputEncoding = S.Struct({});
export const encodeTextInput: Encoder<typeof TextInput> = (self) => {
  return {
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

export const Modal = 'modal';
export const ModalAttributes = S.Struct({
  custom_id: S.optional(S.String),
  title    : S.String,
  onsubmit : Rest.Handler(S.Any),
});
export const ModalChildren = S.Struct({});
export const ModalEncoding = S.Struct({});
export const encodeModal: Encoder<typeof Modal> = (self) => {
  return {
    custom_id : self.props.custom_id ?? self.step,
    title     : self.props.title,
    components: self.acc[Norm.COMPONENTS],
  };
};

export const Encoders: { [T in keyof Attributes]: Encoder<T>; } = {
  [Emoji]        : encodeEmoji,
  [Anchor]       : encodeAnchor,
  [AtMention]    : encodeAtMention,
  [Bold]         : encodeBold,
  [Blockquote]   : encodeBlockquote,
  [Break]        : encodeBreak,
  [Code]         : encodeCode,
  [Details]      : encodeDetails,
  [Paragraph]    : encodeParagraph,
  [H1]           : encodeH1,
  [H2]           : encodeH2,
  [H3]           : encodeH3,
  [Italic]       : encodeItalic,
  [ListItem]     : encodeListItem,
  [MaskAnchor]   : encodeMaskAnchor,
  [OrderedList]  : encodeOrderedList,
  [Pre]          : encodePre,
  [Strikethrough]: encodeStrikethrough,
  [Small]        : encodeSmall,
  [Time]         : encodeTime,
  [Underline]    : encodeUnderline,
  [UnorderedList]: encodeUnorderedList,
  [Primary]      : encodePrimary,
  [Secondary]    : encodeSecondary,
  [Success]      : encodeSuccess,
  [Danger]       : encodeDanger,
  [Link]         : encodeLink,
  [Premium]      : encodePremium,
  [Button]       : encodeButton,
  [Actions]      : encodeActions,
  [Option]       : encodeOption,
  [Select]       : encodeSelect,
  [Default]      : encodeDefault,
  [Channels]     : encodeChannels,
  [Mentions]     : encodeMentions,
  [Roles]        : encodeRoles,
  [Users]        : encodeUsers,
  [Author]       : encodeAuthor,
  [Embed]        : encodeEmbed,
  [Image]        : encodeImage,
  [Field]        : encodeField,
  [Footer]       : encodeFooter,
  [Message]      : encodeMessage,
  [Ephemeral]    : encodeEphemeral,
  [Modal]        : encodeModal,
  [TextInput]    : encodeTextInput,
};

export interface Attributes {
  [Emoji]        : typeof EmojiAttributes.Type;
  [Anchor]       : typeof AnchorAttributes.Type;
  [AtMention]    : typeof AtMentionAttributes.Type;
  [Bold]         : typeof BoldAttributes.Type;
  [Blockquote]   : typeof BlockquoteAttributes.Type;
  [Break]        : typeof BreakAttributes.Type;
  [Code]         : typeof CodeAttributes.Type;
  [Details]      : typeof DetailsAttributes.Type;
  [Paragraph]    : typeof ParagraphAttributes.Type;
  [H1]           : typeof H1Attributes.Type;
  [H2]           : typeof H2Attributes.Type;
  [H3]           : typeof H3Attributes.Type;
  [Italic]       : typeof ItalicAttributes.Type;
  [ListItem]     : typeof ListItemAttributes.Type;
  [MaskAnchor]   : typeof MaskAnchorAttributes.Type;
  [OrderedList]  : typeof OrderedListAttributes.Type;
  [Pre]          : typeof PreAttributes.Type;
  [Strikethrough]: typeof StrikethroughAttributes.Type;
  [Small]        : typeof SmallAttributes.Type;
  [Time]         : typeof TimeAttributes.Type;
  [Underline]    : typeof UnderlineAttributes.Type;
  [UnorderedList]: typeof UnorderedListAttributes.Type;
  [Primary]      : typeof PrimaryAttributes.Type;
  [Secondary]    : typeof SecondaryAttributes.Type;
  [Success]      : typeof SuccessAttributes.Type;
  [Danger]       : typeof DangerAttributes.Type;
  [Link]         : typeof LinkAttributes.Type;
  [Premium]      : typeof PremiumAttributes.Type;
  [Button]       : typeof ButtonAttributes.Type;
  [Actions]      : typeof ActionsAttributes.Type;
  [Option]       : typeof OptionAttributes.Type;
  [Select]       : typeof SelectAttributes.Type;
  [Default]      : typeof DefaultAttributes.Type;
  [Channels]     : typeof ChannelsAttributes.Type;
  [Mentions]     : typeof MentionsAttributes.Type;
  [Roles]        : typeof RolesAttributes.Type;
  [Users]        : typeof UsersAttributes.Type;
  [Author]       : typeof AuthorAttributes.Type;
  [Embed]        : typeof EmbedAttributes.Type;
  [Image]        : typeof ImageAttributes.Type;
  [Field]        : typeof FieldAttributes.Type;
  [Footer]       : typeof FooterAttributes.Type;
  [Message]      : typeof MessageAttributes.Type;
  [Ephemeral]    : typeof EphemeralAttributes.Type;
  [Modal]        : typeof ModalAttributes.Type;
  [TextInput]    : typeof TextInputAttributes.Type;
};

export interface Children {
  [Emoji]        : typeof EmojiChildren.Type;
  [Anchor]       : typeof AnchorChildren.Type;
  [AtMention]    : typeof AtMentionChildren.Type;
  [Bold]         : typeof BoldChildren.Type;
  [Blockquote]   : typeof BlockquoteChildren.Type;
  [Break]        : typeof BreakChildren.Type;
  [Code]         : typeof CodeChildren.Type;
  [Details]      : typeof DetailsChildren.Type;
  [Paragraph]    : typeof ParagraphChildren.Type;
  [H1]           : typeof H1Children.Type;
  [H2]           : typeof H2Children.Type;
  [H3]           : typeof H3Children.Type;
  [Italic]       : typeof ItalicChildren.Type;
  [ListItem]     : typeof ListItemChildren.Type;
  [MaskAnchor]   : typeof MaskAnchorChildren.Type;
  [OrderedList]  : typeof OrderedListChildren.Type;
  [Pre]          : typeof PreChildren.Type;
  [Strikethrough]: typeof StrikethroughChildren.Type;
  [Small]        : typeof SmallChildren.Type;
  [Time]         : typeof TimeChildren.Type;
  [Underline]    : typeof UnderlineChildren.Type;
  [UnorderedList]: typeof UnorderedListChildren.Type;
  [Primary]      : typeof PrimaryChildren.Type;
  [Secondary]    : typeof SecondaryChildren.Type;
  [Success]      : typeof SuccessChildren.Type;
  [Danger]       : typeof DangerChildren.Type;
  [Link]         : typeof LinkChildren.Type;
  [Premium]      : typeof PremiumChildren.Type;
  [Button]       : typeof ButtonChildren.Type;
  [Actions]      : typeof ActionsChildren.Type;
  [Option]       : typeof OptionChildren.Type;
  [Select]       : typeof SelectChildren.Type;
  [Default]      : typeof DefaultChildren.Type;
  [Channels]     : typeof ChannelsChildren.Type;
  [Mentions]     : typeof MentionsChildren.Type;
  [Roles]        : typeof RolesChildren.Type;
  [Users]        : typeof UsersChildren.Type;
  [Author]       : typeof AuthorChildren.Type;
  [Embed]        : typeof EmbedChildren.Type;
  [Image]        : typeof ImageChildren.Type;
  [Field]        : typeof FieldChildren.Type;
  [Footer]       : typeof FooterChildren.Type;
  [Message]      : typeof MessageChildren.Type;
  [Ephemeral]    : typeof EphemeralChildren.Type;
  [Modal]        : typeof ModalChildren.Type;
  [TextInput]    : typeof TextInputChildren.Type;
}

export interface Encodings {
  [Emoji]        : typeof EmojiEncoding.Type;
  [Anchor]       : typeof AnchorEncoding.Type;
  [AtMention]    : typeof AtMentionEncoding.Type;
  [Bold]         : typeof BoldEncoding.Type;
  [Blockquote]   : typeof BlockquoteEncoding.Type;
  [Break]        : typeof BreakEncoding.Type;
  [Code]         : typeof CodeEncoding.Type;
  [Details]      : typeof DetailsEncoding.Type;
  [Paragraph]    : typeof ParagraphEncoding.Type;
  [H1]           : typeof H1Encoding.Type;
  [H2]           : typeof H2Encoding.Type;
  [H3]           : typeof H3Encoding.Type;
  [Italic]       : typeof ItalicEncoding.Type;
  [ListItem]     : typeof ListItemEncoding.Type;
  [MaskAnchor]   : typeof MaskAnchorEncoding.Type;
  [OrderedList]  : typeof OrderedListEncoding.Type;
  [Pre]          : typeof PreEncoding.Type;
  [Strikethrough]: typeof StrikethroughEncoding.Type;
  [Small]        : typeof SmallEncoding.Type;
  [Time]         : typeof TimeEncoding.Type;
  [Underline]    : typeof UnderlineEncoding.Type;
  [UnorderedList]: typeof UnorderedListEncoding.Type;
  [Primary]      : typeof PrimaryEncoding.Type;
  [Secondary]    : typeof SecondaryEncoding.Type;
  [Success]      : typeof SuccessEncoding.Type;
  [Danger]       : typeof DangerEncoding.Type;
  [Link]         : typeof LinkEncoding.Type;
  [Premium]      : typeof PremiumEncoding.Type;
  [Button]       : typeof ButtonEncoding.Type;
  [Actions]      : typeof ActionsEncoding.Type;
  [Option]       : typeof OptionEncoding.Type;
  [Select]       : typeof SelectEncoding.Type;
  [Default]      : typeof DefaultEncoding.Type;
  [Channels]     : typeof ChannelsEncoding.Type;
  [Mentions]     : typeof MentionsEncoding.Type;
  [Roles]        : typeof RolesEncoding.Type;
  [Users]        : typeof UsersEncoding.Type;
  [Author]       : typeof AuthorEncoding.Type;
  [Embed]        : typeof EmbedEncoding.Type;
  [Image]        : typeof ImageEncoding.Type;
  [Field]        : typeof FieldEncoding.Type;
  [Footer]       : typeof FooterEncoding.Type;
  [Message]      : typeof MessageEncoding.Type;
  [Ephemeral]    : typeof EphemeralEncoding.Type;
  [Modal]        : typeof ModalEncoding.Type;
  [TextInput]    : typeof TextInputEncoding.Type;
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
