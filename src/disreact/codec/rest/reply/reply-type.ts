import {InteractionCallbackType} from 'dfx/types';
import type {Schema} from 'effect/Schema';
import {Literal} from 'effect/Schema';



export const FRESH        = -1;
export const OPEN_MODAL   = InteractionCallbackType.MODAL;
export const SOURCE_DEFER = InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE;
export const SOURCE       = InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE;
export const UPDATE_DEFER = InteractionCallbackType.DEFERRED_UPDATE_MESSAGE;
export const UPDATE       = InteractionCallbackType.UPDATE_MESSAGE;

export const T = Literal(
  FRESH,
  OPEN_MODAL,
  SOURCE_DEFER,
  SOURCE,
  UPDATE_DEFER,
  UPDATE,
);

export type T = Schema.Type<typeof T>;

export const isCompatible = (self: T, other: T) =>
  self === other ||
  (self === OPEN_MODAL && other === FRESH) ||
  (self === SOURCE_DEFER && other === FRESH) ||
  (self === UPDATE_DEFER && other === FRESH);

export const isDefer = (self: T) =>
  self === FRESH ||
  self === UPDATE_DEFER ||
  self === SOURCE_DEFER;

export const isSource = (self: T) =>
  self === FRESH ||
  self === SOURCE ||
  self === SOURCE_DEFER;

export const isUpdate = (self: T) =>
  self === FRESH ||
  self === UPDATE ||
  self === UPDATE_DEFER;
