import {ButtonLabel, ConformantCustomId, EmojiStruct, SkuId} from '#src/disreact/codec/common/value.ts';
import * as DTML from '#src/disreact/codec/common/dtml.ts';
import {S} from '#src/internal/pure/effect.ts';



export const PrimaryStyle   = S.Literal(1);
export const SecondaryStyle = S.Literal(2);
export const SuccessStyle   = S.Literal(3);
export const DangerStyle    = S.Literal(4);
export const LinkStyle      = S.Literal(5);
export const PremiumStyle   = S.Literal(6);

export const Style = S.Union(
  PrimaryStyle,
  SecondaryStyle,
  SuccessStyle,
  DangerStyle,
  LinkStyle,
  PremiumStyle,
);

export const ButtonTag          = S.Literal(DTML.button);
export const PrimaryButtonTag   = S.Literal(DTML.primary);
export const SecondaryButtonTag = S.Literal(DTML.secondary);
export const SuccessTag         = S.Literal(DTML.success);
export const DangerTag          = S.Literal(DTML.danger);
export const LinkTag            = S.Literal(DTML.link);
export const PremiumTag         = S.Literal(DTML.premium);

export const Attributes = S.Struct({
  primary  : S.optional(S.Boolean),
  secondary: S.optional(S.Boolean),
  success  : S.optional(S.Boolean),
  danger   : S.optional(S.Boolean),
  link     : S.optional(S.Boolean),
  premium  : S.optional(S.Boolean),
  custom_id: S.optional(ConformantCustomId),
  label    : S.optional(ButtonLabel),
  emoji    : S.optional(EmojiStruct),
  style    : S.optional(Style),
  disabled : S.optional(S.Boolean),
  url      : S.optional(S.String),
  sku_id   : S.optional(SkuId),
  onclick  : S.optional(S.Unknown),
});

export const PrimaryAttributes   = S.Struct({
  custom_id: S.optional(ConformantCustomId),
  label    : S.optional(ButtonLabel),
  emoji    : S.optional(EmojiStruct),
  onclick  : S.Any,
});
export const SecondaryAttributes = PrimaryAttributes;
export const SuccessAttributes   = PrimaryAttributes;
export const DangerAttributes    = PrimaryAttributes;

export const LinkAttributes = S.Struct({
  url  : S.String,
  label: S.optional(ButtonLabel),
  emoji: S.optional(EmojiStruct),
});

export const PremiumAttributes = S.Struct({
  sku_id: SkuId,
});

export type Tag = S.Schema.Type<typeof ButtonTag>;
export type PrimaryTag = S.Schema.Type<typeof PrimaryButtonTag>;
export type SecondaryTag = S.Schema.Type<typeof SecondaryButtonTag>;
export type SuccessTag = S.Schema.Type<typeof SuccessTag>;
export type DangerTag = S.Schema.Type<typeof DangerTag>;
export type LinkTag = S.Schema.Type<typeof LinkTag>;
export type PremiumTag = S.Schema.Type<typeof PremiumTag>;

export type Attributes = S.Schema.Type<typeof Attributes>;
export type PrimaryAttributes = S.Schema.Type<typeof PrimaryAttributes>;
export type SecondaryAttributes = S.Schema.Type<typeof SecondaryAttributes>;
export type SuccessAttributes = S.Schema.Type<typeof SuccessAttributes>;
export type DangerAttributes = S.Schema.Type<typeof DangerAttributes>;
export type LinkAttributes = S.Schema.Type<typeof LinkAttributes>;
export type PremiumAttributes = S.Schema.Type<typeof PremiumAttributes>;

export const dsxDEV_validators = {
  [DTML.button]   : S.validateSync(Attributes),
  [DTML.primary]  : S.validateSync(PrimaryAttributes),
  [DTML.secondary]: S.validateSync(SecondaryAttributes),
  [DTML.success]  : S.validateSync(SuccessAttributes),
  [DTML.danger]   : S.validateSync(DangerAttributes),
  [DTML.link]     : S.validateSync(LinkAttributes),
  [DTML.premium]  : S.validateSync(PremiumAttributes),
};
