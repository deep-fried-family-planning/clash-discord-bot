import {Literal} from 'effect/Schema';

export * as CallbackType from '#src/disreact/adaptor/codec/dapi/callback-type.ts';
export type CallbackType = never;

export const FRESH = 0 as const;
export const SOURCE = 4 as const;
export const UPDATE = 7 as const;
export const SOURCE_DEFER = 5 as const;
export const UPDATE_DEFER = 6 as const;
export const MODAL = 9 as const;

export const Fresh = Literal(FRESH);
export const Defer = Literal(SOURCE_DEFER, UPDATE_DEFER);
export const Spent = Literal(SOURCE, UPDATE);
export const Modal = Literal(MODAL);
export const All = Literal(FRESH, SOURCE, UPDATE, SOURCE_DEFER, UPDATE_DEFER, MODAL);

export const Message = Literal(SOURCE, UPDATE, SOURCE_DEFER, UPDATE_DEFER);

export type Fresh = typeof Fresh.Type;
export type Spent = typeof Spent.Type;
export type Defer = typeof Defer.Type;
export type All = typeof All.Type;

export const isDefer = (self: All): self is Defer =>
  self === SOURCE_DEFER ||
  self === UPDATE_DEFER;

export const isFresh = (self: All) =>
  self === FRESH;

export const isSpent = (self: All) =>
  self === SOURCE ||
  self === UPDATE ||
  self === MODAL;
