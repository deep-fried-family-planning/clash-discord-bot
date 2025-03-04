import {SnowFlake} from '#src/disreact/codec/constants/common.ts';
import * as DFMD from '#src/disreact/codec/constants/dfmd.ts';
import {Boolean, Literal, optional, type Schema, String, Struct, validateSync} from 'effect/Schema';



export const AtMentionTag = Literal(DFMD.at);

export const AtMentionAttributes = Struct({
  user   : optional(SnowFlake),
  role   : optional(SnowFlake),
  channel: optional(SnowFlake),
});



export const AnchorTag = Literal(DFMD.a);

export const AnchorAttributes = Struct({
  href : String,
  embed: optional(Boolean),
});



export const AnchorMaskTag = Literal(DFMD.mask);

export const AnchorMaskAttributes = Struct({
  href : String,
  embed: optional(Boolean),
});



export const BreakTag = Literal(DFMD.br);

export const BreakAttributes = Struct({});



export const PrePostFixTag = Literal(
  DFMD.p,
  DFMD.b,
  DFMD.i,
  DFMD.u,
  DFMD.s,
  DFMD.details,
  DFMD.code,
);

export const PrePostFixAttributes = Struct({});



export const PrefixTag = Literal(
  DFMD.h1,
  DFMD.h2,
  DFMD.h3,
  DFMD.small,
);

export const PrefixAttributes = Struct({});



export const BlockQuoteTag = Literal(DFMD.blockquote);

export const BlockQuoteAttributes = Struct({});



export const BlockCodeTag = Literal(DFMD.pre);

export const BlockCodeAttributes = Struct({});



export const IndentTag = Literal(
  DFMD.ol,
  DFMD.ul,
  DFMD.li,
);

export const IndentAttributes = Struct({});



export type AtMentionTag = Schema.Type<typeof AtMentionTag>;
export type AnchorTag = Schema.Type<typeof AnchorTag>;
export type AnchorMaskTag = Schema.Type<typeof AnchorMaskTag>;
export type BreakTag = Schema.Type<typeof BreakTag>;
export type PrePostFixTag = Schema.Type<typeof PrePostFixTag>;
export type PrefixTag = Schema.Type<typeof PrefixTag>;
export type BlockQuoteTag = Schema.Type<typeof BlockQuoteTag>;
export type BlockCodeTag = Schema.Type<typeof BlockCodeTag>;
export type IndentTag = Schema.Type<typeof IndentTag>;

export type AtMentionAttributes = Schema.Type<typeof AtMentionAttributes>;
export type AnchorAttributes = Schema.Type<typeof AnchorAttributes>;
export type AnchorMaskAttributes = Schema.Type<typeof AnchorMaskAttributes>;
export type BreakAttributes = Schema.Type<typeof BreakAttributes>;
export type PrePostFixAttributes = Schema.Type<typeof PrePostFixAttributes>;
export type PrefixAttributes = Schema.Type<typeof PrefixAttributes>;
export type BlockQuoteAttributes = Schema.Type<typeof BlockQuoteAttributes>;
export type BlockCodeAttributes = Schema.Type<typeof BlockCodeAttributes>;
export type IndentAttributes = Schema.Type<typeof IndentAttributes>;



export const validateAttributesDEV = {
  [DFMD.at]  : validateSync(AtMentionAttributes),
  [DFMD.a]   : validateSync(AnchorAttributes),
  [DFMD.mask]: validateSync(AnchorMaskAttributes),
  [DFMD.br]  : validateSync(BreakAttributes),

  [DFMD.p]      : validateSync(PrePostFixAttributes),
  [DFMD.b]      : validateSync(PrePostFixAttributes),
  [DFMD.i]      : validateSync(PrePostFixAttributes),
  [DFMD.u]      : validateSync(PrePostFixAttributes),
  [DFMD.s]      : validateSync(PrePostFixAttributes),
  [DFMD.details]: validateSync(PrePostFixAttributes),
  [DFMD.code]   : validateSync(PrePostFixAttributes),

  [DFMD.h1]   : validateSync(PrefixAttributes),
  [DFMD.h2]   : validateSync(PrefixAttributes),
  [DFMD.h3]   : validateSync(PrefixAttributes),
  [DFMD.small]: validateSync(PrefixAttributes),

  [DFMD.blockquote]: validateSync(BlockQuoteAttributes),

  [DFMD.pre]: validateSync(BlockCodeAttributes),

  [DFMD.ol]: validateSync(IndentAttributes),
  [DFMD.ul]: validateSync(IndentAttributes),
  [DFMD.li]: validateSync(IndentAttributes),
};
