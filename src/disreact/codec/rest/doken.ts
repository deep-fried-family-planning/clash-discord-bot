import type * as DialogParams from '#src/disreact/codec/rest/params-modal.ts';
import type * as EmbedParams from '#src/disreact/codec/rest/params-embed.ts';
import {Redacted} from 'effect';
import {mutable, Number, RedactedFromSelf, type Schema, String, Struct} from 'effect/Schema';



export const DokenId        = String;
export const DokenType      = Number;
export const DokenEphemeral = Number;
export const DokenTTL       = Number;
export const DokenValue     = RedactedFromSelf(String);

const TYPE_FRESH      = -1;
const EPHEMERAL_FRESH = -1;
const PUBLIC          = 0;
const EPHEMERAL       = 1;
const VALUE_PARTIAL   = 'partial';

export const T = mutable(Struct({
  id       : DokenId,
  type     : DokenType,
  ephemeral: DokenEphemeral,
  ttl      : DokenTTL,
  value    : DokenValue,
}));

export type T = Schema.Type<typeof T>;

export const isFreshDoken     = (doken: T): boolean => doken.type === TYPE_FRESH;
export const isEphemeralDoken = (doken: T): boolean => doken.ephemeral === EPHEMERAL;
export const isPublicDoken    = (doken: T): boolean => doken.type === PUBLIC;
export const isActiveDoken    = (doken: T): boolean => doken.ttl > Date.now();
export const isPartialDoken   = (doken: T): boolean => Redacted.value(doken.value) === VALUE_PARTIAL;

export const make = (params: T): T => params;

export const makeFreshDoken = (request: any): T => ({
  id       : request.id,
  type     : TYPE_FRESH,
  ephemeral: EPHEMERAL_FRESH,
  ttl      : Date.now() + 2000,
  value    : Redacted.make(request.token),
});

export const makeDeferred = (self: T): T => {
  self.ttl = Date.now() + 12 * 60 * 1000;
  return self;
};

export const makePartialDoken = (params: Omit<T, 'value'>): T => ({
  ...params,
  value: Redacted.make(VALUE_PARTIAL),
});

export const makeDokenFromDialogParams = (params: DialogParams.T): T | undefined => {
  if (params.message) {
    return makeDokenFromEmbedParams(params.message);
  }
  return undefined;
};

export const makeDokenFromEmbedParams = (params: EmbedParams.T): T | undefined => {
  if (params.doken) {
    return make(params.doken);
  }
  return undefined;
};

export const TMemory = mutable(Struct({
  id       : DokenId,
  type     : DokenType,
  ephemeral: DokenEphemeral,
  ttl      : DokenTTL,
  value    : String,
}));

export type TMemory = Schema.Type<typeof TMemory>;

export const encodeMemory = (self: T): TMemory => {
  return {
    ...self,
    value: Redacted.value(self.value),
  };
};

export const decodeMemory = (encoded: TMemory): T | null => {
  const decoded = {
    ...encoded,
    value: Redacted.make(encoded.value),
  };

  if (isActiveDoken(decoded)) {
    return decoded;
  }

  return null;
};
