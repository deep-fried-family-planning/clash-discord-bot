import {_Tag, NONE} from '#src/disreact/codec/common/index.ts';
import * as FiberHash from '#src/disreact/codec/fiber/fiber-hash.ts';
import {DT, RDT, S} from '#src/internal/pure/effect.ts';



const TAG    = _Tag.MESSAGE;
const PREFIX = '/m/';
const EMPTY  = NONE;

export const T = S.mutable(S.Struct({
  _tag     : S.tag(TAG),
  root_id  : S.String,
  id       : S.optional(S.String),
  token    : S.optional(S.Redacted(S.String)),
  ephemeral: S.optional(S.Number),
  type     : S.optional(S.Number),
  ttl      : S.optional(S.DateTimeUtc),
  hash     : S.optional(S.String),
}));

export type T = S.Schema.Type<typeof T>;

export const is = (route: any): route is T => route._tag === TAG;



const Parsing = S.TemplateLiteralParser(
  PREFIX, S.String,
  '/', S.String,
  '/', S.String,
  '/', S.String,
  '/', S.String,
  '/', S.String,
  '/', S.String,
);

const Encoder = S.encodeSync(Parsing);
const Decoder = S.decodeSync(Parsing);

export const isPrefix = (encoded: string): boolean => encoded.startsWith(PREFIX);

export const encode = (route: T): string => Encoder([
  PREFIX, route.root_id,
  '/', route.id ?? EMPTY,
  '/', `${route.ephemeral ?? EMPTY}`,
  '/', `${route.type ?? EMPTY}`,
  '/', `${route.ttl?.epochMillis ?? EMPTY}`,
  '/', route.token ? RDT.value(route.token) : EMPTY,
  '/', route.hash ?? FiberHash.make(),
]);

export const decode = (route: string): T => {
  const [, root_id, , id, , ephemeral, , type, , ttl, , token, , hash] = Decoder(route as never);

  const acc = {
    _tag: TAG,
    root_id,
  } as T;

  if (id !== EMPTY) acc.id = id;
  if (ephemeral !== EMPTY) acc.ephemeral = parseInt(ephemeral);
  if (type !== EMPTY) acc.type = parseInt(type);
  if (ttl !== EMPTY) acc.ttl = DT.unsafeMake(parseInt(ttl));
  if (token !== EMPTY) acc.token = RDT.make(token);
  if (!FiberHash.isEmpty(hash)) acc.hash = hash;

  return acc;
};
