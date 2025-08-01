import * as Rest from '#disreact/core/a/codec/rest-element.ts';
import * as Norm from '#disreact/core/a/intrinsic/norm.ts';
import * as DiscordIO from '#disreact/codec/DiscordIO.ts';
import type * as Jsx from '#disreact/engine/internal/Jsx.tsx';
import {Discord} from 'dfx';
import * as BigInt from 'effect/BigInt';
import * as S from 'effect/Schema';
import type * as AST from 'effect/SchemaAST';
import type * as Types from 'effect/Types';

/**
 * Common
 */
export const Interactable = S.Struct({
  id       : DiscordIO.Int32IdOutput,
  custom_id: DiscordIO.CustomIdOutput,
});

export const Emoji = 'emoji';
export const EmojiProps = S.Struct({
  name    : S.optional(S.String),
  id      : S.optional(S.String),
  animated: S.optional(S.Boolean),
});
export const EmojiChildren = S.Never;
export const EmojiJSON = S.TaggedStruct(Emoji, DiscordIO.EmojiOutput.fields);
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
export const MarkdownString = S.String;

export const MarkdownAnchor = 'a';
export const MarkdownAnchorProps = S.Struct({
  href : S.String,
  embed: S.optional(S.Boolean),
});
export const MarkdownAnchorChildren = S.Never;
export const MarkdownAnchorJSON = MarkdownString;
export const MarkdownAnchorEncode: Encoder<typeof MarkdownAnchor> = (self) => {
  if (self.props.embed) {
    return `${self.props.href}`;
  }
  return `<${self.props.href}>`;
};

export const MarkdownMaskAnchor = 'mask';
export const MarkdownMaskAnchorProps = S.Struct({
  href : S.String,
  embed: S.optional(S.Boolean),
});
export const MarkdownMaskAnchorChildren = S.Never;
export const MarkdownMaskAnchorJSON = MarkdownString;
export const MaskAnchorEncode: Encoder<typeof MarkdownMaskAnchor> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  if (self.props.embed) {
    return `[${self.acc[Norm.PRIMITIVE][0]}](${self.props.href})`;
  }
  return `[${self.acc[Norm.PRIMITIVE][0]}](<${self.props.href}>)`;
};

export const MarkdownAtMention = 'at';
export const MarkdownAtMentionProps = S.Union(
  S.Struct({here: S.Boolean}),
  S.Struct({everyone: S.Boolean}),
  S.Struct({user: S.Union(S.String, S.Int)}),
  S.Struct({role: S.Union(S.String, S.Int)}),
  S.Struct({channel: S.Union(S.String, S.Int)}),
);
export const MarkdownAtMentionChildren = S.Never;
export const MarkdownAtMentionJSON = MarkdownString;
export const MarkdownAtMentionEncode: Encoder<typeof MarkdownAtMention> = (self) => {
  if ('here' in self.props) return '@here';
  if ('everyone' in self.props) return '@everyone';
  if ('user' in self.props) return `<@${self.props.user}>`;
  if ('role' in self.props) return `<@&${self.props.role}>`;
  if ('channel' in self.props) return `<#${self.props.channel}>`;
  return '';
};

export const MarkdownTime = 'time';
export const MarkdownTimeProps = S.Union(
  S.Struct({d: S.Union(S.String, S.Int.pipe(S.positive()), S.PositiveBigInt)}),
  S.Struct({D: S.Union(S.String, S.Int.pipe(S.positive()), S.PositiveBigInt)}),
  S.Struct({t: S.Union(S.String, S.Int.pipe(S.positive()), S.PositiveBigInt)}),
  S.Struct({T: S.Union(S.String, S.Int.pipe(S.positive()), S.PositiveBigInt)}),
  S.Struct({f: S.Union(S.String, S.Int.pipe(S.positive()), S.PositiveBigInt)}),
  S.Struct({F: S.Union(S.String, S.Int.pipe(S.positive()), S.PositiveBigInt)}),
  S.Struct({R: S.Union(S.String, S.Int.pipe(S.positive()), S.PositiveBigInt)}),
);
export const MarkdownTimeChildren = S.Struct({});
export const MarkdownTimeJSON = MarkdownString;
export const MarkdownTimeEncode: Encoder<typeof MarkdownTime> = (self) => {
  const {d, D, t, T, f, F, R} = self.props as Types.UnionToIntersection<Props[typeof MarkdownTime]>;
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

export const MarkdownBreak = 'br';
export const MarkdownBreakProps = S.Struct({});
export const MarkdownBreakChildren = S.Struct({});
export const MarkdownBreakJSON = MarkdownString;
export const MarkdownBreakEncode: Encoder<typeof MarkdownBreak> = (self) => {
  return '\n';
};

export const MarkdownBold = 'b';
export const MarkdownBoldProps = S.Struct({});
export const MarkdownBoldChildren = S.Struct({});
export const MarkdownBoldJSON = MarkdownString;
export const MarkdownBoldEncode: Encoder<typeof MarkdownBold> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  return `**${self.acc[Norm.PRIMITIVE][0]}**`;
};

export const MarkdownItalic = 'i';
export const MarkdownItalicProps = S.Struct({});
export const MarkdownItalicChildren = S.Struct({});
export const MarkdownItalicJSON = MarkdownString;
export const MarkdownItalicEncode: Encoder<typeof MarkdownItalic> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  return `*${self.acc[Norm.PRIMITIVE][0]}*`;
};

export const MarkdownStrike = 's';
export const MarkdownStrikeProps = S.Struct({});
export const MarkdownStrikeChildren = S.Struct({});
export const MarkdownStrikeJSON = MarkdownString;
export const MarkdownStrikeEncode: Encoder<typeof MarkdownStrike> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  return `~~${self.acc[Norm.PRIMITIVE][0]}~~`;
};

export const MarkdownUnderline = 'u';
export const MarkdownUnderlineProps = S.Struct({});
export const MarkdownUnderlineChildren = S.Struct({});
export const MarkdownUnderlineJSON = MarkdownString;
export const MarkdownUnderlineEncode: Encoder<typeof MarkdownUnderline> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  return `__${self.acc[Norm.PRIMITIVE][0]}__`;
};

export const MarkdownDetails = 'details';
export const MarkdownDetailsProps = S.Struct({});
export const MarkdownDetailsChildren = S.Struct({});
export const MarkdownDetailsJSON = MarkdownString;
export const MarkdownDetailsEncode: Encoder<typeof MarkdownDetails> = (self) => {
  throw new Error('Not implemented');
};

export const MarkdownCode = 'code';
export const MarkdownCodeProps = S.Struct({});
export const MarkdownCodeChildren = S.Struct({});
export const MarkdownCodeJSON = MarkdownString;
export const MarkdownCodeEncode: Encoder<typeof MarkdownCode> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  return `\`${self.acc[Norm.PRIMITIVE][0]}\``;
};

