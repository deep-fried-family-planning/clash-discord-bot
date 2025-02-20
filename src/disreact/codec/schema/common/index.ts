import * as all from './all.ts';
import * as dfmd from './dfmd.ts';
import * as dtml from './dtml.ts';
import * as reserved from './reserved.ts';

export * as Reserved from './reserved.ts';
export * as DFMD from './dfmd.ts';
export * as DTML from './dtml.ts';
export * as All from './all.ts';

export type DFMD = typeof dfmd;
export type DTML = typeof dtml;
export type All = typeof all;
export type Reserved = typeof reserved;

export const isKnownConstant     = (str: string): str is keyof All => str in all;
export const isMarkupTag         = (str: string): str is keyof DTML => str in dtml;
export const isMarkdownTag       = (str: string): str is keyof DFMD => str in dfmd;
export const isReservedAttribute = (str: string): str is keyof Reserved => str in reserved;

const inf = Infinity;
// |  |
// | --- |
//
// let λ, φ, τ, π;
