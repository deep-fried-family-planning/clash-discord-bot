import {SnowFlake} from '#src/disreact/codec/common/value.ts';
import * as DFMD from '#src/disreact/codec/common/dfmd.ts';
import {S} from '#src/internal/pure/effect.ts';



export const AtMentionTag = S.Literal(DFMD.at);

export const AtMentionAttributes = S.Struct({
  user   : S.optional(SnowFlake),
  role   : S.optional(SnowFlake),
  channel: S.optional(SnowFlake),
});



export const AnchorTag = S.Literal(DFMD.a);

export const AnchorAttributes = S.Struct({
  href : S.String,
  embed: S.optional(S.Boolean),
});



export const AnchorMaskTag = S.Literal(DFMD.mask);

export const AnchorMaskAttributes = S.Struct({
  href : S.String,
  embed: S.optional(S.Boolean),
});



export const BreakTag = S.Literal(DFMD.br);

export const BreakAttributes = S.Struct({});



export const PrePostFixTag = S.Literal(
  DFMD.p,
  DFMD.b,
  DFMD.i,
  DFMD.u,
  DFMD.s,
  DFMD.details,
  DFMD.code,
);

export const PrePostFixAttributes = S.Struct({});



export const PrefixTag = S.Literal(
  DFMD.h1,
  DFMD.h2,
  DFMD.h3,
  DFMD.small,
);

export const PrefixAttributes = S.Struct({});



export const BlockQuoteTag = S.Literal(DFMD.blockquote);

export const BlockQuoteAttributes = S.Struct({});



export const BlockCodeTag = S.Literal(DFMD.pre);

export const BlockCodeAttributes = S.Struct({});



export const IndentTag = S.Literal(
  DFMD.ol,
  DFMD.ul,
  DFMD.li,
);

export const IndentAttributes = S.Struct({});



export type AtMentionTag = S.Schema.Type<typeof AtMentionTag>;
export type AnchorTag = S.Schema.Type<typeof AnchorTag>;
export type AnchorMaskTag = S.Schema.Type<typeof AnchorMaskTag>;
export type BreakTag = S.Schema.Type<typeof BreakTag>;
export type PrePostFixTag = S.Schema.Type<typeof PrePostFixTag>;
export type PrefixTag = S.Schema.Type<typeof PrefixTag>;
export type BlockQuoteTag = S.Schema.Type<typeof BlockQuoteTag>;
export type BlockCodeTag = S.Schema.Type<typeof BlockCodeTag>;
export type IndentTag = S.Schema.Type<typeof IndentTag>;

export type AtMentionAttributes = S.Schema.Type<typeof AtMentionAttributes>;
export type AnchorAttributes = S.Schema.Type<typeof AnchorAttributes>;
export type AnchorMaskAttributes = S.Schema.Type<typeof AnchorMaskAttributes>;
export type BreakAttributes = S.Schema.Type<typeof BreakAttributes>;
export type PrePostFixAttributes = S.Schema.Type<typeof PrePostFixAttributes>;
export type PrefixAttributes = S.Schema.Type<typeof PrefixAttributes>;
export type BlockQuoteAttributes = S.Schema.Type<typeof BlockQuoteAttributes>;
export type BlockCodeAttributes = S.Schema.Type<typeof BlockCodeAttributes>;
export type IndentAttributes = S.Schema.Type<typeof IndentAttributes>;



export const dsxDEV_validators_attributes = {
  [DFMD.at]        : S.validateSync(AtMentionAttributes),
  [DFMD.a]         : S.validateSync(AnchorAttributes),
  [DFMD.mask]      : S.validateSync(AnchorMaskAttributes),
  [DFMD.br]        : S.validateSync(BreakAttributes),
  [DFMD.p]         : S.validateSync(PrePostFixAttributes),
  [DFMD.b]         : S.validateSync(PrePostFixAttributes),
  [DFMD.i]         : S.validateSync(PrePostFixAttributes),
  [DFMD.u]         : S.validateSync(PrePostFixAttributes),
  [DFMD.s]         : S.validateSync(PrePostFixAttributes),
  [DFMD.details]   : S.validateSync(PrePostFixAttributes),
  [DFMD.code]      : S.validateSync(PrePostFixAttributes),
  [DFMD.h1]        : S.validateSync(PrefixAttributes),
  [DFMD.h2]        : S.validateSync(PrefixAttributes),
  [DFMD.h3]        : S.validateSync(PrefixAttributes),
  [DFMD.small]     : S.validateSync(PrefixAttributes),
  [DFMD.blockquote]: S.validateSync(BlockQuoteAttributes),
  [DFMD.pre]       : S.validateSync(BlockCodeAttributes),
  [DFMD.ol]        : S.validateSync(IndentAttributes),
  [DFMD.ul]        : S.validateSync(IndentAttributes),
  [DFMD.li]        : S.validateSync(IndentAttributes),
};
