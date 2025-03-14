import {String} from 'effect/Schema';



export const SnowFlake      = String;

export const RootId = String;
export const FullId = String;

export type SnowFlake = typeof SnowFlake.Type;
export type RootId = typeof RootId.Type;
export type FullId = typeof FullId.Type;
