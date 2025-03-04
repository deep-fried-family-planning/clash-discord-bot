import {EMPTY, EMPTY_NUM, RootId} from '#src/disreact/codec/constants/common.ts';
import * as FiberHash from '#src/disreact/codec/fiber/fiber-hash.ts';
import * as Doken from '#src/disreact/codec/rest/doken.ts';
import {RDT} from '#src/internal/pure/effect.ts';
import {Redacted} from 'effect';
import {decodeSync, encodeSync, mutable, optional, type Schema, String, Struct, tag, TemplateLiteralParser} from 'effect/Schema';



const TAG    = 'MessageRoute';
const PREFIX = 'https://dffp.org/';

export const T = mutable(Struct({
  _tag   : tag(TAG),
  root_id: RootId,
  doken  : optional(Doken.T),
  hash   : FiberHash.T,
}));

export type T = Schema.Type<typeof T>;

const Parser = TemplateLiteralParser(
  PREFIX, RootId,
  '/', Doken.DokenId,
  '/', Doken.DokenType,
  '/', Doken.DokenEphemeral,
  '/', Doken.DokenTTL,
  '/', String,
  '/', FiberHash.T,
);

const Encoder = encodeSync(Parser);
const Decoder = decodeSync(Parser);

export const is = (self: any): self is T => self._tag === TAG;

export const encodeMessageRoute = (self: Omit<T, '_tag'>): string => {
  return Encoder([
    PREFIX, self.root_id,
    '/', self.doken?.id ?? EMPTY,
    '/', self.doken?.type ?? EMPTY_NUM,
    '/', self.doken?.ephemeral ?? EMPTY_NUM,
    '/', self.doken?.ttl ?? EMPTY_NUM,
    '/', self.doken?.value ? Redacted.value(self.doken.value) : EMPTY,
    '/', self.hash,
  ]);
};

export const decodeMessageRoute = (encoded: string): T => {
  const [, root_id, , dokenId, , dokenType, , dokenEphemeral, , dokenTTL, , dokenValue, , hash] = Decoder(encoded as never);

  const acc = {
    _tag: TAG,
    root_id,
    hash,
  } as T;

  if (
    dokenId !== EMPTY &&
    dokenType !== EMPTY_NUM &&
    dokenEphemeral !== EMPTY_NUM &&
    dokenTTL !== EMPTY_NUM
  ) {
    acc.doken = Doken.make({
      id       : dokenId,
      type     : dokenType,
      ephemeral: dokenEphemeral,
      ttl      : dokenTTL,
      value    : RDT.make(dokenValue),
    });
  }

  return acc;
};

export const encodeMessageRouteToURL = (self: Omit<T, '_tag'>, message: any) => {
  message.embeds ??= [];
  message.embeds[0] ??= {};
  message.embeds[0].image ??= {};
  message.embeds[0].image.url = encodeMessageRoute(self);
  return message;
};

export const decodeMessageRouteFromRequest = (request: any) => {
  const url = request.message?.embeds?.[0]?.image?.url;

  if (!url || !url.startsWith(PREFIX)) {
    return undefined;
  }

  return decodeMessageRoute(url);
};
