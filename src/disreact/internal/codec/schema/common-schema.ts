import {S} from '#src/internal/pure/effect.ts';



export const SnowFlake = S.String;
export const CustomId = S.String.pipe(S.maxLength(100));
export const BitField = S.String;
export const InteractionToken = S.Redacted(S.String);
export const Locale = S.String;
export const SelectValue = S.String.pipe(S.maxLength(100));
export const SelectDescription = S.String.pipe(S.maxLength(100));
export const SelectPlaceholder = S.String.pipe(S.maxLength(150));
export const Min_Length = S.Int;
export const Max_Length = S.Int;
