import * as all from '#src/disreact/codec/constants/all.ts';
import * as dfmd from '#src/disreact/codec/constants/dfmd.ts';
import * as dtml from '#src/disreact/codec/constants/dtml.ts';
import {children, key, onautocomplete, onclick, ondeselect, oninvoke, onselect, onsubmit, ref} from '#src/disreact/codec/constants/reserved.ts';
import * as reserved from '#src/disreact/codec/constants/reserved.ts';

export * as Reserved from '#src/disreact/codec/constants/reserved.ts';
export * as DFMD from '#src/disreact/codec/constants/dfmd.ts';
export * as DTML from '#src/disreact/codec/constants/dtml.ts';
export * as All from '#src/disreact/codec/constants/all.ts';
export * as Schema from '#src/disreact/codec/constants/common.ts';

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

export const RESERVED = [
  onclick,
  onselect,
  ondeselect,
  onsubmit,
  oninvoke,
  onautocomplete,
  children,
  ref,
  key,
];
