import {S} from '#src/internal/pure/effect.ts';
import {Any, Literal, maxLength, minLength, optional, type Schema, String, Struct, SymbolFromSelf} from 'effect/Schema';



export const TextKind      = Literal(0);
export const MarkdownKind  = Literal(1);
export const IntrinsicKind = Literal(2);
export const FunctionKind  = Literal(3);


export const SnowFlake          = S.String;
export const DisReactPointer    = SymbolFromSelf;
export const CustomId           = String;
export const ConformantCustomId = String.pipe(minLength(1), maxLength(100));
export const BitField           = S.String;
export const InteractionToken   = S.Redacted(S.String);
export const Locale             = S.String;

export const String1to100 = S.String.pipe(S.minLength(1), S.maxLength(100));
export const String1to80  = S.String.pipe(minLength(1), S.maxLength(80));

export const SelectLabel       = S.String.pipe(S.maxLength(100));
export const SelectValue       = S.String.pipe(S.maxLength(100));
export const SelectDescription = S.String.pipe(S.maxLength(100));
export const SelectPlaceholder = S.String.pipe(S.maxLength(150));
export const Min_Length        = S.Int;
export const Max_Length        = S.Int;


export const SkuId        = String.pipe(minLength(1), maxLength(34));
export const ButtonLabel  = String.pipe(minLength(1), maxLength(80));
export const EventHandler = Any;
export const EmojiStruct  = Struct({
  id      : optional(SnowFlake),
  name    : optional(String),
  animated: optional(S.Boolean),
});



export type DisReactPointer = Schema.Type<typeof DisReactPointer>;

export const RootId = String;

export const EMPTY     = '-';
export const EMPTY_NUM = 0;
export const CLOSE     = '.close';
