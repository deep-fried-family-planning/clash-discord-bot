import type {Schema} from 'effect/Schema';
import {Literal} from 'effect/Schema';

export const FRESH      = -1;
export const ENTRYPOINT = 0;
export const EPHEMERAL  = 1;

export const T = Literal(
  FRESH,
  ENTRYPOINT,
  EPHEMERAL,
);

export type T = Schema.Type<typeof T>;

export const isCompatible = (self: T, other: T) =>
  self === other ||
  (self === EPHEMERAL && other === FRESH) ||
  (self === ENTRYPOINT && other === FRESH);

export const encodeFlag = (self: T) => self === EPHEMERAL ? 64 : undefined;

export const decodeFlag = (flag?: number) => flag === 64 ? EPHEMERAL : ENTRYPOINT;
