import * as Norm from '#src/disreact/adaptor/codec/intrinsic/norm.ts';
import * as Rest from '#src/disreact/adaptor/codec/rest-element.ts';
import * as BigInt from 'effect/BigInt';
import * as S from 'effect/Schema';

export const EMOJI = 'emoji';
export const EmojiAttributes = Rest.Attributes({
  name    : S.optional(S.String),
  id      : S.optional(S.String),
  animated: S.optional(S.Boolean),
});
export const encodeEmoji = (self: any, acc: any) => {
  return {
    name    : self.props.name,
    id      : self.props.id,
    animated: self.props.animated,
  };
};

export const ANCHOR = 'a';
export const AnchorAttributes = Rest.Attributes({
  href : S.String,
  embed: S.optional(S.Boolean),
});
export const encodeAnchor = (self: any, arg: any) => {
  if (self.props.embed) {
    return `${self.props.href}`;
  }
  return `<${self.props.href}>`;
};

export const AT_MENTION = 'at';
export const AtMentionAttributes = S.Union(
  Rest.Attributes({here: S.Boolean}),
  Rest.Attributes({everyone: S.Boolean}),
  Rest.Attributes({user: S.Union(S.String, S.Int)}),
Rest.Attributes({role: S.Union(S.String, S.Int)}),
Rest.Attributes({channel: S.Union(S.String, S.Int)}),
);
export const encodeAtMention = (self: any, arg: any) => {
  if (self.props.here) return '@here';
  if (self.props.everyone) return '@everyone';
  if (self.props.user) return `<@${self.props.user}>`;
  if (self.props.role) return `<@&${self.props.role}>`;
  if (self.props.channel) return `<#${self.props.channel}>`;
  return '';
};

export const BOLD = 'b';
export const BoldAttributes = Rest.Attributes({});
export const encodeBold = (self: any, arg: any) => {
  return `**${arg[Norm.PRIMITIVE][0]}**`;
};

export const BLOCKQUOTE = 'blockquote';
export const BlockquoteAttributes = Rest.Attributes({});
export const encodeBlockquote = (self: any, arg: any) => {
  return `> ${arg[Norm.PRIMITIVE][0]}`;
};

export const BREAK = 'br';
export const BreakAttributes = Rest.Attributes({});
export const encodeBreak = (self: any, arg: any) => {
  return '\n';
};

export const CODE = 'code';
export const CodeAttributes = Rest.Attributes({});
export const encodeCode = (self: any, arg: any) => {
  if (!self.props.lang) {
    return `\`${arg[Norm.PRIMITIVE][0]}\``;
  }
};

export const DETAILS = 'details';
export const DetailsAttributes = Rest.Attributes({});
export const encodeDetails = (self: any, arg: any) => {
  return '';
};

export const H1 = 'h1';
export const H1Attributes = Rest.Attributes({});
export const encodeH1 = (self: any, arg: any) => {
  return `# ${arg[Norm.PRIMITIVE][0]}`;
};

export const H2 = 'h2';
export const H2Attributes = Rest.Attributes({});
export const encodeH2 = (self: any, arg: any) => {
  return `## ${arg[Norm.PRIMITIVE][0]}`;
};

export const H3 = 'h3';
export const H3Attributes = Rest.Attributes({});
export const encodeH3 = (self: any, arg: any) => {
  return `### ${arg[Norm.PRIMITIVE][0]}`;
};

export const ITALIC = 'i';
export const ItalicAttributes = Rest.Attributes({});
export const encodeItalic = (self: any, arg: any) => {
  return `*${arg[Norm.PRIMITIVE][0]}*`;
};

export const LIST_ITEM = 'li';
export const ListItemAttributes = Rest.Attributes({});
export const encodeListItem = (self: any, arg: any) => {
  return `- ${arg[Norm.PRIMITIVE][0]}`;
};

export const MASK_ANCHOR = 'mask';
export const MaskAnchorAttributes = Rest.Attributes({
  href : S.String,
  embed: S.optional(S.Boolean),
});
export const encodeMaskAnchor = (self: any, arg: any) => {
  if (self.props.embed) {
    return `[${arg[Norm.PRIMITIVE][0]}](${self.props.href})`;
  }
  return `[${arg[Norm.PRIMITIVE][0]}](<${self.props.href}>)`;
};

export const ORDERED_LIST = 'ol';
export const OrderedListAttributes = Rest.Attributes({});
export const encodeOrderedList = (self: any, arg: any) => {
  throw new Error('Not implemented');
};

