import {S} from '#src/internal/pure/effect.ts';
import {Int, optional, transform, String, Boolean, maxLength, Redacted, DateTimeUtcFromNumber, NumberFromString, Number, Array} from 'effect/Schema';



export const SnowFlake = String;
export const CustomId = String.pipe(maxLength(100));
export const BitField = String;
export const InteractionToken = Redacted(String);
export const Locale = String;
export const SelectValue = String.pipe(maxLength(100));
export const SelectDescription = String.pipe(maxLength(100));
export const SelectPlaceholder = String.pipe(maxLength(150));
export const Min_Length = Int;
export const Max_Length = Int;



export const Bool = Boolean;
export const Str = String;
export const Num = Number;
export {Int};
export const Arr = Array;


export const OptBoolean = optional(Boolean);
export const OptInt = optional(Int);
export const OptString = optional(String);


export const OptCustomId = optional(CustomId);


export const DateTimeUtcFromNumberFromString = transform(
  NumberFromString,
  DateTimeUtcFromNumber,
  {
    decode: (num, str) => num,
    encode: (num, utc) => num,
    strict: true,
  },
);


export const tempAny = () => ({} as any);
