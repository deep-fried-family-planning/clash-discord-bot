import {ButtonLabel, ConformantCustomId, EmojiStruct, IntrinsicKind, SkuId} from '#src/disreact/codec/constants/common.ts';
import * as DTML from '#src/disreact/codec/constants/dtml.ts';
import {S} from '#src/internal/pure/effect.ts';
import {Any, Boolean, Int, Literal, optional, type Schema, String, Struct, Union, Unknown, validateSync} from 'effect/Schema';



export namespace Button {
  export const TAG = 'button';
  export const Style = S.Literal('primary', 1, 'secondary', 2, 'success', 3, 'danger', 4, 'link', 5, 'premium', 6);
  export const Props = {};

  export const HANDLER = 'onclick';

  export namespace Primary {
    export const TAG = 'primary';
    export const Style = S.Literal();
  }

  export namespace Secondary {}

  export namespace Success {}

  export namespace Danger {}

  export namespace Link {}

  export namespace Premium {}
}



export const PrimaryStyle   = Literal(1);
export const SecondaryStyle = Literal(2);
export const SuccessStyle   = Literal(3);
export const DangerStyle    = Literal(4);
export const LinkStyle      = Literal(5);
export const PremiumStyle   = Literal(6);

export const Style = Union(
  PrimaryStyle,
  SecondaryStyle,
  SuccessStyle,
  DangerStyle,
  LinkStyle,
  PremiumStyle,
);



export const Data = Struct({
  custom_id     : String,
  component_type: Int,
});

export const EventData = Struct({});



export const ButtonTag          = Literal(DTML.button);
export const PrimaryButtonTag   = Literal(DTML.primary);
export const SecondaryButtonTag = Literal(DTML.secondary);
export const SuccessTag         = Literal(DTML.success);
export const DangerTag          = Literal(DTML.danger);
export const LinkTag            = Literal(DTML.link);
export const PremiumTag         = Literal(DTML.premium);



export const Attributes = Struct({
  primary  : optional(Boolean),
  secondary: optional(Boolean),
  success  : optional(Boolean),
  danger   : optional(Boolean),
  link     : optional(Boolean),
  premium  : optional(Boolean),
  custom_id: optional(ConformantCustomId),
  label    : optional(ButtonLabel),
  emoji    : optional(EmojiStruct),
  style    : optional(Style),
  disabled : optional(Boolean),
  url      : optional(String),
  sku_id   : optional(SkuId),
  onclick  : optional(Unknown),
});

export const PrimaryAttributes = Struct({
  custom_id: optional(ConformantCustomId),
  label    : optional(ButtonLabel),
  emoji    : optional(EmojiStruct),
  onclick  : Any,
});

export const SecondaryAttributes = PrimaryAttributes;

export const SuccessAttributes = PrimaryAttributes;

export const DangerAttributes = PrimaryAttributes;

export const LinkAttributes = Struct({
  url  : String,
  label: optional(ButtonLabel),
  emoji: optional(EmojiStruct),
});

export const PremiumAttributes = Struct({
  sku_id: SkuId,
});



export const Element = Struct({
  kind : IntrinsicKind,
  type : ButtonTag,
  props: Attributes,
});

export const PrimaryElement = Struct({
  kind : IntrinsicKind,
  type : PrimaryButtonTag,
  props: PrimaryAttributes,
});

export const SecondaryElement = Struct({
  kind : IntrinsicKind,
  type : SecondaryButtonTag,
  props: SecondaryAttributes,
});

export const SuccessElement = Struct({
  kind : IntrinsicKind,
  type : SuccessTag,
  props: SuccessAttributes,
});

export const DangerElement = Struct({
  kind : IntrinsicKind,
  type : DangerTag,
  props: DangerAttributes,
});

export const LinkElement = Struct({
  kind : IntrinsicKind,
  type : LinkTag,
  props: LinkAttributes,
});

export const PremiumElement = Struct({
  kind : IntrinsicKind,
  type : PremiumTag,
  props: PremiumAttributes,
});



export type Tag = Schema.Type<typeof ButtonTag>;
export type PrimaryTag = Schema.Type<typeof PrimaryButtonTag>;
export type SecondaryTag = Schema.Type<typeof SecondaryButtonTag>;
export type SuccessTag = Schema.Type<typeof SuccessTag>;
export type DangerTag = Schema.Type<typeof DangerTag>;
export type LinkTag = Schema.Type<typeof LinkTag>;
export type PremiumTag = Schema.Type<typeof PremiumTag>;


export type Attributes = Schema.Type<typeof Attributes>;
export type PrimaryAttributes = Schema.Type<typeof PrimaryAttributes>;
export type SecondaryAttributes = Schema.Type<typeof SecondaryAttributes>;
export type SuccessAttributes = Schema.Type<typeof SuccessAttributes>;
export type DangerAttributes = Schema.Type<typeof DangerAttributes>;
export type LinkAttributes = Schema.Type<typeof LinkAttributes>;
export type PremiumAttributes = Schema.Type<typeof PremiumAttributes>;



export const validateAttributesDEV = {
  [DTML.button]   : validateSync(Attributes),
  [DTML.primary]  : validateSync(PrimaryAttributes),
  [DTML.secondary]: validateSync(SecondaryAttributes),
  [DTML.success]  : validateSync(SuccessAttributes),
  [DTML.danger]   : validateSync(DangerAttributes),
  [DTML.link]     : validateSync(LinkAttributes),
  [DTML.premium]  : validateSync(PremiumAttributes),
};
