import * as all from '#src/disreact/codec/common/all.ts';
import * as dfmd from '#src/disreact/codec/common/dfmd.ts';
import * as dtml from '#src/disreact/codec/common/dtml.ts';
import * as reserved from '#src/disreact/codec/common/attr.ts';

export * as _Tag from './_tag.ts';
export * as Reserved from '#src/disreact/codec/common/attr.ts';
export * as DFMD from '#src/disreact/codec/common/dfmd.ts';
export * as DTML from '#src/disreact/codec/common/dtml.ts';
export * as All from '#src/disreact/codec/common/all.ts';
export * as Schema from '#src/disreact/codec/common/value.ts';

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

export const NONE     = '-';
export const UNSET = '';
export const NONE_INT = -0;
export const DASH3    = '---';
export const ZERO     = 0;
export const CLOSE    = '.close';
