import {EMPTY, EMPTY_NUM, RootId} from '#src/disreact/codec/constants/common.ts';
import * as FiberHash from '#src/disreact/codec/fiber/fiber-hash.ts';
import {Redacted} from 'effect';
import {decodeSync, encodeSync, mutable, optional, type Schema, Struct, tag, TemplateLiteralParser} from 'effect/Schema';
import * as Doken from 'src/disreact/codec/route/doken.ts';



const TAG = 'MessageRoute';

const PREFIX = 'https://dffp.org/';

export const T = mutable(Struct({
  _tag   : tag(TAG),
  root_id: RootId,
  doken  : optional(Doken.Doken),
  hash   : FiberHash.T,
}));

export type T = Schema.Type<typeof T>;

const Parser = TemplateLiteralParser(
  PREFIX, RootId,
  '/', Doken.DokenId,
  '/', Doken.DokenType,
  '/', Doken.DokenEphemeral,
  '/', Doken.DokenTTL,
  '/', Doken.DokenValue,
  '/', FiberHash.T,
);

const Encoder = encodeSync(Parser);
const Decoder = decodeSync(Parser);

export const is = (self: any): self is T => self._tag === TAG;

export const encodeMessageRoute = (self: T): string => {
  return Encoder([
    PREFIX, self.root_id,
    '/', self.doken?.id ?? EMPTY,
    '/', self.doken?.type ?? EMPTY_NUM,
    '/', self.doken?.ephemeral ?? EMPTY_NUM,
    '/', self.doken?.ttl ?? EMPTY_NUM,
    '/', self.doken?.value ?? Redacted.make(EMPTY),
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
      value    : dokenValue,
    });
  }

  return acc;
};

export const encodeMessageRouteToURL = (self: T, message: any) => {
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
