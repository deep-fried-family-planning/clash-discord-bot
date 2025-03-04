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

export const Doken = mutable(Struct({
  id       : DokenId,
  type     : DokenType,
  ephemeral: DokenEphemeral,
  ttl      : DokenTTL,
  value    : DokenValue,
}));

export type Doken = Schema.Type<typeof Doken>;

export const isFreshDoken     = (doken: Doken): boolean => doken.type === TYPE_FRESH;
export const isEphemeralDoken = (doken: Doken): boolean => doken.ephemeral === EPHEMERAL;
export const isPublicDoken    = (doken: Doken): boolean => doken.type === PUBLIC;
export const isActiveDoken    = (doken: Doken): boolean => doken.ttl > Date.now();
export const isPartialDoken   = (doken: Doken): boolean => Redacted.value(doken.value) === VALUE_PARTIAL;

export const make = (params: Doken): Doken => params;

export const makeFreshDoken = (request: any): Doken => ({
  id       : request.id,
  type     : TYPE_FRESH,
  ephemeral: EPHEMERAL_FRESH,
  ttl      : Date.now() + 2000,
  value    : Redacted.make(request.token),
});

export const makePartialDoken = (params: Omit<Doken, 'value'>): Doken => ({
  ...params,
  value: Redacted.make(VALUE_PARTIAL),
});