export const PARAGRAPH = 'p';
export const ParagraphAttributes = Rest.Attributes({});
export const encodeParagraph = (self: any, arg: any) => {
  return `\n${arg[Norm.PRIMITIVE][0]}`;
};

export const PRE = 'pre';
export const PreAttributes = Rest.Attributes({
  lang: S.optional(S.String),
});
export const encodePre = (self: any, arg: any) => {
  if (!self.props.lang) {
    return `\`\`\`\n${arg[Norm.PRIMITIVE][0]}\n\`\`\``;
  }
  return `\`\`\`${self.props.lang}\n${arg[Norm.PRIMITIVE][0]}\n\`\`\``;
};

export const STRIKETHROUGH = 's';
export const StrikethroughAttributes = Rest.Attributes({});
export const encodeStrikethrough = (self: any, arg: any) => {
  return `~~${arg[Norm.PRIMITIVE][0]}~~`;
};

export const SMALL = 'small';
export const SmallAttributes = Rest.Attributes({});
export const encodeSmall = (self: any, arg: any) => {
  return `-# ${arg[Norm.PRIMITIVE][0]}`;
};

export const TIME = 'time';
export const TimeAttributes = S.Union(
  Rest.Attributes({d: S.Union(S.String, S.Int, S.BigInt)}),
  Rest.Attributes({D: S.Union(S.String, S.Int, S.BigInt)}),
  Rest.Attributes({t: S.Union(S.String, S.Int, S.BigInt)}),
  Rest.Attributes({T: S.Union(S.String, S.Int, S.BigInt)}),
  Rest.Attributes({f: S.Union(S.String, S.Int, S.BigInt)}),
  Rest.Attributes({F: S.Union(S.String, S.Int, S.BigInt)}),
  Rest.Attributes({R: S.Union(S.String, S.Int, S.BigInt)}),
);
export const encodeTime = (self: any, arg: any) => {
  const {d, D, t, T, f, F, R} = self.props;
  const input =
          d ??
          D ??
          t ??
          T ??
          f ??
          F ??
          R;
  const maybeNow = input === 'now'
    ? Date.now()
    : input;
  const time = typeof maybeNow === 'bigint'
    ? Number(BigInt.unsafeDivide(input, 1000n))
    : input;
  if (d) return `<t:${time}:d>`;
  if (D) return `<t:${time}:D>`;
  if (t) return `<t:${time}:t>`;
  if (T) return `<t:${time}:T>`;
  if (f) return `<t:${time}:f>`;
  if (F) return `<t:${time}:F>`;
  return `<t:${time}:R>`;
};

export const UNDERLINE = 'u';
export const UnderlineAttributes = Rest.Attributes({});
export const encodeUnderline = (self: any, arg: any) => {
  return `__${arg[Norm.PRIMITIVE][0]}__`;
};

export const UNORDERED_LIST = 'ul';
export const UnorderedListAttributes = Rest.Attributes({});
export const encodeUnorderedList = (self: any, arg: any) => {
  throw new Error('Not implemented');
};

export type EmojiAttributes = typeof EmojiAttributes.Type;
export type AnchorAttributes = typeof AnchorAttributes.Type;
export type AtMentionAttributes = typeof AtMentionAttributes.Type;
export type BoldAttributes = typeof BoldAttributes.Type;
export type BlockquoteAttributes = typeof BlockquoteAttributes.Type;
export type BreakAttributes = typeof BreakAttributes.Type;
export type CodeAttributes = typeof CodeAttributes.Type;
export type DetailsAttributes = typeof DetailsAttributes.Type;
export type H1Attributes = typeof H1Attributes.Type;
export type H2Attributes = typeof H2Attributes.Type;
export type H3Attributes = typeof H3Attributes.Type;
export type ItalicAttributes = typeof ItalicAttributes.Type;
export type ListItemAttributes = typeof ListItemAttributes.Type;
export type MaskAnchorAttributes = typeof MaskAnchorAttributes.Type;
export type OrderedListAttributes = typeof OrderedListAttributes.Type;
export type ParagraphAttributes = typeof ParagraphAttributes.Type;
export type PreAttributes = typeof PreAttributes.Type;
export type StrikethroughAttributes = typeof StrikethroughAttributes.Type;
export type SmallAttributes = typeof SmallAttributes.Type;
export type TimeAttributes = typeof TimeAttributes.Type;
export type UnderlineAttributes = typeof UnderlineAttributes.Type;
export type UnorderedListAttributes = typeof UnorderedListAttributes.Type;
