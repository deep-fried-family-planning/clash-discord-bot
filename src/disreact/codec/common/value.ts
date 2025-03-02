import {S} from '#src/internal/pure/effect.ts';



export const SnowFlake          = S.String;
export const DisReactPointer    = S.SymbolFromSelf;
export const CustomId           = S.String;
export const ConformantCustomId = S.String.pipe(S.minLength(1), S.maxLength(100));
export const BitField           = S.String;
export const InteractionToken   = S.Redacted(S.String);
export const Locale             = S.String;
export const String1to100       = S.String.pipe(S.minLength(1), S.maxLength(100));
export const String1to80        = S.String.pipe(S.minLength(1), S.maxLength(80));
export const SelectLabel        = S.String.pipe(S.maxLength(100));
export const SelectValue        = S.String.pipe(S.maxLength(100));
export const SelectDescription  = S.String.pipe(S.maxLength(100));
export const SelectPlaceholder  = S.String.pipe(S.maxLength(150));
export const Min_Length         = S.Int;
export const Max_Length         = S.Int;
export const SkuId              = S.String.pipe(S.minLength(1), S.maxLength(34));
export const ButtonLabel        = S.String.pipe(S.minLength(1), S.maxLength(80));
export const EventHandler       = S.Any;
export const EmojiStruct        = S.Struct({
  id      : S.optional(SnowFlake),
  name    : S.optional(S.String),
  animated: S.optional(S.Boolean),
});
export type DisReactPointer = S.Schema.Type<typeof DisReactPointer>;
