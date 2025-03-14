import {RDT} from '#src/internal/pure/effect.ts';
import {Number, Redacted, String} from 'effect/Schema';



export const DLM = '/';
export const PROTOCOL = 'https://';
export const Domain = String;

export const CustomId = String;

export const HashString = String;

export const SNOWFLAKE_NONE = '';
export const SnowFlake = String;
export const isNoneSnowFlake = (id: SnowFlake): boolean => id === SNOWFLAKE_NONE;

export const RootId = String;

export const HIDDEN_NONE = '-';
export const HiddenValue = String;
export const Hidden = Redacted(HiddenValue);
export const isHiddenNone = (h: Hidden) => RDT.value(h) === HIDDEN_NONE;

export const EpochMs = Number;

export type SnowFlake = typeof SnowFlake.Type;
export type RootId = typeof RootId.Type;
export type Hidden = typeof Hidden.Type;
