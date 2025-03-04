import {EMPTY, EMPTY_NUM, RootId} from '#src/disreact/codec/constants/common.ts';
import * as FiberHash from '#src/disreact/codec/fiber/fiber-hash.ts';
import {Redacted} from 'effect';
import {decodeSync, encodeSync, mutable, optional, type Schema, Struct, tag, TemplateLiteralParser} from 'effect/Schema';
import * as Doken from './doken.ts';



const MESSAGE_ROUTE_TAG = 'MessageRoute';

const MESSAGE_ROUTE_PREFIX = 'https://dffp.org/';

export const MessageRoute = mutable(Struct({
  _tag   : tag(MESSAGE_ROUTE_TAG),
  root_id: RootId,
  doken  : optional(Doken.Doken),
  hash   : FiberHash.T,
}));

export type MessageRoute = Schema.Type<typeof MessageRoute>;

const MessageRouteParser = TemplateLiteralParser(
  MESSAGE_ROUTE_PREFIX, RootId,
  '/', Doken.DokenId,
  '/', Doken.DokenType,
  '/', Doken.DokenEphemeral,
  '/', Doken.DokenTTL,
  '/', Doken.DokenValue,
  '/', FiberHash.T,
);

const Encoder = encodeSync(MessageRouteParser);
const Decoder = decodeSync(MessageRouteParser);

export const isMessageRoute = (self: any): self is MessageRoute => self._tag === MESSAGE_ROUTE_TAG;

export const encodeMessageRoute = (self: MessageRoute): string => {
  return Encoder([
    MESSAGE_ROUTE_PREFIX, self.root_id,
    '/', self.doken?.id ?? EMPTY,
    '/', self.doken?.type ?? EMPTY_NUM,
    '/', self.doken?.ephemeral ?? EMPTY_NUM,
    '/', self.doken?.ttl ?? EMPTY_NUM,
    '/', self.doken?.value ?? Redacted.make(EMPTY),
    '/', self.hash,
  ]);
};

export const decodeMessageRoute = (encoded: string): MessageRoute => {
  const [, root_id, , dokenId, , dokenType, , dokenEphemeral, , dokenTTL, , dokenValue, , hash] = Decoder(encoded as never);

  const acc = {
    _tag: MESSAGE_ROUTE_TAG,
    root_id,
    hash,
  } as MessageRoute;

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

export const encodeMessageRouteToURL = (self: MessageRoute, message: any) => {
  message.embeds ??= [];
  message.embeds[0] ??= {};
  message.embeds[0].image ??= {};
  message.embeds[0].image.url = encodeMessageRoute(self);
  return message;
};

export const decodeMessageRouteFromRequest = (request: any) => {
  const url = request.message?.embeds?.[0]?.image?.url;

  if (!url || !url.startsWith(MESSAGE_ROUTE_PREFIX)) {
    return undefined;
  }

  return decodeMessageRoute(url);
};
