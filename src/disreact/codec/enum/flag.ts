/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import {Literal} from 'effect/Schema';



export const FRESH   = 0 as const;
export const PUBLIC  = 1 as const;
export const PRIVATE = 2 as const;

export const Fresh   = Literal(FRESH);
export const Public  = Literal(PUBLIC);
export const Private = Literal(PRIVATE);
export const Defined = Literal(FRESH, PUBLIC);
export const All     = Literal(FRESH, PUBLIC, PRIVATE);

export type Fresh = typeof Fresh.Type;
export type Public = typeof Public.Type;
export type Private = typeof Private.Type;
export type Defined = typeof Defined.Type;
export type All = typeof All.Type;