export const MarkdownCodeBlock = 'pre';
export const MarkdownCodeBlockProps = S.Struct({
  lang: S.optional(S.String),
});
export const MarkdownCodeBlockChildren = S.Struct({});
export const MarkdownCodeBlockJSON = MarkdownString;
export const MarkdownCodeBlockEncode: Encoder<typeof MarkdownCodeBlock> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  if (!self.props.lang) {
    return `\`\`\`\n${self.acc[Norm.PRIMITIVE][0]}\n\`\`\``;
  }
  return `\`\`\`${self.props.lang}\n${self.acc[Norm.PRIMITIVE][0]}\n\`\`\``;
};

export const MarkdownBlockquote = 'blockquote';
export const MarkdownBlockquoteProps = S.Struct({});
export const MarkdownBlockquoteChildren = S.Struct({});
export const MarkdownBlockquoteJSON = MarkdownString;
export const MarkdownBlockquoteEncode: Encoder<typeof MarkdownBlockquote> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  return `> ${self.acc[Norm.PRIMITIVE][0]}`;
};

export const MarkdownParagraph = 'p';
export const MarkdownParagraphProps = S.Struct({});
export const MarkdownParagraphChildren = S.Struct({});
export const MarkdownParagraphJSON = MarkdownString;
export const MarkdownParagraphEncode: Encoder<typeof MarkdownParagraph> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  return `\n${self.acc[Norm.PRIMITIVE][0]}`;
};

export const MarkdownH1 = 'h1';
export const MarkdownH1Props = S.Struct({});
export const MarkdownH1Children = S.Struct({});
export const MarkdownH1JSON = MarkdownString;
export const MarkdownH1Encode: Encoder<typeof MarkdownH1> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  return `# ${self.acc[Norm.PRIMITIVE][0]}`;
};

export const MarkdownH2 = 'h2';
export const MarkdownH2Props = S.Struct({});
export const MarkdownH2Children = S.Struct({});
export const MarkdownH2JSON = MarkdownString;
export const MarkdownH2Encode: Encoder<typeof MarkdownH2> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  return `## ${self.acc[Norm.PRIMITIVE][0]}`;
};

export const MarkdownH3 = 'h3';
export const MarkdownH3Props = S.Struct({});
export const MarkdownH3Children = S.Struct({});
export const MarkdownH3JSON = MarkdownString;
export const MarkdownH3Encode: Encoder<typeof MarkdownH3> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  return `### ${self.acc[Norm.PRIMITIVE][0]}`;
};

export const MarkdownSubheader = 'small';
export const MarkdownSubheaderProps = S.Struct({});
export const MarkdownSubheaderChildren = S.Struct({});
export const MarkdownSubheaderJSON = MarkdownString;
export const MarkdownSubheaderEncode: Encoder<typeof MarkdownSubheader> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  return `-# ${self.acc[Norm.PRIMITIVE][0]}`;
};

export const MarkdownListItem = 'li';
export const MarkdownListItemProps = S.Struct({});
export const MarkdownListItemChildren = S.Struct({});
export const MarkdownListItemJSON = MarkdownString;
export const MarkdownListItemEncode: Encoder<typeof MarkdownListItem> = (self) => {
  if (!self.acc.primitive) {
    return '';
  }
  return `- ${self.acc[Norm.PRIMITIVE][0]}`;
};

export const MarkdownOrderedList = 'ol';
export const MarkdownOrderedListProps = S.Struct({});
export const MarkdownOrderedListChildren = S.Struct({});
export const MarkdownOrderedListJSON = MarkdownString;
export const MarkdownOrderedListEncode: Encoder<typeof MarkdownOrderedList> = (self) => {
  throw new Error('Not implemented');
};

export const MarkdownUnorderedList = 'ul';
export const MarkdownUnorderedListProps = S.Struct({});
export const MarkdownUnorderedListChildren = S.Struct({});
export const MarkdownUnorderedListJSON = MarkdownString;
export const MarkdownUnorderedListEncode: Encoder<typeof MarkdownUnorderedList> = (self) => {
  throw new Error('Not implemented');
};

/**
 * Buttons
 */
export const ButtonPrimary = 'primary';
export const ButtonPrimaryProps = S.Struct({
  custom_id: S.optional(DiscordIO.Str100),
  label    : S.optional(DiscordIO.Str80),
  emoji    : S.optional(EmojiProps),
  disabled : S.optional(S.Boolean),
  onclick  : S.optional(Rest.Handler(S.Any)),
});
export const ButtonPrimaryChildren = S.Struct({});
export const ButtonPrimaryJSON = S.TaggedStruct(ButtonPrimary, DiscordIO.ButtonPrimaryOutput.fields);
export const ButtonPrimaryEncode: Encoder<typeof ButtonPrimary> = (self) => {
  return {
    _tag     : ButtonPrimary,
    type     : Discord.MessageComponentTypes.BUTTON,
    style    : Discord.ButtonStyleTypes.PRIMARY,
    custom_id: self.props.custom_id ?? self.step,
    label    : self.props.label ?? self.acc[Norm.PRIMITIVE]?.[0],
    emoji    : self.props.emoji ?? self.acc[Emoji]?.[0],
    disabled : self.props.disabled,
  };
};

export const ButtonSecondary = 'secondary';
export const ButtonSecondaryProps = S.Struct({
  custom_id: S.optional(DiscordIO.Str100),
  label    : S.optional(DiscordIO.Str80),
  emoji    : S.optional(EmojiProps),
  disabled : S.optional(S.Boolean),
  onclick  : S.optional(Rest.Handler(S.Any)),
});
export const ButtonSecondaryChildren = S.Struct({});
export const ButtonSecondaryJSON = S.TaggedStruct(ButtonSecondary, DiscordIO.ButtonSecondaryOutput.fields);
export const ButtonSecondaryEncode: Encoder<typeof ButtonSecondary> = (self) => {
  return {
    _tag     : ButtonSecondary,
    type     : Discord.MessageComponentTypes.BUTTON,
    style    : Discord.ButtonStyleTypes.SECONDARY,
    custom_id: self.props.custom_id ?? self.step,
    label    : self.props.label ?? self.acc[Norm.PRIMITIVE]?.[0],
    emoji    : self.props.emoji ?? self.acc[Emoji]?.[0],
    disabled : self.props.disabled,
  };
};

