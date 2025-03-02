import {S} from '#src/internal/pure/effect.ts';
import {_Tag, NONE} from '#src/disreact/codec/common/index.ts';
import * as Message from '#src/disreact/codec/rest/route/message.ts';



const TAG    = _Tag.DIALOG;
const PREFIX = '/d/';
const EMPTY  = NONE;

export const T = S.mutable(S.Struct({
  _tag     : S.tag(TAG),
  root_id  : S.String,
  doken_id : S.optional(S.String),
  custom_id: S.optional(S.String),
  hash     : S.optional(S.String),
  message  : S.optional(S.mutable(Message.T)),
}));

export type T = S.Schema.Type<typeof T>;

export const is = (route: any): route is T => route._tag === TAG;

const Parsing = S.TemplateLiteralParser(
  PREFIX, S.String,
  '/', S.String,
  '/', S.String,
  '/', S.String,
);
const Encoder = S.encodeSync(Parsing);
const Decoder = S.decodeSync(Parsing);

export const isPrefix = (encoded: string) => encoded.startsWith(PREFIX);

export const encode = (route: T) => Encoder([
  PREFIX, route.root_id,
  '/', route.doken_id ?? EMPTY,
  '/', route.custom_id ?? EMPTY,
  '/', route.hash ?? EMPTY,
]);

export const decode = (route: string): T => {
  const [, root_id, , doken_id, , custom_id, , hash] = Decoder(route as never);

  const acc   = {} as T;
  acc._tag    = TAG;
  acc.root_id = root_id;

  if (doken_id !== EMPTY) acc.doken_id = doken_id;
  if (custom_id !== EMPTY) acc.custom_id = custom_id;
  if (hash !== EMPTY) acc.hash = hash;

  return acc;
};