export const ButtonSuccess = 'success';
export const ButtonSuccessProps = S.Struct({
  custom_id: S.optional(DiscordIO.Str100),
  label    : S.optional(DiscordIO.Str80),
  emoji    : S.optional(EmojiProps),
  disabled : S.optional(S.Boolean),
  onclick  : S.optional(Rest.Handler(S.Any)),
});
export const ButtonSuccessChildren = S.Struct({});
export const ButtonSuccessJSON = S.TaggedStruct(ButtonSuccess, DiscordIO.ButtonSuccessOutput.fields);
export const ButtonSuccessEncode: Encoder<typeof ButtonSuccess> = (self) => {
  return {
    _tag     : ButtonSuccess,
    type     : Discord.MessageComponentTypes.BUTTON,
    style    : Discord.ButtonStyleTypes.SUCCESS,
    custom_id: self.props.custom_id ?? self.step,
    label    : self.props.label ?? self.acc[Norm.PRIMITIVE]?.[0],
    emoji    : self.props.emoji ?? self.acc[Emoji]?.[0],
    disabled : self.props.disabled,
  };
};

export const ButtonDanger = 'danger';
export const ButtonDangerProps = S.Struct({
  custom_id: S.optional(DiscordIO.Str100),
  label    : S.optional(DiscordIO.Str80),
  emoji    : S.optional(EmojiProps),
  disabled : S.optional(S.Boolean),
  onclick  : S.optional(Rest.Handler(S.Any)),
});
export const ButtonDangerChildren = S.Struct({});
export const ButtonDangerJSON = S.TaggedStruct(ButtonDanger, DiscordIO.ButtonDangerOutput.fields);
export const ButtonDangerEncode: Encoder<typeof ButtonDanger> = (self) => {
  return {
    _tag     : ButtonDanger,
    type     : Discord.MessageComponentTypes.BUTTON,
    style    : Discord.ButtonStyleTypes.DANGER,
    custom_id: self.props.custom_id ?? self.step,
    label    : self.props.label ?? self.acc[Norm.PRIMITIVE]?.[0],
    emoji    : self.props.emoji ?? self.acc[Emoji]?.[0],
    disabled : self.props.disabled,
  };
};

export const ButtonLink = 'link';
export const ButtonLinkProps = S.Struct({
  url     : DiscordIO.Str512,
  label   : S.optional(DiscordIO.Str80),
  emoji   : S.optional(EmojiProps),
  disabled: S.optional(S.Boolean),
});
export const ButtonLinkChildren = S.Struct({});
export const ButtonLinkJSON = S.TaggedStruct(ButtonLink, DiscordIO.ButtonLinkOutput.fields);
export const ButtonLinkEncode: Encoder<typeof ButtonLink> = (self) => {
  return {
    _tag    : ButtonLink,
    type    : Discord.MessageComponentTypes.BUTTON,
    style   : Discord.ButtonStyleTypes.LINK,
    url     : self.props.url,
    label   : self.props.label ?? self.acc[Norm.PRIMITIVE]?.[0],
    emoji   : self.props.emoji ?? self.acc[Emoji]?.[0],
    disabled: self.props.disabled,
  };
};

export const ButtonPremium = 'premium';
export const ButtonPremiumProps = S.Struct({
  sku_id  : S.String,
  disabled: S.optional(S.Boolean),
});
export const ButtonPremiumChildren = S.Struct({});
export const ButtonPremiumJSON = S.TaggedStruct(ButtonPremium, DiscordIO.ButtonPremiumOutput.fields);
export const ButtonPremiumEncode: Encoder<typeof ButtonPremium> = (self) => {
  return {
    _tag    : ButtonPremium,
    type    : Discord.MessageComponentTypes.BUTTON,
    style   : Discord.ButtonStyleTypes.PREMIUM,
    sku_id  : self.props.sku_id,
    disabled: self.props.disabled,
  };
};

export const Button = 'button';
export const ButtonProps = S.Struct({
  custom_id: S.optional(S.String),
  style    : S.optional(S.Literal(1, 2, 3, 4, 5, 6)),
  label    : S.optional(S.String),
  emoji    : S.optional(EmojiProps),
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

export const ButtonRow = 'actions';
export const ButtonRowProps = S.Struct({});
export const ButtonRowChildren = S.Struct({});
export const ButtonRowJSON = S.TaggedStruct(ButtonRow, DiscordIO.ButtonRowOutput.fields);
export const ButtonRowEncode: Encoder<typeof ButtonRow> = (self) => {
  return {
    _tag      : ButtonRow,
    type      : Discord.MessageComponentTypes.ACTION_ROW,
    components: self.acc[Norm.COMPONENTS]!,
  };
};

/**
 * SelectString Components
 */
export const SelectStringOption = 'option';
export const SelectStringOptionProps = S.Struct({
  label      : S.String,
  value      : S.String,
  description: S.optional(S.String),
  emoji      : S.optional(EmojiProps),
  default    : S.optional(S.Boolean),
});
export const SelectStringOptionChildren = S.Struct({});
export const SelectStringOptionJSON = S.Any;
export const SelectStringOptionEncode: Encoder<typeof SelectStringOption> = (self) => {
  return {
    value      : self.props.value,
    label      : self.props.label,
    description: self.props.description ?? self.acc.primitive?.[0],
    emoji      : self.props.emoji ?? self.acc[Emoji]?.[0],
    default    : self.props.default,
  };
};

export const SelectString = 'select';
export const SelectStringProps = S.Struct({
  custom_id  : S.optional(S.String),
  placeholder: S.optional(S.String),
  max_values : S.optional(S.Number),
  min_values : S.optional(S.Number),
  options    : S.optional(S.Array(SelectStringOptionProps)),
  disabled   : S.optional(S.Boolean),
  onselect   : S.optional(Rest.Handler(S.Any)),
});
export const SelectStringChildren = S.Struct({});
export const SelectStringJSON = S.Any; // todo fixme
export const SelectStringEncode: Encoder<typeof SelectString> = (self) => {
  return {
    type      : Discord.MessageComponentTypes.ACTION_ROW,
    components: [{
      type       : Discord.MessageComponentTypes.STRING_SELECT,
      custom_id  : self.props.custom_id ?? self.step,
      placeholder: self.props.placeholder ?? self.acc.primitive?.[0],
      options    : self.props.options ?? self.acc[SelectStringOption],
      min_values : self.props.min_values,
      max_values : self.props.max_values,
      disabled   : self.props.disabled,
    }],
  };
};

export const SelectDefaultValue = 'default';
export const SelectDefaultValueProps = S.Union(
  S.Struct({role: S.String}),
  S.Struct({user: S.String}),
  S.Struct({channel: S.String}),
);
export const DefaultValueChildren = S.Struct({});
export const DefaultValueJSON = S.Any; // todo fixme
export const SelectDefaultValueEncode: Encoder<typeof SelectDefaultValue> = (self) => {
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

export const SelectChannels = 'channels';
export const SelectChannelsProps = S.Struct({
  custom_id    : S.optional(S.String),
  placeholder  : S.optional(S.String),
  min_values   : S.optional(S.Number),
  max_values   : S.optional(S.Number),
  channel_types: S.optional(S.Array(S.Int)),
  disabled     : S.optional(S.Boolean),
  onselect     : S.optional(Rest.Handler(S.Any)),
});
export const SelectChannelsChildren = S.Struct({});
export const SelectChannelsJSON = S.Any; // todo fixme
export const SelectChannelsEncode: Encoder<typeof SelectChannels> = (self) => {
  return {
    type      : Discord.MessageComponentTypes.ACTION_ROW,
    components: [{
      type          : Discord.MessageComponentTypes.CHANNEL_SELECT,
      custom_id     : self.props.custom_id ?? self.step,
      placeholder   : self.props.placeholder ?? self.acc.primitive?.[0],
      min_values    : self.props.min_values,
      max_values    : self.props.max_values,
      channel_types : self.props.channel_types,
      default_values: self.acc[SelectDefaultValue],
      disabled      : self.props.disabled,
    }],
  };
};

export const SelectMentions = 'mentions';
export const SelectMentionsProps = S.Struct({
  custom_id  : S.optional(S.String),
  placeholder: S.optional(S.String),
  min_values : S.optional(S.Number),
  max_values : S.optional(S.Number),
  disabled   : S.optional(S.Boolean),
  onselect   : S.optional(Rest.Handler(S.Any)),
});
export const SelectMentionsChildren = S.Struct({});
export const SelectMentionsJSON = S.Any; // todo fixme
export const SelectMentionsEncode: Encoder<typeof SelectMentions> = (self) => {
  return {
    type      : Discord.MessageComponentTypes.ACTION_ROW,
    components: [{
      type          : Discord.MessageComponentTypes.MENTIONABLE_SELECT,
      custom_id     : self.props.custom_id ?? self.step,
      placeholder   : self.props.placeholder ?? self.acc.primitive?.[0],
      min_values    : self.props.min_values,
      max_values    : self.props.max_values,
      default_values: self.acc[SelectDefaultValue],
    }],
  };
};

export const SelectRoles = 'roles';
export const SelectRolesProps = S.Struct({
  custom_id  : S.optional(S.String),
  placeholder: S.optional(S.String),
  min_values : S.optional(S.Number),
  max_values : S.optional(S.Number),
  disabled   : S.optional(S.Boolean),
  onselect   : S.optional(Rest.Handler(S.Any)),
});
export const SelectRolesChildren = S.Struct({});
export const SelectRolesJSON = S.Any; // todo fixme
export const SelectRolesEncode: Encoder<typeof SelectRoles> = (self) => {
  return {
    type      : Discord.MessageComponentTypes.ACTION_ROW,
    components: [{
      type          : Discord.MessageComponentTypes.ROLE_SELECT,
      custom_id     : self.props.custom_id ?? self.step,
      placeholder   : self.props.placeholder ?? self.acc.primitive?.[0],
      min_values    : self.props.min_values,
      max_values    : self.props.max_values,
      default_values: self.acc[SelectDefaultValue],
    }],
  };
};

export const SelectUsers = 'users';
export const SelectUsersProps = S.Struct({
  custom_id  : S.optional(S.String),
  placeholder: S.optional(S.String),
  min_values : S.optional(S.Number),
  max_values : S.optional(S.Number),
  disabled   : S.optional(S.Boolean),
  onselect   : S.optional(Rest.Handler(S.Any)),
});
export const SelectUsersChildren = S.Struct({});
export const SelectUsersJSON = S.Any; // todo fixme
export const SelectUsersEncode: Encoder<typeof SelectUsers> = (self) => {
  return {
    type      : Discord.MessageComponentTypes.ACTION_ROW,
    components: [{
      type          : Discord.MessageComponentTypes.USER_SELECT,
      custom_id     : self.props.custom_id ?? self.step,
      placeholder   : self.props.placeholder ?? self.acc[Norm.PRIMITIVE]?.[0],
      min_values    : self.props.min_values,
      max_values    : self.props.max_values,
      default_values: self.acc[SelectDefaultValue],
    }],
  };
};

/**
 * Modal
 */
export const ModalTextInput = 'textarea';
export const ModalTextInputProps = S.Struct({
  custom_id  : S.optional(S.String),
  label      : S.optional(S.String),
  style      : S.optional(S.Enums(Discord.TextInputStyleTypes)),
  min_length : S.optional(S.Number),
  max_length : S.optional(S.Number),
  required   : S.optional(S.Boolean),
  value      : S.optional(S.String),
  placeholder: S.optional(S.String),
});
export const ModalTextInputChildren = S.Struct({});
export const ModalTextInputJSON = S.TaggedStruct(ModalTextInput, DiscordIO.ModalRowOutput.fields);
export const ModalTextInputEncode: Encoder<typeof ModalTextInput> = (self) => {
  return {
    _tag      : ModalTextInput,
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
export const ModalProps = S.Struct({
  custom_id: S.optional(S.String),
  title    : S.String,
  onsubmit : S.optional(Rest.Handler(S.Any)),
});
export const ModalChildren = S.Struct({});
export const ModalJSON = S.TaggedStruct(Modal, DiscordIO.ModalOutput.fields);
export const ModalEncode: Encoder<typeof Modal> = (self) => {
  return {
    _tag      : Modal,
    custom_id : self.props.custom_id ?? self.step,
    title     : self.props.title,
    components: self.acc[Norm.COMPONENTS]!,
  };
};

/**
 * Generic Input
 */
export const Input = 'input';
export const InputProps = S.Union(
  S.Struct({
    type: S.Literal('button'),
  }),
);

/**
 * Components V2
 */
export const ContentTextDisplay = 'textdisplay';
export const ContentTextDisplayProps = S.Struct({
  content: S.String.pipe(S.maxLength(1024)),
});
export const TextDisplayJSON = DiscordIO.TextDisplayOutput;
export const ContentTextDisplayEncode: Encoder<typeof ContentTextDisplay> = (self) => {
  return {
    type   : Discord.MessageComponentTypes.TEXT_DISPLAY,
    content: '',
  };
};

export const ContentThumbnail = 'thumbnail';
export const ContentThumbnailProps = S.Struct({
  url        : S.String,
  description: S.optional(S.String),
  spoiler    : S.optional(S.Boolean),
});
export const ContentThumbnailJSON = DiscordIO.ThumbnailOutput;
export const ContentThumbnailEncode: Encoder<typeof ContentThumbnail> = (self) => {
  return {
    type       : Discord.MessageComponentTypes.THUMBNAIL,
    media      : {url: self.props.url},
    description: self.props.description ?? self.acc[Norm.PRIMITIVE]?.join(''),
    spoiler    : self.props.spoiler,
  };
};

export const ContentMediaGallery = 'gallery';
export const ContentMediaGalleryProps = S.Struct({});
export const ContentMediaGalleryJSON = DiscordIO.MediaGalleryOutput;
export const ContentMediaGalleryEncode: Encoder<typeof ContentMediaGallery> = (self) => {
  return {
    type : Discord.MessageComponentTypes.MEDIA_GALLERY,
    media: [],
  };
};

export const ContentFile = 'file';
export const ContentFileProps = S.Struct({});
export const FileJSON = DiscordIO.FileOutput;
export const ContentFileEncode: Encoder<typeof ContentFile> = (self) => {
  return {
    type: Discord.MessageComponentTypes.FILE,
    file: {url: ''},
  };
};

export const LayoutSection = 'section';
export const LayoutSectionProps = S.Struct({});
export const LayoutSectionJSON = DiscordIO.SectionOutput;
export const LayoutSectionEncode: Encoder<typeof LayoutSection> = (self) => {
  return {
    type      : Discord.MessageComponentTypes.SECTION,
    components: [],
    accessory : undefined as any, // todo
  };
};

export const LayoutSeparator = 'separator';
export const LayoutSeparatorProps = S.Struct({});
export const LayoutSeparatorJSON = DiscordIO.SeparatorOutput;
export const LayoutSeparatorEncode: Encoder<typeof LayoutSeparator> = (self) => {
  return {
    type: Discord.MessageComponentTypes.SEPARATOR,
  };
};

export const LayoutContainer = 'container';
export const LayoutContainerProps = S.Struct({});
export const LayoutContainerJSON = DiscordIO.ContainerOutput;
export const LayoutContainerEncode: Encoder<typeof LayoutContainer> = (self) => {
  return {
    type      : Discord.MessageComponentTypes.CONTAINER,
    components: [],
  };
};

/**
 * Embed
 */
export const EmbedAuthor = 'author';
export const EmbedAuthorProps = S.Struct({
  name: S.String,
  url : S.optional(S.String),
});
export const EmbedAuthorChildren = S.Struct({});
export const EmbedAuthorJSON = S.TaggedStruct(EmbedAuthor, DiscordIO.EmbedAuthorOutput.fields);
export const EmbedAuthorEncode: Encoder<typeof EmbedAuthor> = (self) => {
  return {
    _tag: EmbedAuthor,
    name: self.props.name ?? self.acc[Norm.PRIMITIVE]?.join(''),
    url : self.props.url,
  };
};

export const EmbedImage = 'img';
export const EmbedImageProps = S.Struct({
  url: S.String,
});
export const EmbedImageChildren = S.Struct({});
export const EmbedImageJSON = S.TaggedStruct(EmbedImage, DiscordIO.EmbedImageOutput.fields);
export const EmbedImageEncode: Encoder<typeof EmbedImage> = (self) => {
  return {
    _tag: EmbedImage,
    url : self.props.url,
  };
};

export const EmbedFooter = 'footer';
export const EmbedFooterProps = S.Struct({
  text: S.String,
});
export const EmbedFooterChildren = S.Struct({});
export const EmbedFooterJSON = S.TaggedStruct(EmbedFooter, DiscordIO.EmbedFooterOutput.fields);
export const EmbedFooterEncode: Encoder<typeof EmbedFooter> = (self) => {
  return {
    _tag: EmbedFooter,
    text: self.props.text ?? self.acc[Norm.PRIMITIVE]?.join(''),
  };
};

export const EmbedField = 'field';
export const EmbedFieldProps = S.Struct({
  name  : S.String,
  value : S.String,
  inline: S.optional(S.Boolean),
});
export const EmbedFieldChildren = S.Struct({});
export const EmbedFieldJSON = S.TaggedStruct(EmbedField, DiscordIO.EmbedFieldOutput.fields);
export const EmbedFieldEncode: Encoder<typeof EmbedField> = (self) => {
  return {
    _tag  : EmbedField,
    name  : self.props.name,
    value : self.props.value ?? self.acc[Norm.PRIMITIVE]?.join(''),
    inline: self.props.inline,
  };
};

export const Embed = 'embed';
export const EmbedProps = S.Struct({
  author     : S.optional(EmbedAuthorProps),
  title      : S.optional(S.String),
  description: S.optional(S.String),
  color      : S.optional(S.Int),
  url        : S.optional(S.String),
  image      : S.optional(EmbedImageProps),
  fields     : S.optional(S.Array(EmbedFieldProps)),
  footer     : S.optional(EmbedFooterProps),
});
export const EmbedChildren = S.Union();
export const EmbedJSON = S.Struct({
  author     : S.optional(EmbedAuthorProps),
  title      : S.optional(S.String),
  description: S.optional(S.String),
  color      : S.optional(S.Int),
  url        : S.optional(S.String),
  image      : S.optional(EmbedImageProps),
  fields     : S.optional(S.Array(EmbedFieldProps)),
  footer     : S.optional(EmbedFooterProps),
});
export const EmbedEncode: Encoder<typeof Embed> = (self) => {
  return {
    author     : self.props.author ?? self.acc.author?.[0],
    title      : self.props.title,
    description: self.props.description ?? self.acc[Norm.PRIMITIVE]?.join(''),
    color      : self.props.color,
    url        : self.props.url,
    image      : self.props.image ?? self.acc[EmbedImage]?.[0],
    fields     : self.props.fields ?? self.acc[EmbedField],
    footer     : self.props.footer ?? self.acc.footer?.[0],
  };
};

/**
 * V1 Containers
 */
export const LayoutMessage = 'message';
export const LayoutMessageProps = S.Struct({
  display: S.optional(S.Literal('public', 'ephemeral')),
  content: S.optional(S.String),
  flags  : S.optional(S.Number),
});
export const MessageChildren = S.Struct({});
export const MessageJSON = S.TaggedStruct(LayoutMessage, DiscordIO.MessageV1Output.fields);
export const LayoutMessageEncode: Encoder<typeof LayoutMessage> = (self) => {
  return {
    _tag      : LayoutMessage,
    content   : self.props.content ?? self.acc[Norm.PRIMITIVE]?.[0] ?? undefined,
    embeds    : self.acc[Embed],
    components: self.acc[Norm.COMPONENTS],
    flags     : self.props.flags ?? self.props.display === 'ephemeral' ? 64 : undefined,
  };
};

export const LayoutEphemeral = 'ephemeral';
export const LayoutEphemeralProps = S.Struct({
  content: S.optional(S.String),
  flags  : S.optional(S.Number),
});
export const EphemeralChildren = S.Struct({});
export const EphemeralJSON = S.TaggedStruct(LayoutEphemeral, DiscordIO.EphemeralV1Output.fields);
export const LayoutEphemeralEncode: Encoder<typeof LayoutEphemeral> = (self) => {
  return {
    _tag      : LayoutEphemeral,
    content   : self.props.content ?? self.acc[Norm.PRIMITIVE]?.[0] ?? undefined,
    embeds    : self.acc[Embed],
    components: self.acc[Norm.COMPONENTS],
    flags     : 64,
  };
};

export const Encoders: { [T in keyof Props]: Encoder<T>; } = {
  [Emoji]                : EmojiEncode,
  [MarkdownAnchor]       : MarkdownAnchorEncode,
  [MarkdownMaskAnchor]   : MaskAnchorEncode,
  [MarkdownAtMention]    : MarkdownAtMentionEncode,
  [MarkdownTime]         : MarkdownTimeEncode,
  [MarkdownBold]         : MarkdownBoldEncode,
  [MarkdownItalic]       : MarkdownItalicEncode,
  [MarkdownUnderline]    : MarkdownUnderlineEncode,
  [MarkdownStrike]       : MarkdownStrikeEncode,
  [MarkdownDetails]      : MarkdownDetailsEncode,
  [MarkdownCode]         : MarkdownCodeEncode,
  [MarkdownCodeBlock]    : MarkdownCodeBlockEncode,
  [MarkdownBlockquote]   : MarkdownBlockquoteEncode,
  [MarkdownBreak]        : MarkdownBreakEncode,
  [MarkdownParagraph]    : MarkdownParagraphEncode,
  [MarkdownH1]           : MarkdownH1Encode,
  [MarkdownH2]           : MarkdownH2Encode,
  [MarkdownH3]           : MarkdownH3Encode,
  [MarkdownSubheader]    : MarkdownSubheaderEncode,
  [MarkdownListItem]     : MarkdownListItemEncode,
  [MarkdownOrderedList]  : MarkdownOrderedListEncode,
  [MarkdownUnorderedList]: MarkdownUnorderedListEncode,
  [ButtonPrimary]        : ButtonPrimaryEncode,
  [ButtonSecondary]      : ButtonSecondaryEncode,
  [ButtonSuccess]        : ButtonSuccessEncode,
  [ButtonDanger]         : ButtonDangerEncode,
  [ButtonLink]           : ButtonLinkEncode,
  [ButtonPremium]        : ButtonPremiumEncode,
  [Button]               : ButtonEncode,
  [ButtonRow]            : ButtonRowEncode,
  [SelectStringOption]   : SelectStringOptionEncode,
  [SelectString]         : SelectStringEncode,
  [SelectDefaultValue]   : SelectDefaultValueEncode,
  [SelectChannels]       : SelectChannelsEncode,
  [SelectMentions]       : SelectMentionsEncode,
  [SelectRoles]          : SelectRolesEncode,
  [SelectUsers]          : SelectUsersEncode,
  [ContentTextDisplay]   : ContentTextDisplayEncode,
  [ContentThumbnail]     : ContentThumbnailEncode,
  [ContentMediaGallery]  : ContentMediaGalleryEncode,
  [ContentFile]          : ContentFileEncode,
  [LayoutSection]        : LayoutSectionEncode,
  [LayoutSeparator]      : LayoutSeparatorEncode,
  [LayoutContainer]      : LayoutContainerEncode,
  [EmbedAuthor]          : EmbedAuthorEncode,
  [EmbedImage]           : EmbedImageEncode,
  [EmbedField]           : EmbedFieldEncode,
  [EmbedFooter]          : EmbedFooterEncode,
  [Embed]                : EmbedEncode,
  [LayoutMessage]        : LayoutMessageEncode,
  [LayoutEphemeral]      : LayoutEphemeralEncode,
  [Modal]                : ModalEncode,
  [ModalTextInput]       : ModalTextInputEncode,
};

const validatePropsConfig: AST.ParseOptions = {
  onExcessProperty: 'error',
  propertyOrder   : 'original',
};

const propsValidators = {
  [Emoji]                : S.validateSync(EmojiProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [MarkdownAnchor]       : S.validateSync(MarkdownAnchorProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [MarkdownMaskAnchor]   : S.validateSync(MarkdownMaskAnchorProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [MarkdownAtMention]    : S.validateSync(MarkdownAtMentionProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [MarkdownTime]         : S.validateSync(MarkdownTimeProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [MarkdownBold]         : S.validateSync(MarkdownBoldProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [MarkdownItalic]       : S.validateSync(MarkdownItalicProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [MarkdownUnderline]    : S.validateSync(MarkdownUnderlineProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [MarkdownStrike]       : S.validateSync(MarkdownStrikeProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [MarkdownDetails]      : S.validateSync(MarkdownDetailsProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [MarkdownCode]         : S.validateSync(MarkdownCodeProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [MarkdownCodeBlock]    : S.validateSync(MarkdownCodeBlockProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [MarkdownBlockquote]   : S.validateSync(MarkdownBlockquoteProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [MarkdownBreak]        : S.validateSync(MarkdownBreakProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [MarkdownParagraph]    : S.validateSync(MarkdownParagraphProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [MarkdownH1]           : S.validateSync(MarkdownH1Props.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [MarkdownH2]           : S.validateSync(MarkdownH2Props.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [MarkdownH3]           : S.validateSync(MarkdownH3Props.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [MarkdownSubheader]    : S.validateSync(MarkdownSubheaderProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [MarkdownListItem]     : S.validateSync(MarkdownListItemProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [MarkdownOrderedList]  : S.validateSync(MarkdownOrderedListProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [MarkdownUnorderedList]: S.validateSync(MarkdownUnorderedListProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [ButtonPrimary]        : S.validateSync(ButtonPrimaryProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [ButtonSecondary]      : S.validateSync(ButtonSecondaryProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [ButtonSuccess]        : S.validateSync(ButtonSuccessProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [ButtonDanger]         : S.validateSync(ButtonDangerProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [ButtonLink]           : S.validateSync(ButtonLinkProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [ButtonPremium]        : S.validateSync(ButtonPremiumProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [Button]               : S.validateSync(ButtonProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [ButtonRow]            : S.validateSync(ButtonRowProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [SelectStringOption]   : S.validateSync(SelectStringOptionProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [SelectString]         : S.validateSync(SelectStringProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [SelectDefaultValue]   : S.validateSync(SelectDefaultValueProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [SelectChannels]       : S.validateSync(SelectChannelsProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [SelectMentions]       : S.validateSync(SelectMentionsProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [SelectRoles]          : S.validateSync(SelectRolesProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [SelectUsers]          : S.validateSync(SelectUsersProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [ContentTextDisplay]   : S.validateSync(ContentTextDisplayProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [ContentThumbnail]     : S.validateSync(ContentThumbnailProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [ContentMediaGallery]  : S.validateSync(ContentMediaGalleryProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [ContentFile]          : S.validateSync(ContentFileProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [LayoutSection]        : S.validateSync(LayoutSectionProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [LayoutSeparator]      : S.validateSync(LayoutSeparatorProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [LayoutContainer]      : S.validateSync(LayoutContainerProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [EmbedAuthor]          : S.validateSync(EmbedAuthorProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [EmbedImage]           : S.validateSync(EmbedImageProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [EmbedField]           : S.validateSync(EmbedFieldProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [EmbedFooter]          : S.validateSync(EmbedFooterProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [Embed]                : S.validateSync(EmbedProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [LayoutMessage]        : S.validateSync(LayoutMessageProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [LayoutEphemeral]      : S.validateSync(LayoutEphemeralProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [Modal]                : S.validateSync(ModalProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
  [ModalTextInput]       : S.validateSync(ModalTextInputProps.pipe(S.extend(S.Struct({children: S.optional(S.Any)}))), validatePropsConfig),
};

export const jsxValidateDEV = (jsx: Jsx.Jsx) => {
  if (typeof jsx.type !== 'string') {
    throw new Error();
  }
  if (!(jsx.type in propsValidators)) {
    throw new Error(`Invalid element type: ${jsx.type}`);
  }
  const validator = propsValidators[jsx.type as keyof Props];

  validator(jsx.props);
};

export interface Props {
  [Emoji]                : typeof EmojiProps.Type;
  [MarkdownAnchor]       : typeof MarkdownAnchorProps.Type;
  [MarkdownAtMention]    : typeof MarkdownAtMentionProps.Type;
  [MarkdownBold]         : typeof MarkdownBoldProps.Type;
  [MarkdownBlockquote]   : typeof MarkdownBlockquoteProps.Type;
  [MarkdownBreak]        : typeof MarkdownBreakProps.Type;
  [MarkdownCode]         : typeof MarkdownCodeProps.Type;
  [MarkdownDetails]      : typeof MarkdownDetailsProps.Type;
  [MarkdownParagraph]    : typeof MarkdownParagraphProps.Type;
  [MarkdownH1]           : typeof MarkdownH1Props.Type;
  [MarkdownH2]           : typeof MarkdownH2Props.Type;
  [MarkdownH3]           : typeof MarkdownH3Props.Type;
  [MarkdownItalic]       : typeof MarkdownItalicProps.Type;
  [MarkdownListItem]     : typeof MarkdownListItemProps.Type;
  [MarkdownMaskAnchor]   : typeof MarkdownMaskAnchorProps.Type;
  [MarkdownOrderedList]  : typeof MarkdownOrderedListProps.Type;
  [MarkdownCodeBlock]    : typeof MarkdownCodeBlockProps.Type;
  [MarkdownStrike]       : typeof MarkdownStrikeProps.Type;
  [MarkdownSubheader]    : typeof MarkdownSubheaderProps.Type;
  [MarkdownTime]         : typeof MarkdownTimeProps.Type;
  [MarkdownUnderline]    : typeof MarkdownUnderlineProps.Type;
  [MarkdownUnorderedList]: typeof MarkdownUnorderedListProps.Type;
  [ButtonPrimary]        : typeof ButtonPrimaryProps.Type;
  [ButtonSecondary]      : typeof ButtonSecondaryProps.Type;
  [ButtonSuccess]        : typeof ButtonSuccessProps.Type;
  [ButtonDanger]         : typeof ButtonDangerProps.Type;
  [ButtonLink]           : typeof ButtonLinkProps.Type;
  [ButtonPremium]        : typeof ButtonPremiumProps.Type;
  [Button]               : typeof ButtonProps.Type;
  [ButtonRow]            : typeof ButtonRowProps.Type;
  [SelectStringOption]   : typeof SelectStringOptionProps.Type;
  [SelectString]         : typeof SelectStringProps.Type;
  [SelectDefaultValue]   : typeof SelectDefaultValueProps.Type;
  [SelectChannels]       : typeof SelectChannelsProps.Type;
  [SelectMentions]       : typeof SelectMentionsProps.Type;
  [SelectRoles]          : typeof SelectRolesProps.Type;
  [SelectUsers]          : typeof SelectUsersProps.Type;
  [ContentTextDisplay]   : typeof ContentTextDisplayProps.Type;
  [ContentThumbnail]     : typeof ContentThumbnailProps.Type;
  [ContentMediaGallery]  : typeof ContentMediaGalleryProps.Type;
  [ContentFile]          : typeof ContentFileProps.Type;
  [LayoutSection]        : typeof LayoutSectionProps.Type;
  [LayoutSeparator]      : typeof LayoutSeparatorProps.Type;
  [LayoutContainer]      : typeof LayoutContainerProps.Type;
  [EmbedAuthor]          : typeof EmbedAuthorProps.Type;
  [Embed]                : typeof EmbedProps.Type;
  [EmbedImage]           : typeof EmbedImageProps.Type;
  [EmbedField]           : typeof EmbedFieldProps.Type;
  [EmbedFooter]          : typeof EmbedFooterProps.Type;
  [LayoutMessage]        : typeof LayoutMessageProps.Type;
  [LayoutEphemeral]      : typeof LayoutEphemeralProps.Type;
  [Modal]                : typeof ModalProps.Type;
  [ModalTextInput]       : typeof ModalTextInputProps.Type;
};

export type Elements = {
  [T in keyof Props]: Props[T] & {children?: any};
};

export interface Children {
  [Emoji]                : typeof EmojiChildren.Type;
  [MarkdownAnchor]       : typeof MarkdownAnchorChildren.Type;
  [MarkdownAtMention]    : typeof MarkdownAtMentionChildren.Type;
  [MarkdownBold]         : typeof MarkdownBoldChildren.Type;
  [MarkdownBlockquote]   : typeof MarkdownBlockquoteChildren.Type;
  [MarkdownBreak]        : typeof MarkdownBreakChildren.Type;
  [MarkdownCode]         : typeof MarkdownCodeChildren.Type;
  [MarkdownDetails]      : typeof MarkdownDetailsChildren.Type;
  [MarkdownParagraph]    : typeof MarkdownParagraphChildren.Type;
  [MarkdownH1]           : typeof MarkdownH1Children.Type;
  [MarkdownH2]           : typeof MarkdownH2Children.Type;
  [MarkdownH3]           : typeof MarkdownH3Children.Type;
  [MarkdownItalic]       : typeof MarkdownItalicChildren.Type;
  [MarkdownListItem]     : typeof MarkdownListItemChildren.Type;
  [MarkdownMaskAnchor]   : typeof MarkdownMaskAnchorChildren.Type;
  [MarkdownOrderedList]  : typeof MarkdownOrderedListChildren.Type;
  [MarkdownCodeBlock]    : typeof MarkdownCodeBlockChildren.Type;
  [MarkdownStrike]       : typeof MarkdownStrikeChildren.Type;
  [MarkdownSubheader]    : typeof MarkdownSubheaderChildren.Type;
  [MarkdownTime]         : typeof MarkdownTimeChildren.Type;
  [MarkdownUnderline]    : typeof MarkdownUnderlineChildren.Type;
  [MarkdownUnorderedList]: typeof MarkdownUnorderedListChildren.Type;
  [ButtonPrimary]        : typeof ButtonPrimaryChildren.Type;
  [ButtonSecondary]      : typeof ButtonSecondaryChildren.Type;
  [ButtonSuccess]        : typeof ButtonSuccessChildren.Type;
  [ButtonDanger]         : typeof ButtonDangerChildren.Type;
  [ButtonLink]           : typeof ButtonLinkChildren.Type;
  [ButtonPremium]        : typeof ButtonPremiumChildren.Type;
  [Button]               : typeof ButtonChildren.Type;
  [ButtonRow]            : typeof ButtonRowChildren.Type;
  [SelectStringOption]   : typeof SelectStringOptionChildren.Type;
  [SelectString]         : typeof SelectStringChildren.Type;
  [SelectDefaultValue]   : typeof DefaultValueChildren.Type;
  [SelectChannels]       : typeof SelectChannelsChildren.Type;
  [SelectMentions]       : typeof SelectMentionsChildren.Type;
  [SelectRoles]          : typeof SelectRolesChildren.Type;
  [SelectUsers]          : typeof SelectUsersChildren.Type;
  [EmbedAuthor]          : typeof EmbedAuthorChildren.Type;
  [Embed]                : typeof EmbedChildren.Type;
  [EmbedImage]           : typeof EmbedImageChildren.Type;
  [EmbedField]           : typeof EmbedFieldChildren.Type;
  [EmbedFooter]          : typeof EmbedFooterChildren.Type;
  [LayoutMessage]        : typeof MessageChildren.Type;
  [LayoutEphemeral]      : typeof EphemeralChildren.Type;
  [Modal]                : typeof ModalChildren.Type;
  [ModalTextInput]       : typeof ModalTextInputChildren.Type;
}

export interface Encodings {
  [Emoji]                : typeof EmojiJSON.Type;
  [MarkdownAnchor]       : typeof MarkdownAnchorJSON.Type;
  [MarkdownAtMention]    : typeof MarkdownAtMentionJSON.Type;
  [MarkdownBold]         : typeof MarkdownBoldJSON.Type;
  [MarkdownBlockquote]   : typeof MarkdownBlockquoteJSON.Type;
  [MarkdownBreak]        : typeof MarkdownBreakJSON.Type;
  [MarkdownCode]         : typeof MarkdownCodeJSON.Type;
  [MarkdownDetails]      : typeof MarkdownDetailsJSON.Type;
  [MarkdownParagraph]    : typeof MarkdownParagraphJSON.Type;
  [MarkdownH1]           : typeof MarkdownH1JSON.Type;
  [MarkdownH2]           : typeof MarkdownH2JSON.Type;
  [MarkdownH3]           : typeof MarkdownH3JSON.Type;
  [MarkdownItalic]       : typeof MarkdownItalicJSON.Type;
  [MarkdownListItem]     : typeof MarkdownListItemJSON.Type;
  [MarkdownMaskAnchor]   : typeof MarkdownMaskAnchorJSON.Type;
  [MarkdownOrderedList]  : typeof MarkdownOrderedListJSON.Type;
  [MarkdownCodeBlock]    : typeof MarkdownCodeBlockJSON.Type;
  [MarkdownStrike]       : typeof MarkdownStrikeJSON.Type;
  [MarkdownSubheader]    : typeof MarkdownSubheaderJSON.Type;
  [MarkdownTime]         : typeof MarkdownTimeJSON.Type;
  [MarkdownUnderline]    : typeof MarkdownUnderlineJSON.Type;
  [MarkdownUnorderedList]: typeof MarkdownUnorderedListJSON.Type;
  [ButtonPrimary]        : typeof ButtonPrimaryJSON.Type;
  [ButtonSecondary]      : typeof ButtonSecondaryJSON.Type;
  [ButtonSuccess]        : typeof ButtonSuccessJSON.Type;
  [ButtonDanger]         : typeof ButtonDangerJSON.Type;
  [ButtonLink]           : typeof ButtonLinkJSON.Type;
  [ButtonPremium]        : typeof ButtonPremiumJSON.Type;
  [Button]               : typeof ButtonJSON.Type;
  [ButtonRow]            : typeof ButtonRowJSON.Type;
  [SelectStringOption]   : typeof SelectStringOptionJSON.Type;
  [SelectString]         : typeof SelectStringJSON.Type;
  [SelectDefaultValue]   : typeof DefaultValueJSON.Type;
  [SelectChannels]       : typeof SelectChannelsJSON.Type;
  [SelectMentions]       : typeof SelectMentionsJSON.Type;
  [SelectRoles]          : typeof SelectRolesJSON.Type;
  [SelectUsers]          : typeof SelectUsersJSON.Type;
  [ContentTextDisplay]   : typeof TextDisplayJSON.Type;
  [ContentThumbnail]     : typeof ContentThumbnailJSON.Type;
  [LayoutSection]        : typeof LayoutSectionJSON.Type;
  [ContentMediaGallery]  : typeof ContentMediaGalleryJSON.Type;
  [ContentFile]          : typeof FileJSON.Type;
  [LayoutSeparator]      : typeof LayoutSeparatorJSON.Type;
  [LayoutContainer]      : typeof LayoutContainerJSON.Type;
  [EmbedAuthor]          : typeof EmbedAuthorJSON.Type;
  [Embed]                : typeof EmbedJSON.Type;
  [EmbedImage]           : typeof EmbedImageJSON.Type;
  [EmbedField]           : typeof EmbedFieldJSON.Type;
  [EmbedFooter]          : typeof EmbedFooterJSON.Type;
  [LayoutMessage]        : typeof MessageJSON.Type;
  [LayoutEphemeral]      : typeof EphemeralJSON.Type;
  [Modal]                : typeof ModalJSON.Type;
  [ModalTextInput]       : typeof ModalTextInputJSON.Type;
}

export type Encoder<T extends keyof Props> =
  (
    self: {
      type : T;
      props: Props[T];
      step : string;
      acc:
        {
          primitive? : string[];
          components?: any[];
        } &
        {
          [K in keyof Props]?: Encodings[K][]
        };
    },
  ) => Encodings[T];
